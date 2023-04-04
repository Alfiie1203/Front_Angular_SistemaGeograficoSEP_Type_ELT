import { TestBed } from '@angular/core/testing';

import { AuthOnedriveService } from './auth-onedrive.service';

describe('AuthOnedriveService', () => {
  let service: AuthOnedriveService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthOnedriveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
