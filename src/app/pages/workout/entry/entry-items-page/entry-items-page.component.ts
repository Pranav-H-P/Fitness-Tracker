import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  Signal,
  signal,
  ViewChild,
} from '@angular/core';
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
export class EntryItemsPageComponent implements AfterViewInit {
  dataService = inject(DataService);
  stateService = inject(AppStateService);
  router = inject(Router);

  currentTab = signal<number>(0);
  filterVisible = signal<boolean>(false);

  displayList = this.dataService.getExerciseListSignal();
  muscleList = this.dataService.getMuscleListSignal();

  activeExercises: Signal<Map<string, ExerciseEntryData>> =
    this.dataService.getTempExerciseDataSignal();

  searchTerm = signal<string>('');
  muscleName = signal<string | null>(null);

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

  pageUrl: string = '';

  @ViewChild('scrollContainer') scrollContainer: ElementRef = {} as ElementRef;

  constructor() {
    this.stateService.setCurrentPage('Entry');
    this.searchTerm.set('');
    this.muscleName.set(null);
    this.pageUrl = this.router.url;
  }

  ngAfterViewInit(): void {
    this.setScrollPos();
    this.setTabIndex();
  }

  // for remembering position between navigation

  saveScrollPos() {
    const pos = this.scrollContainer.nativeElement.scrollTop;
    this.stateService.setScrollPos(this.pageUrl + this.currentTab(), pos);
  }

  setScrollPos() {
    const pos = this.stateService.getScrollPos(
      this.pageUrl + this.currentTab()
    );
    this.scrollContainer.nativeElement.scrollTop = pos;
  }

  saveTabIndex() {
    this.stateService.setLastTabPage(this.pageUrl, this.currentTab());
  }

  setTabIndex() {
    this.changeTab(this.stateService.getLastTabPage(this.pageUrl));
  }

  changeTab(ind: number) {
    this.currentTab.set(ind);
    this.searchTerm.set('');
    this.muscleName.set(null);
    this.saveTabIndex();

    if (ind === 0) {
      this.updateExerciseList();
      this.displayList = this.dataService.getExerciseListSignal();
    } else if (ind === 1) {
      this.updateMetricList();
      this.displayList = this.dataService.getMetricListSignal();
    }
  }

  openPopup(name: string | null) {
    this.saveScrollPos();
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
      this.updateExerciseList();
    } else if (this.currentTab() === 1) {
      this.updateMetricList();
    }
  }

  toggleFilter() {
    this.dataService.updateMuscleList();
    this.filterVisible.update((val) => !val);
  }

  updateExerciseList() {
    this.dataService.updateExerciseList(this.searchTerm(), this.muscleName());
  }

  updateMetricList() {
    this.dataService.updateMetricList(this.searchTerm());
  }

  setMuscleFilter(name: string) {
    if (this.muscleName() === name) {
      this.muscleName.set(null);
    } else {
      this.muscleName.set(name);
    }

    this.updateExerciseList();
    this.toggleFilter();
  }
}
