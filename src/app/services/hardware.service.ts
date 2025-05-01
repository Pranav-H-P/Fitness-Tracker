import { Location } from '@angular/common';
import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { App } from '@capacitor/app';
import { AppStateService } from './app-state.service';

@Injectable({
  providedIn: 'root',
})
export class HardwareService {
  stateService = inject(AppStateService);
  location = inject(Location);
  constructor() {
    App.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) {
        if (this.stateService.popUpName()) {
          // popup active
          this.stateService.clearPopup();
        } else {
          App.exitApp();
        }
      } else {
        if (this.stateService.popUpName()) {
          // popup active
          this.stateService.clearPopup();
        } else {
          this.location.back();
        }
      }
      console.log('name: ' + this.stateService.popUpName());
    });
  }
}
