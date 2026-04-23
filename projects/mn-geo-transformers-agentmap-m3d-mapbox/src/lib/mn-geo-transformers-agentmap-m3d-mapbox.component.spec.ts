import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MnGeoTransformersAgentmapM3dMapboxComponent } from './mn-geo-transformers-agentmap-m3d-mapbox.component';

describe('MnGeoTransformersAgentmapM3dMapboxComponent', () => {
  let component: MnGeoTransformersAgentmapM3dMapboxComponent;
  let fixture: ComponentFixture<MnGeoTransformersAgentmapM3dMapboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MnGeoTransformersAgentmapM3dMapboxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MnGeoTransformersAgentmapM3dMapboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
