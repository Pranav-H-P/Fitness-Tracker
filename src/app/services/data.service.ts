import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import {
  ExerciseEntryData,
  ExerciseSetData,
  Metric,
  MetricEntryData,
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
  tempExerciseEntryData = signal<Map<string, ExerciseEntryData>>(
    new Map<string, ExerciseEntryData>()
  );
  databaseService = inject(DatabaseService);
  toastService = inject(ToastService);
  preferenceService = inject(PreferenceService);

  exerciseList = signal<Array<string>>([]);
  metricList = signal<Array<string>>([]);
  muscleList = signal<Array<string>>([]);

  constructor() {}

  updateExerciseList(
    searchTerm: string = '',
    muscleName: string | null = null
  ) {
    this.databaseService.getExerciseNameList(searchTerm, muscleName).subscribe({
      next: (res) => {
        const resArr = res.values;
        let newList: Array<string> = [];
        if (resArr && resArr?.length > 0) {
          resArr.forEach((obj) => {
            newList.push(obj.NAME);
          });
        }

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
        let newList: Array<string> = [];

        if (resArr && resArr?.length > 0) {
          resArr.forEach((obj) => {
            newList.push(obj.NAME);
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

  getMuscleListSignal(): WritableSignal<Array<string>> {
    return this.muscleList;
  }

  getTempExerciseDataSignal(): WritableSignal<Map<string, ExerciseEntryData>> {
    return this.tempExerciseEntryData;
  }

  getExerciseFromTempData(name: string): Observable<ExerciseEntryData> {
    const dat = this.tempExerciseEntryData().get(name);

    if (dat) {
      return of(dat);
    }

    let newEntry = {
      exerciseName: name,
      note: '',
      timestamp: new Date().setHours(0, 0, 0, 0).valueOf(),
      sets: [],
    };

    return this.databaseService
      .getExistingExerciseEntry(newEntry.exerciseName, newEntry.timestamp)
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
    this.tempExerciseEntryData().set(exData.exerciseName, exData);
  }
  removeTempExercise(name: string) {
    if (this.tempExerciseEntryData().delete(name)) {
    }
  }

  saveExerciseEntry(exData: ExerciseEntryData) {
    this.databaseService.saveExerciseEntry(exData).subscribe({
      next: (res) => {
        this.tempExerciseEntryData().delete(exData.exerciseName);
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

  getLastBestSet(exName: string): Observable<ExerciseSetData | null> {
    return this.databaseService.getLastExerciseEntrySet(exName).pipe(
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
  getLastNote(exName: string): Observable<string> {
    return this.databaseService.getLastExerciseEntryNote(exName).pipe(
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

  getRecentBestSet(exName: string): Observable<ExerciseSetData | null> {
    return this.databaseService
      .getRecentExerciseEntrySets(
        exName,
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
  getAllTimeBest(exName: string): Observable<ExerciseSetData | null> {
    return this.databaseService.getAllExerciseEntrySets(exName).pipe(
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
  saveMetricEntry(metricName: string, data: string, note: string) {
    this.databaseService.saveTodaysMetric(metricName, data, note);
  }

  deleteTodaysMetricEntry(metricName: string) {
    this.databaseService.deleteTodaysMetric(metricName);
  }

  getTodaysMetricEntry(metricName: string): Observable<MetricEntryData> {
    return this.databaseService.getTodaysMetric(metricName).pipe(
      map((data) => {
        const returnArr = data.values;
        if (returnArr && returnArr.length > 0) {
          const entry = returnArr[0];
          return {
            metricName: metricName,
            entry: entry['ENTRY'],
            timestamp: entry['TIMESTAMP'],
            note: entry['NOTE'],
          };
        }
        return {
          metricName: metricName,
          entry: '',
          timestamp: 0,
          note: '',
        };
      }),
      catchError((err) => {
        return of({
          metricName: metricName,
          entry: '',
          timestamp: 0,
          note: '',
        });
      })
    );
  }

  getMetricMetadata(metricName: string): Observable<Metric> {
    return this.databaseService.getMetric(metricName).pipe(
      map((data) => {
        const returnArr = data.values;
        if (returnArr && returnArr.length > 0) {
          const metricData = returnArr[0];
          return {
            name: metricName,
            unit: metricData['UNIT'],
            isNumeric: metricData['IS_NUMERIC'],
          };
        }
        return {
          name: metricName,
          unit: 'error',
          isNumeric: false,
        };
      }),
      catchError((err) => {
        return of({
          name: metricName,
          unit: 'error',
          isNumeric: false,
        });
      })
    );
  }

  updateExerciseMetadataList(searchTerm: string) {}

  updateMetricMetadataList(searchTerm: string) {}
}
