import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MnGeoDatasourcesCsvComponent } from './mn-geo-datasources-csv.component';

describe('MnGeoDatasourcesCsvComponent', () => {
  let component: MnGeoDatasourcesCsvComponent;
  let fixture: ComponentFixture<MnGeoDatasourcesCsvComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MnGeoDatasourcesCsvComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MnGeoDatasourcesCsvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
