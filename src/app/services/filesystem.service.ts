import { inject, Injectable } from '@angular/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { from, Observable } from 'rxjs';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class FilesystemService {
  toastService = inject(ToastService);
  constructor() {}

  pickFile() {
    return from(
      FilePicker.pickFiles({
        types: ['application/json'],
        limit: 1,
      })
    );
  }

  requestFilePermission(): Observable<Boolean> {
    return from(
      (async () => {
        try {
          const permissions = await Filesystem.checkPermissions();

          if (permissions.publicStorage === 'granted') {
            return true;
          } else {
            const status = await Filesystem.requestPermissions();
            if (status.publicStorage === 'granted') {
              this.toastService.showToast('Permission Granted');
              return true;
            } else {
              this.toastService.showToast('Permission Denied');
            }
            return false;
          }
        } catch (error) {
          this.toastService.showToast(
            'An error occurred while requesting permissions'
          );
          return false;
        }
      })()
    );
  }

  writeFile(filename: string, path: string, data: any) {
    return from(
      Filesystem.writeFile({
        path: `FitnessTrackerExports/${path}/${filename}`,
        data: data,
        encoding: Encoding.UTF8,
        directory: Directory.Documents,
        recursive: true,
      })
    );
  }
}
