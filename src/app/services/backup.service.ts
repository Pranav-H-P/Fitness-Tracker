import { inject, Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { catchError, concatMap, Observable, of } from 'rxjs';
import { ToastService } from './toast.service';
import { FilesystemService } from './filesystem.service';
import {
  FractionalSetRatio,
  FractionalSetRatioExport,
  Metric,
  MetricEntryData,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class BackupService {
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

  checkValidMetricEntryImport(obj: Object): boolean {
    if (
      obj &&
      obj.hasOwnProperty('timestamp') &&
      obj.hasOwnProperty('entry') &&
      obj.hasOwnProperty('note')
    ) {
      return true;
    }
    return false;
  }

  checkValidMetricImport(obj: Object): boolean {
    if (
      obj &&
      obj.hasOwnProperty('unit') &&
      obj.hasOwnProperty('isNumeric') &&
      obj.hasOwnProperty('hidden') &&
      obj.hasOwnProperty('data')
    ) {
      const typedObj = obj as {
        unit: string;
        isNumeric: boolean;
        hidden: boolean;
        data: Array<any>;
      };
      if (typedObj.data.length > 0) {
        let valid = true;
        typedObj.data.forEach((entry) => {
          valid = valid && this.checkValidMetricEntryImport(entry);
        });
        return valid;
      } else {
        return true; // no entries but otherwise valid
      }
    }
    return false;
  }

  checkValidExerciseEntryImport(obj: Object): boolean {
    if (
      obj &&
      obj.hasOwnProperty('timestamp') &&
      obj.hasOwnProperty('sets') &&
      obj.hasOwnProperty('note')
    ) {
      return true;
    }
    return false;
  }
  checkValidMusclesHitImport(obj: Object): boolean {
    if (
      obj &&
      obj.hasOwnProperty('muscleName') &&
      obj.hasOwnProperty('ratio')
    ) {
      return true;
    }
    return false;
  }

  checkValidExerciseImport(obj: Object): boolean {
    if (
      obj &&
      obj.hasOwnProperty('unit') &&
      obj.hasOwnProperty('musclesHit') &&
      obj.hasOwnProperty('data')
    ) {
      return true;
    }
    return false;
  }
  getJSONFromFile(): Observable<Object | null> {
    return this.filesystemService
      .requestFilePermission()
      .pipe(
        concatMap((perm) => {
          if (perm) {
            return this.filesystemService.pickFile().pipe(
              concatMap((resp) => {
                if (resp && resp.files.length > 0) {
                  const path = resp.files[0].path;

                  if (path) {
                    return this.filesystemService.readFile(path);
                  } else {
                    this.toastService.showToast('Error Processing File!');
                    return of(null);
                  }
                } else {
                  this.toastService.showToast('Error Processing File!');
                  return of(null);
                }
              })
            );
          } else {
            this.toastService.showToast('Permission not granted!');
            return of(null);
          }
        })
      )
      .pipe(
        concatMap((data) => {
          if (data && data.data) {
            try {
              const jsonStr = data.data as string; // only string is returned on native
              return of(JSON.parse(jsonStr));
            } catch {
              this.toastService.showToast('Invalid file!');
              return of(null);
            }
          } else {
            return of(null);
          }
        })
      );
  }

  saveMetricMetadataToDb(metricName: string, metricObj: any) {
    this.dbService
      .getMetricMetadataByName(metricName)
      .pipe(
        // step 1
        concatMap((data) => {
          const returnArr = data.values;
          if (returnArr && returnArr.length > 0) {
            // metric with name already exists
            const metricData = returnArr[0];

            const newMetric: Metric = {
              id: metricData.id,
              name: metricName,
              unit: metricObj['unit'],
              isNumeric: metricObj['isNumeric'],
              hidden: metricObj['hidden'],
            };
            if (
              newMetric.unit === metricData.UNIT &&
              newMetric.isNumeric == metricData.IS_NUMERIC &&
              (newMetric.hidden == metricData.HIDDEN ||
                (newMetric.hidden == false && metricData.HIDDEN == null)) // new metric will always be true/false
            ) {
              // exact match, overwrite conflicting data
              this.saveMetricEntryToDb(metricData.ID, metricObj.data);

              return of(null); // to skip next steps
            } else {
              // create new metric and store
              newMetric.id = undefined;
              newMetric.name = newMetric.name + new Date().valueOf().toString();
              return this.dbService.saveMetricMetadata(newMetric);
            }
          } else {
            // metric with name does not exist, create new
            const newMetric: Metric = {
              id: undefined,
              name: metricName,
              unit: metricObj['unit'],
              isNumeric: metricObj['isNumeric'],
              hidden: metricObj['hidden'],
            };
            return this.dbService.saveMetricMetadata(newMetric);
          }
        }),
        catchError((err) => {
          return of(undefined); // error
        })
      )
      .subscribe(
        // step 2, get id from capSqliteChanges
        (capChanges) => {
          if (capChanges === undefined) {
            this.toastService.showToast('DB Error!');
          } else if (
            capChanges &&
            capChanges.changes &&
            capChanges.changes.lastId
          ) {
            this.saveMetricEntryToDb(capChanges.changes.lastId, metricObj.data);
          }
        }
      );
  }
  saveMetricEntryToDb(metricId: number, metricEntryArr: Array<any>) {
    // step 3
    metricEntryArr = metricEntryArr as Array<{
      timestamp: number;
      entry: string;
      note: string;
    }>;

    metricEntryArr.forEach((entryDat) => {
      const entryObj: MetricEntryData = {
        metricId: metricId,
        timestamp: entryDat.timestamp,
        note: entryDat.note,
        entry: entryDat.entry,
      };

      this.dbService.saveMetricEntryOnTs(entryObj);
    });
    this.toastService.showToast('Successfully imported!');
  }

  saveMetricToDb(metricName: string, metricObj: any) {
    /*
    step 1, check if metric name already exists
        if metric name does not exist, create new metric, return metric name
        if metric name exists but old metric has different attributes to new metric,
                append '1' to name and create new metric return metric name + currentTS
        if metric name exists and matches all attributes to old one, return metric name
    
    step 2, get metric id from capSqliteChanges
    step 3, insert entries into table using metric id
     */

    this.saveMetricMetadataToDb(metricName, metricObj);
  }

  importMetricData() {
    this.getJSONFromFile().subscribe((data: { [key: string]: any } | null) => {
      if (data) {
        const metricNameArr: Array<string> = Object.keys(data);

        metricNameArr.forEach((metric) => {
          const importObj = data[metric] as Object;

          if (this.checkValidMetricImport(importObj)) {
            this.saveMetricToDb(metric, importObj);
          } else {
            this.toastService.showToast(
              ` ${metric} Skipped, invalid data format`
            );
          }
        });
      }
    });
  }
  importExerciseData() {}
  importFoodItems() {
    // TODO
  }
  importFoodTracking() {
    // TODO
  }
}
