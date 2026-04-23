import { TestBed } from '@angular/core/testing';

import { MnGeoDatasourcesFirebaseService } from './mn-geo-datasources-firebase.service';

describe('MnGeoDatasourcesFirebaseService', () => {
  let service: MnGeoDatasourcesFirebaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MnGeoDatasourcesFirebaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
