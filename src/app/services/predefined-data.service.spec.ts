import { TestBed } from '@angular/core/testing';

import { PredefinedDataService } from './predefined-data.service';

describe('PredefinedDataService', () => {
  let service: PredefinedDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PredefinedDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
