import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../../services/toast.service';
import { DataService } from '../../../../services/data.service';
import { AppStateService } from '../../../../services/app-state.service';
import { ExerciseEntryData, ExerciseSetData } from '../../../../models';
import { Location } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PopupType } from '../../../../eums';

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
export class ExerciseEntryPageComponent implements OnInit {
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  toastService = inject(ToastService);
  dataService = inject(DataService);
  stateService = inject(AppStateService);
  location = inject(Location);
  formBuilder = inject(FormBuilder);

  exerciseName: string = '';

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

  tempExerciseMap = signal<Map<string, ExerciseEntryData>>(new Map());
  exerciseData = signal<ExerciseEntryData>({
    exerciseName: '',
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
      this.stateService.setCurrentPage(params['name']);
      this.exerciseName = params['name'];
      this.initExerciseData();
      const currentSetData = this.stateService.getCurrentSet(this.router.url);
      this.setForm.setValue(currentSetData);
    });
  }

  initExerciseData() {
    this.tempExerciseMap = this.dataService.getTempExerciseDataSignal();
    this.dataService
      .getExerciseFromTempData(this.exerciseName) // guaranteed to return something
      .subscribe((res) => {
        this.exerciseData.set(res);
        this.currentNote = res.note;
      });

    this.dataService.getLastBestSet(this.exerciseName).subscribe((res) => {
      this.lastBestSet.set(res);
    });
    this.dataService.getRecentBestSet(this.exerciseName).subscribe((res) => {
      this.recentBestSet.set(res);
    });

    this.dataService.getLastNote(this.exerciseName).subscribe((res) => {
      this.lastNote.set(res);
    });
  }
  swipeLeft() {
    // go to next
    this.stateService.setCurrentSet(
      this.router.url,
      this.setForm.value.load ?? '',
      this.setForm.value.reps ?? ''
    );
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
    this.stateService.setCurrentSet(
      this.router.url,
      this.setForm.value.load ?? '',
      this.setForm.value.reps ?? ''
    );
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
  toggleBestIndex(event: Event) {
    event.stopPropagation();
    this.bestIndex.update((val) => (val === 1 ? 0 : 1));
  }

  openDeletePopup() {
    this.stateService.clearPopup();
    this.stateService.setPopup(PopupType.DELETE_ACTIVE_ENTRY);
  }

  deleteExerciseData() {
    this.dataService.removeTempExercise(this.exerciseName);
    this.stateService.clearPopup();
    this.location.back();
  }

  deleteSetData(ind: number) {
    this.exerciseData().sets.splice(ind, 1);
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
      this.router.url,
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
}
