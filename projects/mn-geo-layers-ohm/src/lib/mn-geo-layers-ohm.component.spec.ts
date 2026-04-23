import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MnGeoLayersOhmComponent } from './mn-geo-layers-ohm.component';

describe('MnGeoLayersOhmComponent', () => {
  let component: MnGeoLayersOhmComponent;
  let fixture: ComponentFixture<MnGeoLayersOhmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MnGeoLayersOhmComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MnGeoLayersOhmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
