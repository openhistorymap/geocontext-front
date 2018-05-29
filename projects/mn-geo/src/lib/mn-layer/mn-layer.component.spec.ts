import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MnLayerComponent } from './mn-layer.component';

describe('MnLayerComponent', () => {
  let component: MnLayerComponent;
  let fixture: ComponentFixture<MnLayerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MnLayerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MnLayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
