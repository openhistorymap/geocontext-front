import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OhmCoreComponent } from './ohm-core.component';

describe('OhmCoreComponent', () => {
  let component: OhmCoreComponent;
  let fixture: ComponentFixture<OhmCoreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OhmCoreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OhmCoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
