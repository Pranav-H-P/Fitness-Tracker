import { Component, inject, OnInit, Signal, signal } from '@angular/core';
import { ExerciseEntryData, TabData } from '../../../../models';
import { FormsModule } from '@angular/forms';
import { PageTabComponent } from '../../../../common/page-tab/page-tab.component';
import { DataService } from '../../../../services/data.service';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { AppStateService } from '../../../../services/app-state.service';

@Component({
  selector: 'app-entry-items-page',
  standalone: true,
  imports: [PageTabComponent, FormsModule, NgClass],
  templateUrl: './entry-items-page.component.html',
  styleUrl: './entry-items-page.component.scss',
})
export class EntryItemsPageComponent {
  dataService = inject(DataService);
  stateService = inject(AppStateService);
  router = inject(Router);

  currentTab = signal<number>(0);
  filterVisible = signal<boolean>(false);

  displayList = this.dataService.getExerciseListSignal();
  muscleList = this.dataService.getMuscleListSignal();

  activeExercises: Signal<Map<string, ExerciseEntryData>> =
    this.dataService.getTempExerciseDataSignal();

  searchTerm: string = '';
  muscleName: string | null = null;

  tabData: Array<TabData> = [
    {
      name: 'Exercise',
      popupLink: 'workout/entry/exercise/',
    },
    {
      name: 'Metrics',
      popupLink: 'workout/entry/metric/',
    },
  ];

  constructor() {
    this.stateService.setCurrentPage('Entry');
  }
  changeTab(ind: number) {
    this.currentTab.set(ind);
    if (ind === 0) {
      this.dataService.updateExerciseList();
      this.displayList = this.dataService.getExerciseListSignal();
    } else if (ind === 1) {
      this.dataService.updateMetricList();
      this.displayList = this.dataService.getMetricListSignal();
    }
  }

  openPopup(name: string | null) {
    if (this.currentTab() === 0) {
      if (name === null) {
        name = '';
      }
      this.router.navigate(['workout/entry/exercise/' + name]);
    } else {
      this.router.navigate(['workout/entry/metric/' + name]);
    }
  }

  searchData() {
    if (this.currentTab() === 0) {
      this.dataService.updateExerciseList(this.searchTerm, this.muscleName);
    } else if (this.currentTab() === 1) {
      this.dataService.updateMetricList(this.searchTerm);
    }
  }

  toggleFilter() {
    this.dataService.updateMuscleList();
    this.filterVisible.update((val) => !val);
  }

  setMuscleFilter(name: string) {
    if (this.muscleName === name) {
      this.muscleName = null;
    } else {
      this.muscleName = name;
    }

    this.dataService.updateExerciseList(this.searchTerm, this.muscleName);
    this.toggleFilter();
  }
}
