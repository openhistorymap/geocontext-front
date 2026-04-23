import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GcxMainComponent } from './gcx-main.component';

describe('GcxMainComponent', () => {
  let component: GcxMainComponent;
  let fixture: ComponentFixture<GcxMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GcxMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GcxMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
