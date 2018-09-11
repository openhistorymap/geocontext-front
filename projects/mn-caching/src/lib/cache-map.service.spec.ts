/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CacheMapService } from './cache-map.service';

describe('Service: CacheMap', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CacheMapService]
    });
  });

  it('should ...', inject([CacheMapService], (service: CacheMapService) => {
    expect(service).toBeTruthy();
  }));
});
