import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MnGeoTransformersMapboxComponent } from './mn-geo-transformers-mapbox.component';

describe('MnGeoTransformersMapboxComponent', () => {
  let component: MnGeoTransformersMapboxComponent;
  let fixture: ComponentFixture<MnGeoTransformersMapboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MnGeoTransformersMapboxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MnGeoTransformersMapboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
