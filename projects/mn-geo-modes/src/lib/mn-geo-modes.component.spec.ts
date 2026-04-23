import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MnGeoModesComponent } from './mn-geo-modes.component';

describe('MnGeoModesComponent', () => {
  let component: MnGeoModesComponent;
  let fixture: ComponentFixture<MnGeoModesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MnGeoModesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MnGeoModesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
