import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PreferenceService {
  constructor() {}

  recentEntryCount = 30;

  getRecentEntryCount() {
    return this.recentEntryCount;
  }
}
