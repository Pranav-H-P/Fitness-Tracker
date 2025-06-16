import { inject, Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { concatMap } from 'rxjs';
import { ToastService } from './toast.service';
import { FilesystemService } from './filesystem.service';
import { FractionalSetRatio, FractionalSetRatioExport } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  dbService = inject(DatabaseService);
  toastService = inject(ToastService);
  filesystemService = inject(FilesystemService);

  constructor() {}

  writeFile(fileName: string, filePath: string, data: any) {
    this.filesystemService
      .writeFile(fileName, filePath, JSON.stringify(Object.fromEntries(data)))
      .subscribe({
        next: (resp) => {
          this.toastService.showToast(
            `Exported to Documents/FitnessTrackerExports/${filePath}/${fileName}`
          );
        },
        error: (err) => {
          console.log('error:');
          console.log(err);
          this.toastService.showToast('Error Exporting');
        },
      });
  }

  exportMetricData() {
    /*
    {
      "Name": {
        "fields": "field",
        "data":[
          entryObjects,
          ...
        ]
      }
    }
    */
    this.filesystemService.requestFilePermission().subscribe((perm) => {
      if (perm) {
        let exportMap: Map<string, any> = new Map();
        let idNameMap: Map<number, string> = new Map();

        const metricMetaObs = this.dbService.getAllMetricMetadata();
        const metricEntryObs = this.dbService.getAllMetricEntryData();

        metricMetaObs
          .pipe(
            concatMap((metadata) => {
              const respArr = metadata.values ?? [];

              if (respArr.length > 0) {
                respArr.forEach((row) => {
                  idNameMap.set(row['ID'], row['NAME']);

                  let metricObj = {
                    unit: row['UNIT'],
                    isNumeric: row['IS_NUMERIC'] == 1 ? true : false,
                    hidden: row['HIDDEN'] == 1 ? true : false,
                    data: [],
                  };

                  exportMap.set(row['NAME'], metricObj);
                });
              }

              return metricEntryObs;
            })
          )
          .subscribe({
            next: (entryRes) => {
              const entryArr = entryRes.values ?? [];

              if (entryArr.length > 0) {
                entryArr.forEach((row) => {
                  const metricName = idNameMap.get(row['METRIC_ID']) ?? ''; // will always return a value

                  const entryObj = {
                    timestamp: row['TIMESTAMP'],
                    entry: row['ENTRY'],
                    note: row['NOTE'],
                  };

                  exportMap.get(metricName).data.push(entryObj);
                });
              }

              this.writeFile(
                `MetricExport${new Date().valueOf()}.json`,
                'MetricExport',
                exportMap
              );
            },
            error: (err) => {
              this.toastService.showToast('Error Exporting!');
            },
          });
      }
    });
  }

  exportExerciseData() {
    /*
    {
      "Name": {
        "fields": "field",
        "data":[
          entryObjects,
          ...
        ]
      }
    }
    */
    this.filesystemService.requestFilePermission().subscribe((perm) => {
      if (perm) {
        let exportMap: Map<string, any> = new Map();
        let exerciseIdToName: Map<number, string> = new Map();
        let muscleIdToName: Map<number, string> = new Map();

        const muscleDataObs = this.dbService.getMuscleNameList();
        const exerciseMetaObs = this.dbService.getAllExerciseMetadata();
        const exerciseEntryObs = this.dbService.getAllExerciseEntryData();

        muscleDataObs
          .pipe(
            concatMap((muscleData) => {
              const respArr = muscleData.values ?? [];

              if (respArr.length > 0) {
                respArr.forEach((row) => {
                  muscleIdToName.set(row['ID'], row['NAME']);
                });
              }

              return exerciseMetaObs;
            })
          )
          .pipe(
            concatMap((metadata) => {
              const respArr = metadata.values ?? [];

              if (respArr.length > 0) {
                respArr.forEach((row) => {
                  exerciseIdToName.set(row['ID'], row['NAME']);

                  let exerciseObj = {
                    unit: row['UNIT'],
                    musclesHit: JSON.parse(row['MUSCLES_HIT']),
                    data: [],
                  };

                  let newMusclesHitArr: Array<FractionalSetRatioExport> = [];
                  exerciseObj.musclesHit.forEach((id: FractionalSetRatio) => {
                    newMusclesHitArr.push({
                      muscleName: muscleIdToName.get(id.muscleId) ?? '',
                      ratio: id.ratio,
                    });
                  });

                  exerciseObj.musclesHit = newMusclesHitArr;

                  exportMap.set(row['NAME'], exerciseObj);
                });
              }

              return exerciseEntryObs;
            })
          )
          .subscribe({
            next: (entryRes) => {
              const entryArr = entryRes.values ?? [];

              if (entryArr.length > 0) {
                entryArr.forEach((row) => {
                  const exerciseName =
                    exerciseIdToName.get(row['EXERCISE_ID']) ?? ''; // will always return a value

                  const entryObj = {
                    timestamp: row['TIMESTAMP'],
                    sets: JSON.parse(row['SETS']),
                    note: row['NOTE'],
                  };

                  exportMap.get(exerciseName).data.push(entryObj);
                });
              }

              this.writeFile(
                `ExerciseExport${new Date().valueOf()}.json`,
                'ExerciseExport',
                exportMap
              );
            },
            error: (err) => {
              this.toastService.showToast('Error Exporting!');
            },
          });
      }
    });
  }

  exportFoodItems() {
    // TODO
  }
  exportFoodTracking() {
    // TODO
  }

  importMetricData() {}
  importExerciseData() {}
  importFoodItems() {
    // TODO
  }
  importFoodTracking() {
    // TODO
  }
}
