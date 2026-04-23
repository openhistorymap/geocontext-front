import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MnGeoFlavoursComponent } from './mn-geo-flavours.component';

describe('MnGeoFlavoursComponent', () => {
  let component: MnGeoFlavoursComponent;
  let fixture: ComponentFixture<MnGeoFlavoursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MnGeoFlavoursComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MnGeoFlavoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
