import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MnGeoFlavoursLeafletComponent } from './mn-geo-flavours-leaflet.component';

describe('MnGeoFlavoursLeafletComponent', () => {
  let component: MnGeoFlavoursLeafletComponent;
  let fixture: ComponentFixture<MnGeoFlavoursLeafletComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MnGeoFlavoursLeafletComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MnGeoFlavoursLeafletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
