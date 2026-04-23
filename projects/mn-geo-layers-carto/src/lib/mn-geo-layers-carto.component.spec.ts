import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MnGeoLayersCartoComponent } from './mn-geo-layers-carto.component';

describe('MnGeoLayersCartoComponent', () => {
  let component: MnGeoLayersCartoComponent;
  let fixture: ComponentFixture<MnGeoLayersCartoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MnGeoLayersCartoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MnGeoLayersCartoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
