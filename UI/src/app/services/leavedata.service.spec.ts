import { TestBed } from '@angular/core/testing';

import { LeavedataService } from './leavedata.service';

describe('LeavedataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LeavedataService = TestBed.get(LeavedataService);
    expect(service).toBeTruthy();
  });
});
