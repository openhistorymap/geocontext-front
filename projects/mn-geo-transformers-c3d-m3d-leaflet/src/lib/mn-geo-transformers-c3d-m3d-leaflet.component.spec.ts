import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MnGeoTransformersC3dM3dLeafletComponent } from './mn-geo-transformers-c3d-m3d-leaflet.component';

describe('MnGeoTransformersC3dM3dLeafletComponent', () => {
  let component: MnGeoTransformersC3dM3dLeafletComponent;
  let fixture: ComponentFixture<MnGeoTransformersC3dM3dLeafletComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MnGeoTransformersC3dM3dLeafletComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MnGeoTransformersC3dM3dLeafletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
