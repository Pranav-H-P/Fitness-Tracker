import { Component, inject, OnInit, signal } from '@angular/core';
import { DataService } from '../../../../services/data.service';
import { AppStateService } from '../../../../services/app-state.service';
import { Router, RouterLink } from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';
import { concatMap } from 'rxjs';
import { HammerGestureConfig } from '@angular/platform-browser';

@Component({
  selector: 'app-calendar-view-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './calendar-view-page.component.html',
  styleUrl: './calendar-view-page.component.scss',
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
export class CalendarViewPageComponent implements OnInit {
  dataService = inject(DataService);
  stateService = inject(AppStateService);
  router = inject(Router);

  readonly DAYNAMES = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  readonly MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  currentMonthIndex: number = 0;
  currentYear: number = 2025;
  days: number = 30;

  dayObjs = signal<
    Array<{ date: number; metricData?: boolean; exerciseData?: boolean }>
  >([]);

  constructor() {
    const date = new Date();
    this.currentYear = date.getFullYear();
    this.currentMonthIndex = date.getMonth();
    this.populateCalendar();
  }

  ngOnInit(): void {
    this.stateService.setCurrentPage('Entry');
  }
  isLeapYear(year: number): boolean {
    return (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
  }
  getDaysInMonth(month: number, year: number) {
    switch (month) {
      case 1: // feb
        if (this.isLeapYear(year)) {
          return 29;
        } else {
          return 28;
        }

      case 0:
      case 2:
      case 4:
      case 6:
      case 7:
      case 9:
      case 11:
        return 31;
      default:
        return 30;
    }
  }

  populateCalendar() {
    this.dayObjs().length = 0;
    this.days = this.getDaysInMonth(this.currentMonthIndex, this.currentYear);
    let firstDayInd =
      new Date(this.currentYear, this.currentMonthIndex, 1).getDay() - 1;

    if (firstDayInd == -1) firstDayInd = 6; // sunday is 0 in .getDay()

    for (let i = 0; i < firstDayInd; i++) {
      // pad the days
      this.dayObjs().push({ date: -1 });
    }
    for (let i = 0; i < this.days; i++) {
      const exLogObs = this.dataService.getAllExerciseLogsInDay(
        new Date(this.currentYear, this.currentMonthIndex, i + 1).valueOf()
      );
      const metLogObs = this.dataService.getAllMetricLogsInDay(
        new Date(this.currentYear, this.currentMonthIndex, i + 1).valueOf()
      );

      exLogObs
        .pipe(
          concatMap((resp) => {
            this.dayObjs().push({
              date: i + 1,
              exerciseData: resp == null ? false : true,
            });
            return metLogObs;
          })
        )
        .subscribe({
          next: (resp) => {
            this.dayObjs()[i + firstDayInd].metricData =
              resp == null ? false : true;
          },
          error: (err) => {
            console.log(err);
          },
        });
    }
  }

  incMonth() {
    this.currentMonthIndex = (this.currentMonthIndex + 1) % 12;
    this.populateCalendar();
  }
  decMonth() {
    this.currentMonthIndex = this.currentMonthIndex - 1;
    if (this.currentMonthIndex == -1) {
      this.currentMonthIndex = 11;
    }
    this.populateCalendar();
  }

  incYear() {
    this.currentYear += 1;
    this.populateCalendar();
  }

  decYear() {
    if (this.currentYear > 1) {
      this.currentYear -= 1;
    }
    this.populateCalendar();
  }

  swipeRightCalendar() {
    console.log('inner');
    this.decMonth();
  }
  swipeLeftCalendar() {
    console.log('inner');
    this.incMonth();
  }

  swipeRight() {
    console.log('outer');
    this.router.navigateByUrl('workout/create');
  }

  swipeLeft() {
    //do nothing for now
  }

  getDateTs(day: number) {
    return new Date(this.currentYear, this.currentMonthIndex, day).valueOf();
  }
}
