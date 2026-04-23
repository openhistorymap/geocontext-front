import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MnGeoComponent } from './mn-geo.component';

describe('MnGeoComponent', () => {
  let component: MnGeoComponent;
  let fixture: ComponentFixture<MnGeoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MnGeoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MnGeoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
