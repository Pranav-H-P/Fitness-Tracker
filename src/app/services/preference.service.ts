import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PreferenceService {
  constructor() {}

  recentEntryCount = 30;

  proteinRequirement = 150;
  fatRequirement = 60;
  carbRequirement = 300;
  proteinPercent = 20;
  fatPercent = 20;
  carbPercent = 60;

  getRecentEntryCount() {
    return this.recentEntryCount;
  }
}
