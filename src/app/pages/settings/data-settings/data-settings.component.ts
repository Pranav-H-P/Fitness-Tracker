import { animate, style, transition, trigger } from '@angular/animations';
import { Component, inject, OnInit } from '@angular/core';
import { DataService } from '../../../services/data.service';
import { AppStateService } from '../../../services/app-state.service';
import { Router } from '@angular/router';
import { BackupService } from '../../../services/backup.service';
import { PopupType } from '../../../eums';

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
  backupService = inject(BackupService);

  importType: null | 'EXERCISE' | 'METRIC' | 'FOOD_ITEM' | 'FOOD_TRACKING' =
    null;

  readonly PopupType = PopupType;

  constructor() {
    this.stateService.setCurrentPage('Settings');
  }

  exportExerciseData() {
    this.backupService.exportExerciseData();
  }

  exportMetricData() {
    this.backupService.exportMetricData();
  }

  exportFoodItemData() {}

  exportFoodTrackingData() {}

  importExerciseData() {
    this.importType = 'EXERCISE';
    this.stateService.setPopup(PopupType.IMPORT_WARNING);
  }

  importMetricData() {
    this.importType = 'METRIC';
    this.stateService.setPopup(PopupType.IMPORT_WARNING);
  }

  importFoodItemData() {
    this.importType = 'FOOD_ITEM';
    this.stateService.setPopup(PopupType.IMPORT_WARNING);
  }

  importFoodTrackingData() {
    this.importType = 'FOOD_TRACKING';
    this.stateService.setPopup(PopupType.IMPORT_WARNING);
  }

  startImport() {
    switch (this.importType) {
      case 'EXERCISE':
        this.backupService.importExerciseData();
        break;
      case 'METRIC':
        this.backupService.importMetricData();
        break;
      case 'FOOD_ITEM':
        break;
      case 'FOOD_TRACKING':
        break;
    }
    this.closePopup();
  }

  swipeRight() {
    this.router.navigateByUrl('settings/diet');
  }

  swipeLeft() {}

  closePopup() {
    this.stateService.clearPopup();
    this.importType = null;
  }
}
