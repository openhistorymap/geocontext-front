import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CityosMainComponent } from './cityos-main.component';

describe('CityosMainComponent', () => {
  let component: CityosMainComponent;
  let fixture: ComponentFixture<CityosMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CityosMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CityosMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
