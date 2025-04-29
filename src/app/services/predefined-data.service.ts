import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PredefinedDataService {
  httpClient = inject(HttpClient);

  dataURL = 'assets/predefined-json.json';

  constructor() {}

  getPredefinedData(): Observable<any> {
    return this.httpClient.get(this.dataURL);
  }
}
