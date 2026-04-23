import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MnGeoLayersComponent } from './mn-geo-layers.component';

describe('MnGeoLayersComponent', () => {
  let component: MnGeoLayersComponent;
  let fixture: ComponentFixture<MnGeoLayersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MnGeoLayersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MnGeoLayersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
