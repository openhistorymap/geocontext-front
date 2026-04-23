import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MnGeoTransformersStamenLeafletComponent } from './mn-geo-transformers-stamen-leaflet.component';

describe('MnGeoTransformersStamenLeafletComponent', () => {
  let component: MnGeoTransformersStamenLeafletComponent;
  let fixture: ComponentFixture<MnGeoTransformersStamenLeafletComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MnGeoTransformersStamenLeafletComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MnGeoTransformersStamenLeafletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
