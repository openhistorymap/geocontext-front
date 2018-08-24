import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MnGeoFlavoursLeafletComponent } from './mn-geo-flavours-leaflet.component';

describe('MnGeoFlavoursLeafletComponent', () => {
  let component: MnGeoFlavoursLeafletComponent;
  let fixture: ComponentFixture<MnGeoFlavoursLeafletComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MnGeoFlavoursLeafletComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MnGeoFlavoursLeafletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
