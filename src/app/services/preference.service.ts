import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PreferenceService {
  constructor() {}

  // TODO Add actual preferences api later

  getRecentEntryCount() {
    return 30;
  }
}
