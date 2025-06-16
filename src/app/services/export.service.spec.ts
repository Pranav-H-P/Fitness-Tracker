import { TestBed } from '@angular/core/testing';

import { ExportService } from './export.service';

describe('ExportServiceService', () => {
  let service: ExportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
