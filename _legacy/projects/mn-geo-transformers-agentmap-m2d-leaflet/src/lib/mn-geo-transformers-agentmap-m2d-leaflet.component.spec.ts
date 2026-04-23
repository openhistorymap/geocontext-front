import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MnGeoTransformersAgentmapM2dLeafletComponent } from './mn-geo-transformers-agentmap-m2d-leaflet.component';

describe('MnGeoTransformersAgentmapM2dLeafletComponent', () => {
  let component: MnGeoTransformersAgentmapM2dLeafletComponent;
  let fixture: ComponentFixture<MnGeoTransformersAgentmapM2dLeafletComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MnGeoTransformersAgentmapM2dLeafletComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MnGeoTransformersAgentmapM2dLeafletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
