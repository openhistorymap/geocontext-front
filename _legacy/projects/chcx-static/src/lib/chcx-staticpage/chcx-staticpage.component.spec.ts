import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChcxStaticpageComponent } from './chcx-staticpage.component';

describe('ChcxStaticpageComponent', () => {
  let component: ChcxStaticpageComponent;
  let fixture: ComponentFixture<ChcxStaticpageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChcxStaticpageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChcxStaticpageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
