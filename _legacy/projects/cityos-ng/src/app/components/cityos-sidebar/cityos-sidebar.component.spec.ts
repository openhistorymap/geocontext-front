import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CityosSidebarComponent } from './cityos-sidebar.component';

describe('CityosSidebarComponent', () => {
  let component: CityosSidebarComponent;
  let fixture: ComponentFixture<CityosSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CityosSidebarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CityosSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
