import { inject, Injectable, Signal, signal } from '@angular/core';
import { ExerciseEntryData, Metric } from '../models';
import { DatabaseService } from './database.service';
import { ToastService } from './toast.service';

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

  exerciseList = signal<Array<string>>([]);
  metricList = signal<Array<string>>([]);
  muscleList = signal<Array<string>>([]);

  constructor() {}

  updateExerciseList(searchTerm?: string, muscleName?: string | null) {
    this.databaseService.getExerciseNameList(searchTerm, muscleName).subscribe({
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

  getTempExerciseDataSignal(): Signal<Map<string, ExerciseEntryData>> {
    // for template rendering only
    return this.tempExerciseEntryData;
  }

  getExerciseListSignal() {
    return this.exerciseList;
  }

  getMetricListSignal() {
    return this.metricList;
  }

  getMuscleListSignal() {
    return this.muscleList;
  }

  getExerciseFromTempData(name: string): ExerciseEntryData | undefined {
    return this.tempExerciseEntryData().get(name);
  }

  setExerciseInTempData(exData: ExerciseEntryData) {
    this.tempExerciseEntryData().set(exData.exerciseName, exData);
  }
  removeTempExercise(name: string) {
    return this.tempExerciseEntryData().delete(name);
  }

  saveExerciseEntry(exData: ExerciseEntryData) {
    this.databaseService.saveExerciseEntry(exData);
  }
}
