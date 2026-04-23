import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CityosCoverComponent } from './cityos-cover.component';

describe('CityosCoverComponent', () => {
  let component: CityosCoverComponent;
  let fixture: ComponentFixture<CityosCoverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CityosCoverComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CityosCoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
