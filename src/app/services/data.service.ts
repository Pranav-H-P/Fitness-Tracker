import { inject, Injectable, Signal, signal } from '@angular/core';
import { ExerciseEntryData } from '../models';
import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  // unpersisted exerciseData
  tempExerciseData = signal<Map<string, ExerciseEntryData>>(new Map<string, ExerciseEntryData>()); 
  databaseService = inject(DatabaseService);

  constructor() { }


  getExerciseFromTempData(name: string): ExerciseEntryData | undefined{
    return this.tempExerciseData().get(name);
  }

  setExerciseInTempData(exData: ExerciseEntryData){
    this.tempExerciseData().set(exData.exerciseName, exData);
  }

  getTempExerciseDataSignal(): Signal<Map<string, ExerciseEntryData>>{ // for template rendering only
    return this.tempExerciseData;
  }

  removeTempExercise(name: string){
    return this.tempExerciseData().delete(name)
  }

  saveExerciseEntry(exData: ExerciseEntryData){
    this.databaseService.saveExerciseEntry(exData);
  }

}
