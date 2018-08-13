import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MnGeoLayersStamenComponent } from './mn-geo-layers-stamen.component';

describe('MnGeoLayersStamenComponent', () => {
  let component: MnGeoLayersStamenComponent;
  let fixture: ComponentFixture<MnGeoLayersStamenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MnGeoLayersStamenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MnGeoLayersStamenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
