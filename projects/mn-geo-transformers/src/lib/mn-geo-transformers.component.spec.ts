import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MnGeoTransformersComponent } from './mn-geo-transformers.component';

describe('MnGeoTransformersComponent', () => {
  let component: MnGeoTransformersComponent;
  let fixture: ComponentFixture<MnGeoTransformersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MnGeoTransformersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MnGeoTransformersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
