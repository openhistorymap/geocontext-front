import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChcxMainComponent } from './chcx-main.component';

describe('ChcxMainComponent', () => {
  let component: ChcxMainComponent;
  let fixture: ComponentFixture<ChcxMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChcxMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChcxMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
