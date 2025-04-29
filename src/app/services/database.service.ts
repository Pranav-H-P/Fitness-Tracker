import { inject, Injectable, signal } from '@angular/core';
import { Exercise, ExerciseEntryData, Metric } from '../models';
import {
  CapacitorSQLite,
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
    await this.clearDb(); // remove before release
    await this.createTables();

    await this.populateInitialDb();
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
      IS_NUMERIC INTEGER NOT NULL
    );`;

    const exerciseEntrySchema = `CREATE TABLE IF NOT EXISTS EXERCISE_ENTRY (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      EXERCISE_NAME STRING NOT NULL UNIQUE,
      TIMESTAMP INTEGER NOT NULL,
      SETS TEXT NOT NULL,
      NOTE STRING
    );`;

    const metricEntrySchema = `CREATE TABLE IF NOT EXISTS METRIC_ENTRY (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      METRIC_NAME STRING NOT NULL UNIQUE,
      TIMESTAMP INTEGER NOT NULL,
      ENTRY STRING NOT NULL,
      NOTE STRING
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
    console.log('creating done');
  }

  async checkTableEmpty(tableName: string): Promise<boolean> {
    const res = await this.db.query(`SELECT * FROM ${tableName} LIMIT 1`);
    console.log(res.values);
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
    console.log(emptyStatuses);

    if (allEmpty) {
      try {
        const data = await firstValueFrom(
          this.predefinedDataService.getPredefinedData()
        );
        const metricPromises = data['METRIC'].map((metric: Metric) =>
          this.db.run(
            'INSERT OR IGNORE INTO METRIC (NAME, UNIT, IS_NUMERIC) VALUES (?, ?, ?);',
            [metric.name, metric.unit, metric.isNumeric]
          )
        );

        const musclePromises = data['MUSCLE'].map((muscle: string) =>
          this.db.run('INSERT OR IGNORE INTO MUSCLE (NAME) VALUES (?);', [
            muscle,
          ])
        );

        const exercisePromises = data['EXERCISE'].map((exercise: Exercise) =>
          this.db.run(
            'INSERT OR IGNORE INTO EXERCISE (NAME, UNIT, MUSCLES_HIT) VALUES (?, ?, ?);',
            [exercise.name, exercise.unit, JSON.stringify(exercise.musclesHit)]
          )
        );

        await Promise.all([
          ...metricPromises,
          ...musclePromises,
          ...exercisePromises,
        ]);

        console.log(data['EXERCISE']);
        console.log('populating done');
      } catch (err) {
        this.toastService.showToast('Error fetching predefined data!');
        console.log('populating done', err);
      }
    }
  }

  getExerciseNameList(
    searchTerm?: string,
    muscleName?: string | null
  ): Observable<DBSQLiteValues> {
    console.log('fetching ex list');

    (async () => {
      const t1 = await this.db.query(`SELECT * FROM EXERCISE;`);
      const t2 = await this.db.query(
        `SELECT * FROM EXERCISE, JSON_EACH(EXERCISE.MUSCLES_HIT);`
      );

      console.log(t1);
      console.log(t2);
    })();

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

  getMetricNameList(searchTerm?: string): Observable<DBSQLiteValues> {
    if (!searchTerm) {
      searchTerm = '';
    }
    return from(
      this.db.query(
        "SELECT NAME FROM METRIC WHERE LOWER(NAME) LIKE '%' || LOWER(?) || '%' ORDER BY LOWER(NAME) ASC;",
        [searchTerm]
      )
    );
  }

  getMuscleNameList(): Observable<DBSQLiteValues> {
    return from(
      this.db.query('SELECT NAME FROM MUSCLE ORDER BY LOWER(NAME) ASC;')
    );
  }

  addExercise() {}

  updateExercise() {}

  saveExerciseEntry(exData: ExerciseEntryData) {}
}
