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
import { PopupType } from '../../../../eums';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-entry-items-page',
  standalone: true,
  imports: [PageTabComponent, FormsModule, NgClass],
  templateUrl: './entry-items-page.component.html',
  styleUrl: './entry-items-page.component.scss',
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
    trigger('horizontalSmush', [
      transition(':enter', [
        style({ width: 0, padding: 0, margin: 0 }),
        animate('75ms ease-in', style({})),
      ]),
      transition(':leave', [
        style({}),
        animate('75ms ease-in', style({ width: 0, padding: 0, margin: 0 })),
      ]),
    ]),
  ],
})
export class EntryItemsPageComponent implements AfterViewInit {
  dataService = inject(DataService);
  stateService = inject(AppStateService);
  router = inject(Router);

  currentTab = signal<number>(0);
  filterVisible = signal<boolean>(false);

  displayList = this.dataService.getExerciseListSignal();
  muscleList = this.dataService.getMuscleListSignal();

  activeExercises: Signal<Map<number, ExerciseEntryData>> =
    this.dataService.getTempExerciseDataSignal();

  searchTerm = signal<string>('');
  muscleId = signal<number | null>(null);

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

  readonly PopupType = PopupType;

  constructor() {
    this.stateService.setCurrentPage('Entry');
    this.searchTerm.set('');
    this.muscleId.set(null);
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
    this.muscleId.set(null);
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
        let lastId: number =
          Array.from(this.activeExercises().keys()).pop() ?? 0;

        this.router.navigateByUrl(
          this.tabData[this.currentTab()].popupLink + lastId
        );
      } else {
        this.dataService.getExerciseMetadataByName(name).subscribe((resp) => {
          this.router.navigateByUrl(
            this.tabData[this.currentTab()].popupLink + resp?.id
          );
        });
      }
    } else {
      this.dataService.getMetricMetadataByName(name ?? '').subscribe((resp) => {
        this.router.navigateByUrl(
          this.tabData[this.currentTab()].popupLink + resp?.id
        );
      });
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
    if (this.stateService.popUpName() === PopupType.MUSCLE_FILTER) {
      this.stateService.clearPopup();
    } else {
      this.stateService.setPopup(PopupType.MUSCLE_FILTER);
    }
  }

  updateExerciseList() {
    this.dataService.updateExerciseList(this.searchTerm(), this.muscleId());
  }

  updateMetricList() {
    this.dataService.updateMetricList(this.searchTerm());
  }

  setMuscleFilter(id: number) {
    if (this.muscleId() === id) {
      this.muscleId.set(null);
    } else {
      this.muscleId.set(id);
    }

    this.updateExerciseList();
    this.toggleFilter();
  }

  swipeRight() {
    if (this.currentTab() == 0) {
      this.stateService.showSideBar();
    } else {
      this.changeTab(0);
    }
  }

  swipeLeft() {
    if (this.currentTab() == 0) {
      this.changeTab(1);
    } else {
      this.router.navigateByUrl('workout/create');
    }
  }
}
