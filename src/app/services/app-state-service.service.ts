import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppStateServiceService {

  currentPage = signal<String>("TestTitle");
  sideBarVisible = signal<Boolean>(false);

  constructor() { }

  getCurrentPage(){
    
    return this.currentPage;
  }

  showSideBar(){
    this.sideBarVisible.set(true);
  }

  hideSideBar(){
    this.sideBarVisible.set(false);
  }
}
