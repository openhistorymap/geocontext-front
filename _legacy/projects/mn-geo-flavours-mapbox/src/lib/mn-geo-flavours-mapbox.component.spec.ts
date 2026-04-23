import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MnGeoFlavoursMapboxComponent } from './mn-geo-flavours-mapbox.component';

describe('MnGeoFlavoursMapboxComponent', () => {
  let component: MnGeoFlavoursMapboxComponent;
  let fixture: ComponentFixture<MnGeoFlavoursMapboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MnGeoFlavoursMapboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MnGeoFlavoursMapboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
