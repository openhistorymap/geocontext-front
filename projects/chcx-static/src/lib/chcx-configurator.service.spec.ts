import { TestBed, inject } from '@angular/core/testing';

import { ChcxConfService } from './chcx-conf.service';

describe('ChcxConfService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChcxConfService]
    });
  });

  it('should be created', inject([ChcxConfService], (service: ChcxConfService) => {
    expect(service).toBeTruthy();
  }));
});
