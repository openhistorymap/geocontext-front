import { TestBed, inject } from '@angular/core/testing';

import { DatasetRegistryService } from './dataset-registry.service';

describe('DatasetRegistryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DatasetRegistryService]
    });
  });

  it('should be created', inject([DatasetRegistryService], (service: DatasetRegistryService) => {
    expect(service).toBeTruthy();
  }));
});
