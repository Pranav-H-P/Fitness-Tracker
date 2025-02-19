import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppStateServiceService {

  currentPage = signal<String>("TestTitle");

  constructor() { }

  getCurrentPage(){
    return this.currentPage;
  }
}
