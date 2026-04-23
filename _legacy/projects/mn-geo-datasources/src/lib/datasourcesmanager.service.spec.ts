import { TestBed, inject } from '@angular/core/testing';

import { DatasourcesmanagerService } from './datasourcesmanager.service';

describe('DatasourcesmanagerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DatasourcesmanagerService]
    });
  });

  it('should be created', inject([DatasourcesmanagerService], (service: DatasourcesmanagerService) => {
    expect(service).toBeTruthy();
  }));
});
