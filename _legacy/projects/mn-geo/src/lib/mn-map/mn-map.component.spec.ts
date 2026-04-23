import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MnMapComponent } from './mn-map.component';

describe('MnMapComponent', () => {
  let component: MnMapComponent;
  let fixture: ComponentFixture<MnMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MnMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MnMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
