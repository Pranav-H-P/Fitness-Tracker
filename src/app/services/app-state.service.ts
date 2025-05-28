import {
  inject,
  Injectable,
  NgZone,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { AppSectionState, PopupType } from '../eums';
import { ExerciseSetData } from '../models';

@Injectable({
  providedIn: 'root',
})
export class AppStateService {
  ngZone = inject(NgZone);

  scrollMap: Map<string, number> = new Map();
  lastTabMap: Map<string, number> = new Map();
  currentSetMap: Map<number, { load: string; reps: string }> = new Map();

  currentPage = signal<String>('TestTitle');
  sideBarVisible = signal<Boolean>(false);
  appSectionState = signal<AppSectionState>(AppSectionState.DASHBOARD); // if its in dashboard, exercise, diet or settings section

  popUpName = signal<PopupType | null>(null);

  constructor() {}

  getCurrentPageSignal(): WritableSignal<String> {
    return this.currentPage;
  }

  setCurrentPage(title: string) {
    this.currentPage.set(title);
  }

  showSideBar() {
    this.sideBarVisible.set(true);
  }

  hideSideBar() {
    this.sideBarVisible.set(false);
  }

  getSideBarStateSignal(): WritableSignal<Boolean> {
    return this.sideBarVisible;
  }
  getAppSectionStateSignal(): WritableSignal<AppSectionState> {
    return this.appSectionState;
  }

  getPopupSignal(): WritableSignal<string | null> {
    return this.popUpName;
  }

  setAppSectionStateSignal(state: AppSectionState) {
    this.appSectionState.set(state);
  }

  // for remembering state through navigation
  setScrollPos(navLink: string, yPos: number) {
    this.scrollMap.set(navLink, yPos);
  }
  getScrollPos(navLink: string): number {
    const pos = this.scrollMap.get(navLink);

    if (pos) {
      return pos;
    }
    return 0;
  }

  setCurrentSet(exId: number, load: string, reps: string) {
    this.currentSetMap.set(exId, { load: load, reps: reps });
  }
  getCurrentSet(exId: number): { load: string; reps: string } {
    const data = this.currentSetMap.get(exId);

    if (data) {
      return data;
    } else {
      return { load: '', reps: '' };
    }
  }

  setLastTabPage(navLink: string, ind: number) {
    this.lastTabMap.set(navLink, ind);
  }
  getLastTabPage(navLink: string): number {
    const pos = this.lastTabMap.get(navLink);

    if (pos) {
      return pos;
    }
    return 0;
  }

  setPopup(name: PopupType) {
    this.ngZone.run(() => {
      // change detection doesnt work when the back button is pressed
      this.popUpName.set(name);
    });
  }
  clearPopup() {
    this.ngZone.run(() => {
      this.popUpName.set(null);
    });
  }
}
