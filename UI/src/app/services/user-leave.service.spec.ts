import { TestBed } from '@angular/core/testing';

import { UserLeaveService } from './user-leave.service';

describe('UserLeaveService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UserLeaveService = TestBed.get(UserLeaveService);
    expect(service).toBeTruthy();
  });
});
