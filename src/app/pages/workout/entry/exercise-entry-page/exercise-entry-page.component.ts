import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../../services/toast.service';
import { DataService } from '../../../../services/data.service';
import { AppStateService } from '../../../../services/app-state.service';
import {
  Exercise,
  ExerciseEntryData,
  ExerciseSetData,
} from '../../../../models';
import { Location } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PopupType } from '../../../../eums';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-exercise-entry-page',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
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
export class ExerciseEntryPageComponent implements OnInit, OnDestroy {
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  toastService = inject(ToastService);
  dataService = inject(DataService);
  stateService = inject(AppStateService);
  location = inject(Location);
  formBuilder = inject(FormBuilder);

  exerciseName: string = '';
  exerciseMetadata: Exercise = {
    id: -1,
    name: 'error',
    unit: 'error',
    musclesHit: [],
  };

  timeSinceLastSet: number = -1;
  timerSubscription!: Subscription;

  readonly PopupType = PopupType;

  setForm = this.formBuilder.group({
    load: this.formBuilder.control('', [
      Validators.required,
      Validators.pattern('^(?!$)[0-9]*.?[0-9]*$'), // decimal values
    ]),
    reps: this.formBuilder.control('', [
      Validators.required,
      Validators.pattern('^[0-9]+$'), // just integers
    ]),
  });

  currentNote = '';

  tempExerciseMap = signal<Map<number, ExerciseEntryData>>(new Map());
  exerciseData = signal<ExerciseEntryData>({
    exerciseId: 0,
    note: '',
    timestamp: Date.now(),
    sets: [],
  });
  lastBestSet = signal<ExerciseSetData | null>(null);
  recentBestSet = signal<ExerciseSetData | null>(null);

  lastNote = signal<string>('None');
  unit = signal<string>('Kg');
  bestIndex = signal<number>(0); // to decide between last session and recent best

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.exerciseMetadata.id = params['id'];
      this.initExerciseData();
    });
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }
  initExerciseData() {
    this.tempExerciseMap = this.dataService.getTempExerciseDataSignal();
    this.dataService
      .getExerciseMetadataById(this.exerciseMetadata.id ?? 0)
      .subscribe((resp) => {
        // will always be not null
        console.log('metadataresp');
        console.log(resp);
        this.exerciseMetadata = resp ?? {
          id: -1,
          name: 'error',
          unit: 'error',
          musclesHit: [],
        };
        this.exerciseName = this.exerciseMetadata.name;

        this.stateService.setCurrentPage(this.exerciseName);
        if (this.exerciseMetadata.id) {
          console.log('got id');
          const currentSetData = this.stateService.getCurrentSet(
            this.exerciseMetadata.id
          );
          this.setForm.setValue(currentSetData);
          this.dataService
            .getExerciseFromTempData(this.exerciseMetadata.id)
            .subscribe((res) => {
              this.exerciseData.set(res);
              this.currentNote = res.note;
            });

          this.dataService
            .getLastBestSet(this.exerciseMetadata.id)
            .subscribe((res) => {
              this.lastBestSet.set(res);
            });
          this.dataService
            .getRecentBestSet(this.exerciseMetadata.id)
            .subscribe((res) => {
              this.recentBestSet.set(res);
            });

          this.dataService
            .getLastNote(this.exerciseMetadata.id)
            .subscribe((res) => {
              this.lastNote.set(res);
            });
        } else {
          console.log('not got id');
        }
      });
  }
  swipeLeft() {
    // go to next
    this.stateService.setCurrentSet(
      this.exerciseMetadata.id ?? 0,
      this.setForm.value.load ?? '',
      this.setForm.value.reps ?? ''
    );
    const size = this.tempExerciseMap().size;
    const tempArr = Array.from(this.tempExerciseMap().keys());
    const currInd = tempArr.indexOf(this.exerciseMetadata.id ?? 0);

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
    this.stateService.setCurrentSet(
      this.exerciseMetadata.id ?? 0,
      this.setForm.value.load ?? '',
      this.setForm.value.reps ?? ''
    );
    const size = this.tempExerciseMap().size;
    const tempArr = Array.from(this.tempExerciseMap().keys());
    const currInd = tempArr.indexOf(this.exerciseMetadata.id ?? 0);

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
  toggleBestIndex(event: Event) {
    event.stopPropagation();
    this.bestIndex.update((val) => (val === 1 ? 0 : 1));
  }

  openDeletePopup() {
    this.stateService.clearPopup();
    this.stateService.setPopup(PopupType.DELETE_ACTIVE_ENTRY);
  }

  deleteExerciseData() {
    this.dataService.removeTempExercise(this.exerciseMetadata.id ?? 0);
    this.stateService.clearPopup();
    this.location.back();
  }

  deleteSetData(ind: number) {
    this.exerciseData().sets.splice(ind, 1);
    if (this.exerciseData().sets.length == 0) {
      this.stopTimer();
    }
  }

  openSavePopup() {
    this.stateService.clearPopup();
    if (this.exerciseData().sets.length > 0) {
      this.stateService.setPopup(PopupType.SAVE_ACTIVE_ENTRY);
    } else {
      this.toastService.showToast('Nothing to Save!');
    }
  }

  closePopup() {
    this.stateService.clearPopup();
  }
  saveExerciseData() {
    this.exerciseData().note = this.currentNote;
    this.dataService.saveExerciseEntry(this.exerciseData());
    this.stateService.clearPopup();
    this.location.back();
  }

  goBack() {
    this.stateService.setCurrentSet(
      this.exerciseMetadata.id ?? 0,
      this.setForm.value.load ?? '',
      this.setForm.value.reps ?? ''
    );
    this.location.back();
  }

  addSet() {
    console.log(this.setForm);
    if (this.setForm.valid) {
      this.exerciseData().sets.push({
        load: Number.parseFloat(this.setForm.value.load ?? ''),
        reps: Number.parseInt(this.setForm.value.reps ?? ''),
        timestamp: Date.now(),
      });

      this.startTimer();
    } else {
      this.toastService.showToast('Invalid Input!');
    }
  }

  getTime(timestamp: number): string {
    const date = new Date(timestamp);

    return date.toLocaleTimeString();
  }

  formatSetData(data: ExerciseSetData) {
    return `${data.load} ${this.unit()} x ${data.reps} at ${this.getTime(
      data.timestamp
    )}`;
  }

  startTimer() {
    this.timeSinceLastSet = 0;

    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    this.timerSubscription = interval(1000).subscribe(() => {
      this.timeSinceLastSet = Math.floor(
        (Date.now() - (this.exerciseData().sets.at(-1)?.timestamp ?? 0)) / 1000
      );
    });
  }
  stopTimer() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }
}
