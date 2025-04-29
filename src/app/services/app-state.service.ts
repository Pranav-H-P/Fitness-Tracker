import { Injectable, Signal, signal } from '@angular/core';
import { AppSectionState } from '../eums';

@Injectable({
  providedIn: 'root',
})
export class AppStateService {
  scrollMap: Map<string, number> = new Map();
  lastTabMap: Map<string, number> = new Map();

  currentPage = signal<String>('TestTitle');
  sideBarVisible = signal<Boolean>(false);
  appSectionState = signal<AppSectionState>(AppSectionState.DASHBOARD); // if its in dashboard, exercise, diet or settings section

  constructor() {}

  getCurrentPageSignal(): Signal<String> {
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

  getSideBarStateSignal(): Signal<Boolean> {
    return this.sideBarVisible;
  }
  getAppSectionStateSignal(): Signal<AppSectionState> {
    return this.appSectionState;
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
}
