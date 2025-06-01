import { inject, Injectable, signal } from '@angular/core';
import {
  Exercise,
  ExerciseEntryData,
  FractionalSetRatio,
  Metric,
} from '../models';
import {
  CapacitorSQLite,
  capSQLiteChanges,
  DBSQLiteValues,
  SQLiteConnection,
  SQLiteDBConnection,
} from '@capacitor-community/sqlite';
import { firstValueFrom, from, lastValueFrom, Observable } from 'rxjs';
import { PredefinedDataService } from './predefined-data.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  predefinedDataService = inject(PredefinedDataService);
  toastService = inject(ToastService);

  DB_NAME = 'FITNESS_DB';

  sqlite: SQLiteConnection = new SQLiteConnection(CapacitorSQLite);
  db!: SQLiteDBConnection;

  tableNames = ['EXERCISE', 'METRIC', 'EXERCISE_ENTRY', 'METRIC_ENTRY'];
  constructor() {}

  async clearDb() {
    // only for debug and dev
    this.tableNames.forEach(async (tableName) => {
      await this.db.execute(`DROP TABLE IF EXISTS ${tableName}`);
    });
  }

  async initializeDb() {
    this.db = await this.sqlite.createConnection(
      this.DB_NAME,
      false,
      'no-encryption',
      1,
      false
    );

    await this.db.open();
    await this.db.execute(`PRAGMA foreign_keys = ON;`);
    //await this.clearDb(); // TODO remove before release
    await this.createTables();

    await this.populateInitialDb();
    await this.showAllEntryData();
  }

  async createTables() {
    const exerciseSchema = `CREATE TABLE IF NOT EXISTS EXERCISE (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      NAME STRING NOT NULL UNIQUE,
      UNIT STRING NOT NULL,
      MUSCLES_HIT TEXT NOT NULL
    );`;
    const metricSchema = `CREATE TABLE IF NOT EXISTS METRIC (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      NAME STRING NOT NULL UNIQUE,
      UNIT STRING NOT NULL,
      IS_NUMERIC INTEGER NOT NULL,
      HIDDEN INTEGER
    );`; // hidden is for system metrics, like calories, macros, cannot be set by user directly

    const exerciseEntrySchema = `CREATE TABLE IF NOT EXISTS EXERCISE_ENTRY (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      EXERCISE_ID INTEGER NOT NULL,
      TIMESTAMP INTEGER NOT NULL,
      SETS TEXT NOT NULL,
      NOTE STRING,
      UNIQUE (EXERCISE_ID, TIMESTAMP),
      FOREIGN KEY (EXERCISE_ID) REFERENCES EXERCISE(ID) ON DELETE CASCADE
    );`;

    const metricEntrySchema = `CREATE TABLE IF NOT EXISTS METRIC_ENTRY (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      METRIC_ID INTEGER NOT NULL,
      TIMESTAMP INTEGER NOT NULL,
      ENTRY STRING NOT NULL,
      NOTE STRING,
      UNIQUE (METRIC_ID, TIMESTAMP),
      FOREIGN KEY (METRIC_ID) REFERENCES METRIC(ID) ON DELETE CASCADE
    );`;

    const muscleSchema = `CREATE TABLE IF NOT EXISTS MUSCLE (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      NAME STRING NOT NULL UNIQUE
    );`;

    await this.db.execute(exerciseSchema);
    await this.db.execute(metricSchema);
    await this.db.execute(exerciseEntrySchema);
    await this.db.execute(metricEntrySchema);
    await this.db.execute(muscleSchema);
  }

  async checkTableEmpty(tableName: string): Promise<boolean> {
    const res = await this.db.query(`SELECT * FROM ${tableName} LIMIT 1`);

    if (res.values && res.values?.length > 0) {
      return false;
    }
    return true;
  }

  async populateInitialDb() {
    // prepopulated metrics like bodyweight, calories, etc
    // only to be run when all tables are empty (first time starting)

    const emptyStatuses = await Promise.all(
      this.tableNames.map((name) => this.checkTableEmpty(name))
    );
    const allEmpty = emptyStatuses.every((status) => status);

    if (allEmpty) {
      try {
        const data = await firstValueFrom(
          this.predefinedDataService.getPredefinedData()
        );

        const muscleNamesList: Array<string> = data['MUSCLE'];
        const musclePromises = muscleNamesList.map((muscle: string) =>
          this.db.run('INSERT OR IGNORE INTO MUSCLE (NAME) VALUES (?);', [
            muscle,
          ])
        );
        await Promise.all(musclePromises);
        let muscleNameToIdMap = new Map<string, number>();
        await Promise.all(
          muscleNamesList.map(async (name) => {
            const result = await this.getMuscleIdFromName(name);
            const muscleId: number = (result.values ?? [{ ID: 0 }])[0]['ID']; // always returns
            muscleNameToIdMap.set(name, muscleId);
          })
        );

        data['EXERCISE'].forEach(
          (exercise: {
            name: string;
            unit: string;
            musclesHit: Array<any>;
          }) => {
            let newArr: Array<FractionalSetRatio> = [];
            exercise.musclesHit.forEach(
              (setRatio: { muscleName: string; ratio: number }) => {
                const id = muscleNameToIdMap.get(setRatio.muscleName) ?? -1;
                newArr.push({
                  muscleId: id,
                  ratio: setRatio.ratio,
                });
              }
            );
            exercise.musclesHit = newArr;
          }
        );

        const metricPromises = data['METRIC'].map((metric: Metric) =>
          this.db.run(
            'INSERT OR IGNORE INTO METRIC (NAME, UNIT, IS_NUMERIC, HIDDEN) VALUES (?, ?, ?, ?);',
            [metric.name, metric.unit, metric.isNumeric, metric.hidden]
          )
        );

        const exercisePromises = data['EXERCISE'].map((exercise: Exercise) =>
          this.db.run(
            'INSERT OR IGNORE INTO EXERCISE (NAME, UNIT, MUSCLES_HIT) VALUES (?, ?, ?);',
            [exercise.name, exercise.unit, JSON.stringify(exercise.musclesHit)]
          )
        );

        await Promise.all([...metricPromises, ...exercisePromises]);
      } catch (err) {
        this.toastService.showToast('Error fetching predefined data!');
      }
    }
  }

  async showAllEntryData() {
    // for debug only
    const exData = await this.db.query('SELECT * FROM EXERCISE;');
    const exEntryData = await this.db.query('SELECT * FROM EXERCISE_ENTRY;');
    const metricEntryData = await this.db.query('SELECT * FROM METRIC_ENTRY;');

    console.log('EXERCISE');
    console.log(exData.values);
    console.log('EXERCISE ENTRIES');
    console.log(exEntryData.values);
    console.log('METRIC ENTRIES');
    console.log(metricEntryData.values);
  }
  getExerciseNameList(
    searchTerm?: string,
    muscleName?: string | null
  ): Observable<DBSQLiteValues> {
    if (!searchTerm) {
      searchTerm = '';
    }
    if (muscleName) {
      return from(
        this.db.query(
          `SELECT EXERCISE.NAME FROM EXERCISE, JSON_EACH(EXERCISE.MUSCLES_HIT) AS JS WHERE LOWER(EXERCISE.NAME) LIKE '%' || LOWER(?) || '%' AND LOWER(JSON_EXTRACT(JS.value,'$.muscleName')) = LOWER(?) ORDER BY LOWER(EXERCISE.NAME) ASC;`,
          [searchTerm, muscleName]
        )
      );
    } else {
      return from(
        this.db.query(
          `SELECT EXERCISE.NAME FROM EXERCISE WHERE LOWER(EXERCISE.NAME) LIKE '%' || LOWER(?) || '%' ORDER BY LOWER(EXERCISE.NAME) ASC;`,
          [searchTerm]
        )
      );
    }
  }

  getMetricNameList(
    searchTerm?: string,
    showHidden: boolean = false
  ): Observable<DBSQLiteValues> {
    if (!searchTerm) {
      searchTerm = '';
    }

    if (showHidden) {
      return from(
        this.db.query(
          "SELECT NAME FROM METRIC WHERE LOWER(NAME) LIKE '%' || LOWER(?) || '%' ORDER BY LOWER(NAME) ASC;",
          [searchTerm]
        )
      );
    } else {
      return from(
        this.db.query(
          "SELECT NAME FROM METRIC WHERE LOWER(NAME) LIKE '%' || LOWER(?) || '%' AND (HIDDEN IS NULL OR HIDDEN = 0)  ORDER BY LOWER(NAME) ASC;",
          [searchTerm]
        )
      );
    }
  }

  getMuscleNameList(): Observable<DBSQLiteValues> {
    return from(
      this.db.query('SELECT NAME FROM MUSCLE ORDER BY LOWER(NAME) ASC;')
    );
  }

  addExercise() {}

  updateExercise() {}

  getExistingExerciseEntry(exId: number, dayTS: number) {
    return from(
      this.db.query(
        'SELECT * FROM EXERCISE_ENTRY WHERE EXERCISE_ID = ? AND TIMESTAMP = ?;',
        [exId, dayTS]
      )
    );
  }

  async getMuscleIdFromName(muscleName: string) {
    return await this.db.query('SELECT ID FROM MUSCLE WHERE NAME = ?;', [
      muscleName,
    ]);
  }

  saveExerciseEntry(exData: ExerciseEntryData): Observable<capSQLiteChanges> {
    return from(
      this.db.run(
        'INSERT OR REPLACE INTO EXERCISE_ENTRY (EXERCISE_ID, TIMESTAMP, SETS, NOTE) VALUES (?,?,?,?);',
        [
          exData.exerciseId,
          exData.timestamp,
          JSON.stringify(exData.sets),
          exData.note,
        ]
      )
    );
  }

  getLastExerciseEntrySet(exId: number) {
    // for view in exercise entry
    const todayTS = new Date().setHours(0, 0, 0, 0).valueOf();
    return from(
      this.db.query(
        'SELECT SETS FROM EXERCISE_ENTRY WHERE EXERCISE_ID = ? AND TIMESTAMP != ? ORDER BY TIMESTAMP DESC LIMIT 1',
        [exId, todayTS]
      )
    );
  }
  getRecentExerciseEntrySets(exId: number, recentCount: number = 30) {
    // for view in exercise entry
    const todayTS = new Date().setHours(0, 0, 0, 0).valueOf();
    return from(
      this.db.query(
        'SELECT SETS FROM EXERCISE_ENTRY WHERE EXERCISE_ID = ?  AND TIMESTAMP != ? ORDER BY TIMESTAMP DESC LIMIT ?',
        [exId, todayTS, recentCount]
      )
    );
  }

  getAllExerciseEntrySets(exId: number) {
    // for view in exercise entry
    // ascending since graph should start from first
    return from(
      this.db.query(
        'SELECT SETS FROM EXERCISE_ENTRY WHERE EXERCISE_ID = ? ORDER BY TIMESTAMP ASC',
        [exId]
      )
    );
  }
  getLastExerciseEntryNote(exId: number) {
    const todayTS = new Date().setHours(0, 0, 0, 0).valueOf();
    return from(
      this.db.query(
        "SELECT NOTE FROM EXERCISE_ENTRY WHERE EXERCISE_ID = ? AND NOTE != '' AND NOTE IS NOT NULL AND TIMESTAMP != ? ORDER BY TIMESTAMP DESC LIMIT 1",
        [exId, todayTS]
      )
    );
  }
  getRecentExerciseEntry(exId: number, recentCount: number) {
    // list is reversed since graph should start from first
    const res = this.db.query(
      'SELECT * FROM EXERCISE_ENTRY WHERE EXERCISE_ID = ? ORDER BY TIMESTAMP DESC LIMIT ?',
      [exId, recentCount]
    );
    const reversedRes = res.then((sqlResults) => {
      sqlResults.values?.reverse();
    });
    return from(reversedRes);
  }
  getAllExerciseEntryByTimeWindow(
    exId: number,
    startTS: number,
    endTS: number
  ) {
    return from(
      this.db.query(
        'SELECT * FROM EXERCISE_ENTRY WHERE EXERCISE_ID = ? AND TIMESTAMP BETWEEN ? AND ? ORDER BY TIMESTAMP ASC',
        [exId, startTS, endTS]
      )
    );
  }

  getTodaysMetric(metricId: number) {
    const todayTS = new Date().setHours(0, 0, 0, 0).valueOf();
    return from(
      this.db.query(
        'SELECT * FROM METRIC_ENTRY WHERE METRIC_ID = ? AND TIMESTAMP = ?',
        [metricId, todayTS]
      )
    );
  }
  saveMetricEntry(metricId: number, data: string, note: string) {
    const todayTS = new Date().setHours(0, 0, 0, 0).valueOf();
    return from(
      this.db.run(
        'INSERT OR REPLACE INTO METRIC_ENTRY (METRIC_ID, ENTRY, NOTE, TIMESTAMP) VALUES (?,?,?,?);',
        [metricId, data, note, todayTS]
      )
    );
  }
  deleteMetricEntry(metricId: number, timestamp: number) {
    return from(
      this.db.run(
        'DELETE FROM METRIC_ENTRY WHERE METRIC_ID = ? AND TIMESTAMP = ?',
        [metricId, timestamp]
      )
    );
  }
  deleteExerciseEntry(exerciseId: number, timestamp: number) {
    return from(
      this.db.run(
        'DELETE FROM EXERCISE_ENTRY WHERE EXERCISE_ID = ? AND TIMESTAMP = ?',
        [exerciseId, timestamp]
      )
    );
  }

  getMetricByName(metricName: string) {
    return from(
      this.db.query('SELECT * FROM METRIC WHERE LOWER(NAME) = ?;', [
        metricName.toLowerCase(),
      ])
    );
  }
  getMetricById(metricId: number) {
    return from(
      this.db.query('SELECT * FROM METRIC WHERE ID = ?;', [metricId])
    );
  }
  getExerciseByName(exerciseName: string) {
    return from(
      this.db.query('SELECT * FROM EXERCISE WHERE LOWER(NAME) = ?;', [
        exerciseName.toLowerCase(),
      ])
    );
  }
  getExerciseById(exerciseId: number) {
    return from(
      this.db.query('SELECT * FROM EXERCISE WHERE ID = ?;', [exerciseId])
    );
  }

  saveMetricMetadata(metric: Metric) {
    if (metric.id) {
      return from(
        this.db.run(
          'UPDATE METRIC SET NAME = ?, IS_NUMERIC = ?, UNIT = ? WHERE ID = ?;',
          [metric.name, metric.isNumeric, metric.unit, metric.id]
        )
      );
    } else {
      console.log('new insert');
      return from(
        this.db.run(
          'INSERT INTO METRIC (NAME, IS_NUMERIC, UNIT) VALUES (?,?,?);',
          [metric.name, metric.isNumeric, metric.unit]
        )
      );
    }
  }
  saveExerciseMetadata(exercise: Exercise) {
    if (exercise.id) {
      return from(
        this.db.run(
          'UPDATE EXERCISE SET NAME = ?, UNIT = ?, MUSCLES_HIT = ? WHERE ID = ?;',
          [
            exercise.name,
            exercise.unit,
            JSON.stringify(exercise.musclesHit),
            exercise.id,
          ]
        )
      );
    } else {
      return from(
        this.db.run(
          'INSERT INTO EXERCISE (NAME, UNIT, MUSCLES_HIT) VALUES (?, ?, ?);',
          [exercise.name, exercise.unit, JSON.stringify(exercise.musclesHit)]
        )
      );
    }
  }

  deleteMetricMetadata(metricId: number) {
    return from(this.db.run('DELETE FROM METRIC WHERE ID = ?;', [metricId]));
  }
}
