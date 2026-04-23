import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MnDatasourceComponent } from './mn-datasource.component';

describe('MnDatasourceComponent', () => {
  let component: MnDatasourceComponent;
  let fixture: ComponentFixture<MnDatasourceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MnDatasourceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MnDatasourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
