import { TestBed } from '@angular/core/testing';

import { MnFilesizeService } from './mn-filesize.service';

describe('MnFilesizeService', () => {
  let service: MnFilesizeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MnFilesizeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
