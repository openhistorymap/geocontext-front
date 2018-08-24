import { TestBed, inject } from '@angular/core/testing';

import { MnGeoDatasourcesFirebaseService } from './mn-geo-datasources-firebase.service';

describe('MnGeoDatasourcesFirebaseService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MnGeoDatasourcesFirebaseService]
    });
  });

  it('should be created', inject([MnGeoDatasourcesFirebaseService], (service: MnGeoDatasourcesFirebaseService) => {
    expect(service).toBeTruthy();
  }));
});
