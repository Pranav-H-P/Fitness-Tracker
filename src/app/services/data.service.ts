import {
  inject,
  Injectable,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
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

  getExerciseFromTempData(name: string): ExerciseEntryData {
    const dat = this.tempExerciseEntryData().get(name);

    if (dat) {
      return dat;
    }
    const newEntry = {
      exerciseName: name,
      note: '',
      timestamp: Date.now(),
      sets: [],
    };

    this.setExerciseInTempData(newEntry);

    return newEntry;
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
