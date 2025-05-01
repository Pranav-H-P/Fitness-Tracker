import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../../services/toast.service';
import { DataService } from '../../../../services/data.service';
import { AppStateService } from '../../../../services/app-state.service';
import { ExerciseEntryData, ExerciseSetData } from '../../../../models';
import { Location, NgClass } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-exercise-entry-page',
  standalone: true,
  imports: [],
  templateUrl: './exercise-entry-page.component.html',
  styleUrl: './exercise-entry-page.component.scss',
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('150ms ease-in', style({ opacity: 100 })),
      ]),
      transition(':leave', [
        style({ opacity: 100 }),
        animate('150ms ease-in', style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class ExerciseEntryPageComponent implements OnInit {
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  toastService = inject(ToastService);
  dataService = inject(DataService);
  stateService = inject(AppStateService);
  location = inject(Location);

  exerciseName: string = '';
  tempExerciseMap = signal<Map<string, ExerciseEntryData>>(new Map());
  exerciseData = signal<ExerciseEntryData>({
    exerciseName: '',
    note: '',
    timestamp: Date.now(),
    sets: [],
  });
  bestSet = signal<ExerciseSetData>({
    reps: '1',
    weight: '225',
    timestamp: -1,
  });
  lastNote = signal<string>('None');
  unit = signal<string>('Kg');
  bestIndex = signal<number>(0); // to decide between last session and recent best

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.stateService.setCurrentPage(params['name']);
      this.exerciseName = params['name'];
      this.initExerciseData();
    });
  }

  initExerciseData() {
    this.tempExerciseMap = this.dataService.getTempExerciseDataSignal();
    this.exerciseData.set(
      this.dataService.getExerciseFromTempData(this.exerciseName)
    );
  }
  swipeLeft() {
    // go to next
    const size = this.tempExerciseMap().size;
    const tempArr = Array.from(this.tempExerciseMap().keys());
    const currInd = tempArr.indexOf(this.exerciseName);

    if (currInd === size - 1) {
      this.router.navigate(['workout/entry/exercise/' + tempArr[0]], {
        replaceUrl: true,
      });
    } else {
      this.router.navigate(['workout/entry/exercise/' + tempArr[currInd + 1]], {
        replaceUrl: true,
      });
    }
  }

  swipeRight() {
    // go to previous

    const size = this.tempExerciseMap().size;
    const tempArr = Array.from(this.tempExerciseMap().keys());
    const currInd = tempArr.indexOf(this.exerciseName);

    if (currInd > 0) {
      this.router.navigate(['workout/entry/exercise/' + tempArr[currInd - 1]], {
        replaceUrl: true,
      });
    } else {
      this.router.navigate(['workout/entry/exercise/' + tempArr[size - 1]], {
        replaceUrl: true,
      });
    }
  }
  toggleBestIndex() {
    this.bestIndex.update((val) => (val === 1 ? 0 : 1));
  }

  deleteExerciseData() {
    this.dataService.removeTempExercise(this.exerciseName);
    this.location.back();
  }
}
