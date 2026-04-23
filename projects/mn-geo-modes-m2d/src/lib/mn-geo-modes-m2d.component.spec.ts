import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MnGeoModesM2dComponent } from './mn-geo-modes-m2d.component';

describe('MnGeoModesM2dComponent', () => {
  let component: MnGeoModesM2dComponent;
  let fixture: ComponentFixture<MnGeoModesM2dComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MnGeoModesM2dComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MnGeoModesM2dComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
