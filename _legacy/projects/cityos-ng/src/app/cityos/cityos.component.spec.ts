import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CityosComponent } from './cityos.component';

describe('CityosComponent', () => {
  let component: CityosComponent;
  let fixture: ComponentFixture<CityosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CityosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CityosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
