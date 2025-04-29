import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../../services/toast.service';
import { DataService } from '../../../../services/data.service';
import { AppStateService } from '../../../../services/app-state.service';

@Component({
  selector: 'app-exercise-entry-page',
  standalone: true,
  imports: [],
  templateUrl: './exercise-entry-page.component.html',
  styleUrl: './exercise-entry-page.component.scss',
})
export class ExerciseEntryPageComponent implements OnInit {
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  toastService = inject(ToastService);
  dataService = inject(DataService);
  stateService = inject(AppStateService);

  exerciseName = signal<string>('');

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.stateService.setCurrentPage(params['name']);
      this.exerciseName.set(params['name']);
    });
  }

  swipeLeft() {
    this.toastService.showToast('swiped left!');
    console.log('swiping l');
  }

  swipeRight() {
    this.toastService.showToast('swiped right!');
    console.log('swiping right');
  }
}
