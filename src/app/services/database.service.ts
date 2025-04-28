import { Injectable, signal } from '@angular/core';
import { Exercise, ExerciseEntryData, Metric } from '../models';
import {
  CapacitorSQLite,
  capSQLiteChanges,
  DBSQLiteValues,
  SQLiteConnection,
  SQLiteDBConnection,
} from '@capacitor-community/sqlite';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  DB_NAME = 'FITNESS_DB';

  sqlite: SQLiteConnection = new SQLiteConnection(CapacitorSQLite);
  db!: SQLiteDBConnection;

  predefinedMuscles: Array<string> = [
    'Calves',
    'Hamstrings',
    'Quads',
    'Glutes',
    'Biceps',
    'Brachialis',
    'Triceps',
    'Quads',
    'Chest',
    'Forearms',
    'Traps',
    'Mid Back',
    'Lats',
    'Lower Back',
    'Rear Delt',
    'Side Delt',
    'Front Delt',
    'Neck',
    'Abs',
    'Obliques',
  ];

  predefinedMetrics: Array<Metric> = [
    {
      name: 'Body Weight',
      unit: 'Kg',
      isNumeric: true,
    },
    {
      name: 'Calorie',
      unit: 'Kcal',
      isNumeric: true,
    },
    {
      name: 'Protein',
      unit: 'g',
      isNumeric: true,
    },
    {
      name: 'Carbohydrate',
      unit: 'g',
      isNumeric: true,
    },
    {
      name: 'Fat',
      unit: 'g',
      isNumeric: true,
    },
  ];

  constructor() {}

  async clearDb() {
    // only for debug and dev
    ['EXERCISE', 'METRIC', 'EXERCISE_ENTRY', 'METRIC_ENTRY'].forEach(
      async (tableName) => {
        await this.db.execute(`DROP TABLE IF EXISTS ${tableName}`);
      }
    );
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
    await this.clearDb();
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
  }

  async populateInitialDb() {
    // prepopulated metrics like bodyweight, calories, etc

    this.predefinedMetrics.forEach(async (metric) => {
      await this.db.run(
        'INSERT OR IGNORE INTO METRIC (NAME, UNIT, IS_NUMERIC) VALUES (?, ?, ?);',
        [metric.name, metric.unit, metric.isNumeric]
      );
    });

    this.predefinedMuscles.forEach(async (muscle) => {
      await this.db.run('INSERT OR IGNORE INTO MUSCLE (NAME) VALUES (?);', [
        muscle,
      ]);
    });
  }

  getExerciseNameList(
    searchTerm?: string,
    muscleName?: string | null
  ): Observable<DBSQLiteValues> {
    if (!searchTerm) {
      searchTerm = '';
    }
    if (!muscleName) {
      return from(
        this.db.query(
          `SELECT NAME FROM 
          EXERCISE, JSON_EACH(EXERCISE.MUSCLES_HIT)
        WHERE 
          LOWER(NAME) LIKE '%' || LOWER(?) || '%' 
        AND
          JSON_EACH.VALUE = ? ORDER BY NAME ASC;`,
          [searchTerm, muscleName]
        )
      );
    } else {
      return from(
        this.db.query(
          `SELECT NAME FROM 
          EXERCISE, JSON_EACH(EXERCISE.MUSCLES_HIT)
        WHERE 
          LOWER(NAME) LIKE '%' || LOWER(?) || '%' ORDER BY NAME ASC;`,
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
        "SELECT NAME FROM METRIC WHERE LOWER(NAME) LIKE '%' || LOWER(?) || '%' ORDER BY NAME ASC;",
        [searchTerm]
      )
    );
  }

  getMuscleNameList(): Observable<DBSQLiteValues> {
    return from(this.db.query('SELECT NAME FROM MUSCLE ORDER BY NAME ASC;'));
  }

  addExercise() {}

  updateExercise() {}

  saveExerciseEntry(exData: ExerciseEntryData) {}
}
