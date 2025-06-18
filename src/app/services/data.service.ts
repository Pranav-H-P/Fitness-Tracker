import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import {
  Exercise,
  ExerciseEntryData,
  ExerciseLogEntry,
  ExerciseSetData,
  Metric,
  MetricEntryData,
  MetricLogEntry,
} from '../models';
import { DatabaseService } from './database.service';
import { ToastService } from './toast.service';
import { catchError, map, Observable, of, timestamp } from 'rxjs';
import { PreferenceService } from './preference.service';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  // unpersisted exerciseData
  tempExerciseEntryData = signal<Map<number, ExerciseEntryData>>(
    new Map<number, ExerciseEntryData>()
  );
  databaseService = inject(DatabaseService);
  toastService = inject(ToastService);
  preferenceService = inject(PreferenceService);

  exerciseList = signal<Array<string>>([]);
  metricList = signal<Array<string>>([]);
  muscleList = signal<Array<{ name: string; id: number; disabled?: boolean }>>(
    []
  );

  constructor() {}

  updateExerciseList(searchTerm: string = '', muscleId: number | null = null) {
    console.log('muscleId', muscleId);
    this.databaseService.getExerciseNameList(searchTerm, muscleId).subscribe({
      next: (res) => {
        const resArr = res.values;
        let newList: Array<string> = [];
        if (resArr && resArr?.length > 0) {
          resArr.forEach((obj) => {
            newList.push(obj.NAME);
          });
        }
        console.log(newList);
        this.exerciseList.set(newList);
      },
      error: (err) => {
        this.toastService.showToast('Error retrieving data!');
      },
    });
  }

  updateMetricList(searchTerm?: string) {
    this.databaseService.getMetricNameList(searchTerm).subscribe({
      next: (res) => {
        const resArr = res.values;
        let newList: Array<string> = [];

        if (resArr && resArr?.length > 0) {
          resArr.forEach((obj) => {
            newList.push(obj.NAME);
          });
        }

        this.metricList.set(newList);
      },
      error: (err) => {
        this.toastService.showToast('Error retrieving data!');
      },
    });
  }

  updateMuscleList() {
    this.databaseService.getMuscleNameList().subscribe({
      next: (res) => {
        const resArr = res.values;
        let newList: Array<{ name: string; id: number; disabled?: boolean }> =
          [];

        if (resArr && resArr?.length > 0) {
          resArr.forEach((obj) => {
            newList.push({ name: obj.NAME, id: obj.ID, disabled: true });
          });
        }
        this.muscleList.set(newList);
      },
      error: (err) => {
        this.toastService.showToast('Error retrieving data!');
      },
    });
  }

  // for template rendering only
  getExerciseListSignal(): WritableSignal<Array<string>> {
    return this.exerciseList;
  }

  getMetricListSignal(): WritableSignal<Array<string>> {
    return this.metricList;
  }

  getMuscleListSignal(): WritableSignal<
    Array<{ name: string; id: number; disabled?: boolean }>
  > {
    return this.muscleList;
  }

  getTempExerciseDataSignal(): WritableSignal<Map<number, ExerciseEntryData>> {
    return this.tempExerciseEntryData;
  }

  getExerciseFromTempData(id: number): Observable<ExerciseEntryData> {
    const dat = this.tempExerciseEntryData().get(id);
    console.log('returning dat:');
    console.log(dat);
    if (dat) {
      return of(dat);
    }

    let newEntry = {
      exerciseId: id,
      note: '',
      timestamp: new Date().setHours(0, 0, 0, 0).valueOf(),
      sets: [],
    };

    return this.databaseService
      .getExistingExerciseEntry(newEntry.exerciseId, newEntry.timestamp)
      .pipe(
        map((data) => {
          const returnArr = data.values;
          if (returnArr && returnArr.length > 0) {
            newEntry.note = returnArr[0].NOTE;
            newEntry.sets = JSON.parse(returnArr[0].SETS);
          }
          this.setExerciseInTempData(newEntry);
          return newEntry;
        }),
        catchError((err) => {
          this.setExerciseInTempData(newEntry);
          return of(newEntry);
        })
      );
  }

  setExerciseInTempData(exData: ExerciseEntryData) {
    console.log('setting');
    console.log(this.tempExerciseEntryData());
    this.tempExerciseEntryData().set(exData.exerciseId, exData);
  }
  removeTempExercise(id: number) {
    if (this.tempExerciseEntryData().delete(id)) {
    }
  }

  saveExerciseEntry(exData: ExerciseEntryData) {
    this.databaseService.saveExerciseEntry(exData).subscribe({
      next: (res) => {
        this.tempExerciseEntryData().delete(exData.exerciseId);
        this.toastService.showToast('Saved!');
      },
      error: (err) => {
        this.toastService.showToast('Error Inserting Exercise Data!');
      },
    });
  }

  getBestSet(sets: Array<ExerciseSetData>): ExerciseSetData {
    let bestSet: ExerciseSetData = {
      load: 0,
      reps: 0,
      timestamp: sets[0].timestamp,
    };
    sets.forEach((set) => {
      if (set.load >= bestSet.load) {
        bestSet.load = set.load;

        if (set.reps > bestSet.reps) {
          bestSet.reps = set.reps;
        }
      }
    });

    return bestSet;
  }

  parseAndFlattenEntrySetsArray(arr: Array<string>): Array<ExerciseSetData> {
    let flat: Array<ExerciseSetData> = [];
    arr.forEach((str) => {
      (JSON.parse(str) as Array<ExerciseSetData>).forEach((set) => {
        flat.push(set);
      });
    });
    return flat;
  }

  getLastBestSet(exId: number): Observable<ExerciseSetData | null> {
    return this.databaseService.getLastExerciseEntrySet(exId).pipe(
      map((data) => {
        const returnArr = data.values;
        if (returnArr && returnArr.length > 0) {
          const sets: Array<ExerciseSetData> = JSON.parse(returnArr[0].SETS);

          const bestSet = this.getBestSet(sets);

          return bestSet;
        }
        return null;
      }),
      catchError((err) => {
        return of(null);
      })
    );
  }
  getLastNote(exId: number): Observable<string> {
    return this.databaseService.getLastExerciseEntryNote(exId).pipe(
      map((data) => {
        const returnArr = data.values;
        if (returnArr && returnArr.length > 0) {
          return returnArr[0].NOTE;
        }
        return 'None';
      }),
      catchError((err) => {
        return of('None');
      })
    );
  }

  getRecentBestSet(exId: number): Observable<ExerciseSetData | null> {
    return this.databaseService
      .getRecentExerciseEntrySets(
        exId,
        this.preferenceService.getRecentEntryCount()
      )
      .pipe(
        map((data) => {
          const returnArr = data.values;
          if (returnArr && returnArr.length > 0) {
            const sets: Array<ExerciseSetData> = JSON.parse(returnArr[0].SETS);

            const bestSet = this.getBestSet(sets);

            return bestSet;
          }
          return null;
        }),
        catchError((err) => {
          return of(null);
        })
      );
  }

  getAllTimeBest(exId: number): Observable<ExerciseSetData | null> {
    return this.databaseService.getAllExerciseEntrySets(exId).pipe(
      map((data) => {
        const returnArr = data.values;
        if (returnArr && returnArr.length > 0) {
          const sets: Array<ExerciseSetData> =
            this.parseAndFlattenEntrySetsArray(returnArr);

          const bestSet = this.getBestSet(sets);

          return bestSet;
        }
        return null;
      }),
      catchError((err) => {
        return of(null);
      })
    );
  }
  saveMetricEntry(metricId: number, data: string, note: string) {
    this.databaseService.saveMetricEntry(metricId, data, note);
  }

  deleteTodaysMetricEntry(metricId: number) {
    const todayTS = new Date().setHours(0, 0, 0, 0).valueOf();
    this.databaseService.deleteMetricEntry(metricId, todayTS);
  }

  getTodaysMetricEntry(metricId: number): Observable<MetricEntryData> {
    return this.databaseService.getTodaysMetric(metricId).pipe(
      map((data) => {
        const returnArr = data.values;
        if (returnArr && returnArr.length > 0) {
          const entry = returnArr[0];
          return {
            metricId: metricId,
            entry: entry['ENTRY'],
            timestamp: entry['TIMESTAMP'],
            note: entry['NOTE'],
          };
        }
        return {
          metricId: metricId,
          entry: '',
          timestamp: 0,
          note: '',
        };
      }),
      catchError((err) => {
        return of({
          metricId: metricId,
          entry: '',
          timestamp: 0,
          note: '',
        });
      })
    );
  }

  getMetricMetadataByName(metricName: string): Observable<Metric | null> {
    return this.databaseService.getMetricMetadataByName(metricName).pipe(
      map((data) => {
        const returnArr = data.values;
        if (returnArr && returnArr.length > 0) {
          const metricData = returnArr[0];
          return {
            id: metricData['ID'],
            name: metricName,
            unit: metricData['UNIT'],
            isNumeric: metricData['IS_NUMERIC'],
          };
        }
        return null;
      }),
      catchError((err) => {
        return of(null);
      })
    );
  }
  getMetricMetadataById(metricId: number): Observable<Metric | null> {
    return this.databaseService.getMetricMetadataById(metricId).pipe(
      map((data) => {
        const returnArr = data.values;
        if (returnArr && returnArr.length > 0) {
          const metricData = returnArr[0];
          return {
            id: metricData['ID'],
            name: metricData['NAME'],
            unit: metricData['UNIT'],
            isNumeric: metricData['IS_NUMERIC'],
          };
        }
        return null;
      }),
      catchError((err) => {
        return of(null);
      })
    );
  }
  getExerciseMetadataByName(exerciseName: string): Observable<Exercise | null> {
    return this.databaseService.getExerciseMetadataByName(exerciseName).pipe(
      map((data) => {
        console.log('exercise metadata');
        console.log(data);
        const returnArr = data.values;
        if (returnArr && returnArr.length > 0) {
          const exerciseData = returnArr[0];
          return {
            id: exerciseData['ID'],
            name: exerciseData['NAME'],
            unit: exerciseData['UNIT'],
            musclesHit: JSON.parse(exerciseData['MUSCLES_HIT']),
          };
        }
        return null;
      }),
      catchError((err) => {
        return of(null);
      })
    );
  }
  getExerciseMetadataById(exerciseId: number): Observable<Exercise | null> {
    return this.databaseService.getExerciseMetadataById(exerciseId).pipe(
      map((data) => {
        const returnArr = data.values;
        if (returnArr && returnArr.length > 0) {
          const exerciseData = returnArr[0];
          return {
            id: exerciseData['ID'],
            name: exerciseData['NAME'],
            unit: exerciseData['UNIT'],
            musclesHit: JSON.parse(exerciseData['MUSCLES_HIT']),
          };
        }
        return null;
      }),
      catchError((err) => {
        return of(null);
      })
    );
  }

  saveMetricMetadata(metric: Metric) {
    this.databaseService.saveMetricMetadata(metric);
  }

  deleteMetricMetadata(metricId: number) {
    this.databaseService.deleteMetricMetadata(metricId);
  }
  saveExerciseMetadata(exercise: Exercise) {
    this.databaseService.saveExerciseMetadata(exercise);
  }

  deleteExerciseMetadata(exerciseId: number) {
    this.databaseService.deleteExerciseMetadata(exerciseId);
  }

  getAllExerciseLogsInDay(date: number): Observable<Array<ExerciseLogEntry>> {
    return this.databaseService.getAllExerciseLogsInDay(date).pipe(
      map((data) => {
        const returnArr = data.values;
        if (returnArr && returnArr.length > 0) {
          let exerciseLogArr: Array<ExerciseLogEntry> = [];
          returnArr.forEach((exerciseLog) => {
            exerciseLogArr.push({
              id: exerciseLog['ID'],
              name: exerciseLog['NAME'],
              note: exerciseLog['NOTE'],
              unit: exerciseLog['UNIT'],
              sets: JSON.parse(exerciseLog['SETS']),
            });
          });
          return exerciseLogArr;
        }
        return [];
      }),
      catchError((err) => {
        return of([]);
      })
    );
  }
  getAllMetricLogsInDay(date: number): Observable<Array<MetricLogEntry>> {
    return this.databaseService.getAllMetricLogsInDay(date).pipe(
      map((data) => {
        const returnArr = data.values;
        if (returnArr && returnArr.length > 0) {
          let metricLogArr: Array<MetricLogEntry> = [];

          returnArr.forEach((metricLog) => {
            metricLogArr.push({
              id: metricLog['ID'],
              name: metricLog['NAME'],
              note: metricLog['NOTE'],
              unit: metricLog['UNIT'],
              entry: metricLog['ENTRY'],
            });
          });
          return metricLogArr;
        }
        return [];
      }),
      catchError((err) => {
        return of([]);
      })
    );
  }
  deleteMetricEntry(metricId: number, ts: number) {
    this.databaseService.deleteMetricEntry(metricId, ts);
  }
  deleteExerciseEntry(exerciseId: number, ts: number) {
    this.databaseService.deleteExerciseEntry(exerciseId, ts);
  }
}
