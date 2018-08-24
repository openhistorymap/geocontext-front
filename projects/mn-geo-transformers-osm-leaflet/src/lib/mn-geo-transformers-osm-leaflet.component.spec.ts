import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MnGeoTransformersOsmLeafletComponent } from './mn-geo-transformers-osm-leaflet.component';

describe('MnGeoTransformersOsmLeafletComponent', () => {
  let component: MnGeoTransformersOsmLeafletComponent;
  let fixture: ComponentFixture<MnGeoTransformersOsmLeafletComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MnGeoTransformersOsmLeafletComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MnGeoTransformersOsmLeafletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
