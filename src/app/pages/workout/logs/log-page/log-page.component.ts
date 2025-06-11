import { animate, style, transition, trigger } from '@angular/animations';
import { Component, inject, OnInit } from '@angular/core';
import { DataService } from '../../../../services/data.service';
import { AppStateService } from '../../../../services/app-state.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ExerciseLogEntry,
  ExerciseSetData,
  MetricLogEntry,
} from '../../../../models';
import { PopupType } from '../../../../eums';

@Component({
  selector: 'app-log-page',
  standalone: true,
  imports: [],
  templateUrl: './log-page.component.html',
  styleUrl: './log-page.component.scss',
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
    ,
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
export class LogPageComponent implements OnInit {
  dataService = inject(DataService);
  stateService = inject(AppStateService);
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  currDate: Date = new Date();
  exerciseLogData: Array<ExerciseLogEntry> = [];
  metricLogData: Array<MetricLogEntry> = [];

  idToDelete = -1;

  readonly PopupType = PopupType;

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.currDate = new Date(Number(params['date']));
      this.initLogData();
      this.stateService.setCurrentPage(this.currDate.toDateString());
    });
  }

  initLogData() {
    this.dataService
      .getAllExerciseLogsInDay(this.currDate.valueOf())
      .subscribe((resp) => {
        this.exerciseLogData = resp;
      });
    this.dataService
      .getAllMetricLogsInDay(this.currDate.valueOf())
      .subscribe((resp) => {
        this.metricLogData = resp;
      });
  }
  swipeLeft() {
    this.router.navigate(
      ['workout/logs/' + (this.currDate.valueOf() + 24 * 60 * 60 * 1000)],
      {
        replaceUrl: true,
      }
    );
  }

  swipeRight() {
    this.router.navigate(
      ['workout/logs/' + (this.currDate.valueOf() - 24 * 60 * 60 * 1000)],
      {
        replaceUrl: true,
      }
    );
  }

  deleteMetricEntry() {
    this.closePopup();
    this.dataService.deleteMetricEntry(
      this.idToDelete,
      this.currDate.valueOf()
    );
    this.initLogData();
    this.idToDelete = -1;
  }

  deleteExerciseEntry() {
    this.closePopup();
    this.dataService.deleteExerciseEntry(
      this.idToDelete,
      this.currDate.valueOf()
    );
    this.initLogData();
    this.idToDelete = -1;
  }

  showDeleteMetricPopup(id: number) {
    this.stateService.setPopup(PopupType.DELETE_METRIC_LOG);
    this.idToDelete = id;
  }
  showDeleteExercisePopup(id: number) {
    this.stateService.setPopup(PopupType.DELETE_EXERCISE_LOG);
    this.idToDelete = id;
  }
  toggleExerciseExpand(ind: number) {
    if (this.exerciseLogData[ind].expanded) {
      this.exerciseLogData[ind].expanded = false;
    } else {
      this.exerciseLogData[ind].expanded = true;
    }
  }

  toggleMetricExpand(ind: number) {
    if (this.metricLogData[ind].expanded) {
      this.metricLogData[ind].expanded = false;
    } else {
      this.metricLogData[ind].expanded = true;
    }
  }

  formatSeconds(ms: number) {
    const sec = Math.floor(ms / 1000);
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    const hours = Math.floor(sec / 3600);

    let outSt = `${seconds} Sec`;
    if (minutes > 0 || hours > 0) {
      outSt = `${minutes} Min ` + outSt;
    }
    if (hours > 0) {
      outSt = `${hours} Hr ` + outSt;
    }

    return outSt;
  }
  formatSetData(exInd: number, setInd: number) {
    return `${this.exerciseLogData[exInd].sets[setInd].load} ${this.exerciseLogData[exInd].unit} x ${this.exerciseLogData[exInd].sets[setInd].load} Reps`;
  }
  closePopup() {
    this.stateService.clearPopup();
  }
}
