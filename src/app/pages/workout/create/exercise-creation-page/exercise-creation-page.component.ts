import { animate, style, transition, trigger } from '@angular/animations';
import {
  Component,
  ElementRef,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppStateService } from '../../../../services/app-state.service';
import { DataService } from '../../../../services/data.service';
import { Location } from '@angular/common';
import { ToastService } from '../../../../services/toast.service';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PopupType } from '../../../../eums';
import { Exercise } from '../../../../models';
import { nonEmptyArrayValidator } from '../../../../custom-validators';

@Component({
  selector: 'app-exercise-creation-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './exercise-creation-page.component.html',
  styleUrl: './exercise-creation-page.component.scss',
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
export class ExerciseCreationPageComponent {
  activatedRoute = inject(ActivatedRoute);
  stateService = inject(AppStateService);
  location = inject(Location);
  dataService = inject(DataService);
  toastService = inject(ToastService);
  formBuilder = inject(FormBuilder);

  originalExerciseName = '';
  exerciseId: undefined | number;

  muscleSelectionList = signal<
    Array<{ name: string; id: number; disabled?: boolean }>
  >([]);

  exerciseForm = this.formBuilder.group({
    name: this.formBuilder.control('', [Validators.required]),
    unit: this.formBuilder.control('', [Validators.required]),
    musclesHit: this.formBuilder.array([], [nonEmptyArrayValidator]),
  });

  readonly PopupType = PopupType;

  @ViewChild('scrollContainer') scrollContainer: ElementRef = {} as ElementRef;

  ngOnInit(): void {
    this.dataService.updateMuscleList();
    this.muscleSelectionList = this.dataService.getMuscleListSignal();

    this.activatedRoute.params.subscribe((params) => {
      if (params['id'] == 'undefined') {
        this.exerciseId = undefined;
        this.stateService.setCurrentPage('New Exercise');
      } else {
        this.exerciseId = params['id'];
        this.initExerciseData();
      }
    });
  }
  populateMuscleList(event: Event) {}
  initExerciseData() {
    this.dataService
      .getExerciseMetadataById(this.exerciseId ?? 0)
      .subscribe((resp) => {
        this.originalExerciseName = resp?.name ?? '';
        this.stateService.setCurrentPage(this.originalExerciseName);
        this.exerciseId = resp?.id ?? undefined;

        this.exerciseForm = this.formBuilder.group({
          name: this.formBuilder.control(resp?.name ?? '', [
            Validators.required,
          ]),
          unit: this.formBuilder.control(resp?.unit ?? '', [
            Validators.required,
          ]),
          musclesHit: this.formBuilder.array([], [nonEmptyArrayValidator]),
        });

        const musclesHitFormArr = this.exerciseForm.get(
          'musclesHit'
        ) as FormArray;

        (resp?.musclesHit ?? []).forEach((setRatio, index) => {
          // prepopulate
          this.addMuscleHitField();
          musclesHitFormArr
            .get(index.toString())
            ?.get('muscleId')
            ?.setValue(setRatio.muscleId);
          musclesHitFormArr
            .get(index.toString())
            ?.get('ratio')
            ?.setValue(setRatio.ratio);
        });
      });
  }
  openDeletePopup() {
    this.stateService.clearPopup();
    this.stateService.setPopup(PopupType.DELETE_EXERCISE_METADATA);
  }

  deleteExercise() {
    if (this.exerciseId) {
      this.dataService.deleteExerciseMetadata(this.exerciseId);
    }

    this.closePopup();
    this.location.back();
  }

  addMuscleHitField() {
    const muscles = this.getMusclesHitFormArray();
    muscles.push(
      this.formBuilder.group({
        muscleId: this.formBuilder.control(-1, [
          Validators.required,
          Validators.pattern('^[0-9]+$'), // only positive
        ]),
        ratio: this.formBuilder.control(0, [
          Validators.required,
          Validators.pattern('^(?!$)[0-9]*.?[0-9]*$'),
          Validators.max(1),
        ]),
      })
    );
    this.scrollToBottom();
  }

  updateMuscleHitList() {
    this.dataService.updateMuscleList();
    this.muscleSelectionList = this.dataService.getMuscleListSignal();
  }

  getMuscleHitSelectedIdList(): Array<number> {
    let arr: Array<number> = [];
    const muscleObjArr = this.getMusclesHitFormArray().value;

    muscleObjArr.forEach((obj) => {
      arr.push(Number(obj.muscleId));
    });

    return arr;
  }

  refreshSelectionArray() {}
  getMusclesHitFormArray(): FormArray<FormGroup> {
    const muscles = this.exerciseForm.get('musclesHit') as FormArray;
    return muscles;
  }

  deleteFractionalRatioControl(index: number) {
    const muscles = this.getMusclesHitFormArray();
    muscles.removeAt(index);
    this.refreshSelectionArray();
  }
  saveExerciseMetadata() {
    if (this.exerciseForm.valid && this.exerciseForm.value.name) {
      let exer: Exercise = {
        id: this.exerciseId,
        name: this.exerciseForm.value.name ?? '',
        unit: this.exerciseForm.value.unit ?? '',
        musclesHit: [],
      };

      const muscles = this.getMusclesHitFormArray();
      muscles.controls.forEach((ctrlGrp) => {
        exer.musclesHit.push({
          muscleId: Number(ctrlGrp.get('muscleId')?.value),
          ratio: Number(ctrlGrp.get('ratio')?.value),
        });
      });

      this.dataService
        .getExerciseMetadataByName(exer.name)
        .subscribe((resp) => {
          // check if name already exists

          if (
            resp == null ||
            exer.name.toLowerCase() === this.originalExerciseName.toLowerCase()
          ) {
            this.dataService.saveExerciseMetadata(exer);
            this.toastService.showToast('Saved!');
            this.location.back();
          } else {
            this.toastService.showToast('Exercise Already Exists!');
          }
        });
    } else {
      this.toastService.showToast('Invalid fields!');
    }
  }
  closePopup() {
    this.stateService.clearPopup();
  }
  scrollToBottom(): void {
    const container = this.scrollContainer.nativeElement;
    container.scrollTop = container.scrollHeight;
  }
}
