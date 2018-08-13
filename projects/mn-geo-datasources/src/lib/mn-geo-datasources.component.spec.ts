import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MnGeoDatasourcesComponent } from './mn-geo-datasources.component';

describe('MnGeoDatasourcesComponent', () => {
  let component: MnGeoDatasourcesComponent;
  let fixture: ComponentFixture<MnGeoDatasourcesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MnGeoDatasourcesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MnGeoDatasourcesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
