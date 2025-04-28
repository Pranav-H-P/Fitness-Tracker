import { Injectable } from '@angular/core';
import { ShowOptions, Toast } from '@capacitor/toast';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor() {}

  async showToast(text?: any | undefined, duration?: 'long' | 'short') {
    if (!text) {
      text = '';
    }
    if (!duration) {
      duration = 'short';
    }

    await Toast.show({
      text: text,
      duration: duration,
    });
  }
}
