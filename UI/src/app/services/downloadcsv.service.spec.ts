import { TestBed } from '@angular/core/testing';

import { DownloadcsvService } from './downloadcsv.service';

describe('DownloadcsvService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DownloadcsvService = TestBed.get(DownloadcsvService);
    expect(service).toBeTruthy();
  });
});
