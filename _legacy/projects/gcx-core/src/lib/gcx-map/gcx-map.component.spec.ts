import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GcxMapComponent } from './gcx-map.component';

describe('GcxMapComponent', () => {
  let component: GcxMapComponent;
  let fixture: ComponentFixture<GcxMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GcxMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GcxMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
