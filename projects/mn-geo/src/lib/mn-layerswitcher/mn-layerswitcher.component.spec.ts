import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MnLayerswitcherComponent } from './mn-layerswitcher.component';

describe('MnLayerswitcherComponent', () => {
  let component: MnLayerswitcherComponent;
  let fixture: ComponentFixture<MnLayerswitcherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MnLayerswitcherComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MnLayerswitcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
