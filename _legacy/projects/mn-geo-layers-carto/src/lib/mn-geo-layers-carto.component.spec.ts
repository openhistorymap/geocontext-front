import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MnGeoLayersCartoComponent } from './mn-geo-layers-carto.component';

describe('MnGeoLayersCartoComponent', () => {
  let component: MnGeoLayersCartoComponent;
  let fixture: ComponentFixture<MnGeoLayersCartoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MnGeoLayersCartoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MnGeoLayersCartoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
