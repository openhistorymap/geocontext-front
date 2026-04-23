import { TestBed, inject } from '@angular/core/testing';

import { CityosService } from './cityos.service';

describe('CityosService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CityosService]
    });
  });

  it('should be created', inject([CityosService], (service: CityosService) => {
    expect(service).toBeTruthy();
  }));
});
