import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MnGeoLayersOhmComponent } from './mn-geo-layers-ohm.component';

describe('MnGeoLayersOhmComponent', () => {
  let component: MnGeoLayersOhmComponent;
  let fixture: ComponentFixture<MnGeoLayersOhmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MnGeoLayersOhmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MnGeoLayersOhmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
