import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MnDatasourcefilterComponent } from './mn-datasourcefilter.component';

describe('MnDatasourcefilterComponent', () => {
  let component: MnDatasourcefilterComponent;
  let fixture: ComponentFixture<MnDatasourcefilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MnDatasourcefilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MnDatasourcefilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
