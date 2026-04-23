import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GcxLegendComponent } from './gcx-legend.component';

describe('GcxLegendComponent', () => {
  let component: GcxLegendComponent;
  let fixture: ComponentFixture<GcxLegendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GcxLegendComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GcxLegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
