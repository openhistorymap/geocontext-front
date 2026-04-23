import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MnGeoLayersOsmComponent } from './mn-geo-layers-osm.component';

describe('MnGeoLayersOsmComponent', () => {
  let component: MnGeoLayersOsmComponent;
  let fixture: ComponentFixture<MnGeoLayersOsmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MnGeoLayersOsmComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MnGeoLayersOsmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
