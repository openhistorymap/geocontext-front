import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MnGeoModesM3dComponent } from './mn-geo-modes-m3d.component';

describe('MnGeoModesM3dComponent', () => {
  let component: MnGeoModesM3dComponent;
  let fixture: ComponentFixture<MnGeoModesM3dComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MnGeoModesM3dComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MnGeoModesM3dComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
