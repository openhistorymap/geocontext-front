import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MnMarkerComponent } from './mn-marker.component';

describe('MnMarkerComponent', () => {
  let component: MnMarkerComponent;
  let fixture: ComponentFixture<MnMarkerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MnMarkerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MnMarkerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
