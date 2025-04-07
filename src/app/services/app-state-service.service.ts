import { Injectable, Signal, signal } from '@angular/core';
import { AppSectionState } from '../eums';

@Injectable({
  providedIn: 'root'
})
export class AppStateServiceService {

  currentPage = signal<String>("TestTitle");
  sideBarVisible = signal<Boolean>(false);
  appSectionState = signal<AppSectionState>(AppSectionState.DASHBOARD); // if its in dashboard, exercise, diet or settings section

  constructor() { }

  getCurrentPageSignal(): Signal<String>{
    
    return this.currentPage;
  }

  showSideBar(){
    this.sideBarVisible.set(true);
  }

  hideSideBar(){
    this.sideBarVisible.set(false);
  }

  getSideBarStateSignal(): Signal<Boolean>{
    return this.sideBarVisible;
  }
  getAppSectionStateSignal(): Signal<AppSectionState>{
    return this.appSectionState;
  }
  setAppSectionStateSignal(state: AppSectionState){
    this.appSectionState.set(state);
  }
}
