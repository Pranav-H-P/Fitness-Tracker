import { TestBed } from '@angular/core/testing';

import { AppStateServiceService } from './app-state-service.service';

describe('AppStateServiceService', () => {
  let service: AppStateServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppStateServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
