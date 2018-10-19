import { TestBed, inject } from '@angular/core/testing';

import { LayersmanagerService } from './layersmanager.service';

describe('LayersmanagerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LayersmanagerService]
    });
  });

  it('should be created', inject([LayersmanagerService], (service: LayersmanagerService) => {
    expect(service).toBeTruthy();
  }));
});
