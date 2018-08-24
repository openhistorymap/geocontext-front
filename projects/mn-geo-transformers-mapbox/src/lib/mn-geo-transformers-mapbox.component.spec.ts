import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MnGeoTransformersMapboxComponent } from './mn-geo-transformers-mapbox.component';

describe('MnGeoTransformersMapboxComponent', () => {
  let component: MnGeoTransformersMapboxComponent;
  let fixture: ComponentFixture<MnGeoTransformersMapboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MnGeoTransformersMapboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MnGeoTransformersMapboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
