import { animate, style, transition, trigger } from '@angular/animations';
import { NgClass } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageTabComponent } from '../../../../common/page-tab/page-tab.component';
import { Router } from '@angular/router';
import { AppStateService } from '../../../../services/app-state.service';
import { DataService } from '../../../../services/data.service';
import { TabData } from '../../../../models';

@Component({
  selector: 'app-creation-list-page',
  standalone: true,
  imports: [PageTabComponent, FormsModule],
  templateUrl: './creation-list-page.component.html',
  styleUrl: './creation-list-page.component.scss',
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
export class CreationListPageComponent implements AfterViewInit {
  dataService = inject(DataService);
  stateService = inject(AppStateService);
  router = inject(Router);

  currentTab = signal<number>(0);

  displayList = this.dataService.getExerciseListSignal();

  tabData: Array<TabData> = [
    {
      name: 'Exercise',
      popupLink: 'workout/create/exercise/',
    },
    {
      name: 'Metrics',
      popupLink: 'workout/create/metric/',
    },
  ];

  searchTerm = signal<string>('');

  pageUrl: string = '';

  @ViewChild('scrollContainer') scrollContainer: ElementRef = {} as ElementRef;

  constructor() {
    this.stateService.setCurrentPage('Create');
    this.searchTerm.set('');
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
  setTabIndex() {
    this.changeTab(this.stateService.getLastTabPage(this.pageUrl));
  }

  saveTabIndex() {
    this.stateService.setLastTabPage(this.pageUrl, this.currentTab());
  }

  changeTab(ind: number) {
    this.currentTab.set(ind);
    this.searchTerm.set('');
    this.saveTabIndex();

    if (ind === 0) {
      this.updateExerciseList();
      this.displayList = this.dataService.getExerciseListSignal();
    } else if (ind === 1) {
      this.updateMetricList();
      this.displayList = this.dataService.getMetricListSignal();
    }
  }
  searchData() {
    if (this.currentTab() === 0) {
      this.updateExerciseList();
    } else if (this.currentTab() === 1) {
      this.updateMetricList();
    }
  }
  updateExerciseList() {
    this.dataService.updateExerciseList(this.searchTerm());
  }

  updateMetricList() {
    this.dataService.updateMetricList(this.searchTerm());
  }
  openPopup(name: string = '') {
    this.saveScrollPos();

    if (this.currentTab() == 0) {
      this.dataService
        .getExerciseMetadataByName(name ?? '')
        .subscribe((resp) => {
          this.router.navigateByUrl(
            this.tabData[this.currentTab()].popupLink + resp?.id
          );
        });
    } else {
      this.dataService.getMetricMetadataByName(name ?? '').subscribe((resp) => {
        this.router.navigateByUrl(
          this.tabData[this.currentTab()].popupLink + resp?.id
        );
      });
    }
  }
  swipeRight() {
    if (this.currentTab() == 0) {
      this.router.navigateByUrl('workout/entry');
    } else {
      this.changeTab(0);
    }
  }

  swipeLeft() {
    if (this.currentTab() == 0) {
      this.changeTab(1);
    } else {
      this.router.navigateByUrl('workout/logs');
    }
  }
}
