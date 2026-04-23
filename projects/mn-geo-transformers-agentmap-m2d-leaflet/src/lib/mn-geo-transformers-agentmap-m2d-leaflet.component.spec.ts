import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MnGeoTransformersAgentmapM2dLeafletComponent } from './mn-geo-transformers-agentmap-m2d-leaflet.component';

describe('MnGeoTransformersAgentmapM2dLeafletComponent', () => {
  let component: MnGeoTransformersAgentmapM2dLeafletComponent;
  let fixture: ComponentFixture<MnGeoTransformersAgentmapM2dLeafletComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MnGeoTransformersAgentmapM2dLeafletComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MnGeoTransformersAgentmapM2dLeafletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
