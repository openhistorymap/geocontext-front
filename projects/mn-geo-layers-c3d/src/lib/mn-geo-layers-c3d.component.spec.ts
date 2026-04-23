import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MnGeoLayersC3dComponent } from './mn-geo-layers-c3d.component';

describe('MnGeoLayersC3dComponent', () => {
  let component: MnGeoLayersC3dComponent;
  let fixture: ComponentFixture<MnGeoLayersC3dComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MnGeoLayersC3dComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MnGeoLayersC3dComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
