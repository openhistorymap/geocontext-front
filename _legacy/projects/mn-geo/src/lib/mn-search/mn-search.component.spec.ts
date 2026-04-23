import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MnSearchComponent } from './mn-search.component';

describe('MnSearchComponent', () => {
  let component: MnSearchComponent;
  let fixture: ComponentFixture<MnSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MnSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MnSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
