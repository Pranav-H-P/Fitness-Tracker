import { animate, style, transition, trigger } from '@angular/animations';
import { Component, inject, OnInit } from '@angular/core';
import { DataService } from '../../../services/data.service';
import { AppStateService } from '../../../services/app-state.service';
import { Router } from '@angular/router';
import { ExportService } from '../../../services/export.service';

@Component({
  selector: 'app-data-settings',
  standalone: true,
  imports: [],
  templateUrl: './data-settings.component.html',
  styleUrl: './data-settings.component.scss',
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
    trigger('listFade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('250ms ease-in', style({ opacity: 100 })),
      ]),
      transition(':leave', [
        style({ opacity: 100 }),
        animate('0ms ease-in', style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class DataSettingsComponent {
  dataService = inject(DataService);
  stateService = inject(AppStateService);
  router = inject(Router);
  exportService = inject(ExportService);

  constructor() {
    this.stateService.setCurrentPage('Settings');
  }

  exportExerciseData() {
    this.exportService.exportExerciseData();
  }

  exportMetricData() {
    this.exportService.exportMetricData();
  }

  exportFoodItemData() {}

  exportFoodTrackingData() {}

  importExerciseData() {}

  importMetricData() {}

  importFoodItemData() {}

  importFoodTrackingData() {}

  swipeRight() {
    this.router.navigateByUrl('settings/diet');
  }

  swipeLeft() {}
}
