import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MnGeoModesM25dComponent } from './mn-geo-modes-m25d.component';

describe('MnGeoModesM25dComponent', () => {
  let component: MnGeoModesM25dComponent;
  let fixture: ComponentFixture<MnGeoModesM25dComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MnGeoModesM25dComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MnGeoModesM25dComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
