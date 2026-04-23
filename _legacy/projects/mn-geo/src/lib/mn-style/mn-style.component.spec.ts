import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MnStyleComponent } from './mn-style.component';

describe('MnStyleComponent', () => {
  let component: MnStyleComponent;
  let fixture: ComponentFixture<MnStyleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MnStyleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MnStyleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
