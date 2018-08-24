import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MnGeoTransformersLeafletComponent } from './mn-geo-transformers-leaflet.component';

describe('MnGeoTransformersLeafletComponent', () => {
  let component: MnGeoTransformersLeafletComponent;
  let fixture: ComponentFixture<MnGeoTransformersLeafletComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MnGeoTransformersLeafletComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MnGeoTransformersLeafletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
