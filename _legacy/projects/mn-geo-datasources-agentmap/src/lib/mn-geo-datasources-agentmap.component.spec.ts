import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MnGeoDatasourcesAgentmapComponent } from './mn-geo-datasources-agentmap.component';

describe('MnGeoDatasourcesAgentmapComponent', () => {
  let component: MnGeoDatasourcesAgentmapComponent;
  let fixture: ComponentFixture<MnGeoDatasourcesAgentmapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MnGeoDatasourcesAgentmapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MnGeoDatasourcesAgentmapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
