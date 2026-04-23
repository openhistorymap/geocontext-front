import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MnGeoDatasourcesShpComponent } from './mn-geo-datasources-shp.component';

describe('MnGeoDatasourcesShpComponent', () => {
  let component: MnGeoDatasourcesShpComponent;
  let fixture: ComponentFixture<MnGeoDatasourcesShpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MnGeoDatasourcesShpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MnGeoDatasourcesShpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
