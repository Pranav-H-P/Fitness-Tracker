import { Injectable } from '@angular/core';
import { App } from '@capacitor/app';

@Injectable({
  providedIn: 'root',
})
export class HardwareService {
  constructor() {
    App.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) {
        App.exitApp();
      } else {
        window.history.back();
      }
    });
  }
}
