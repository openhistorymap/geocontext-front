import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MnGeoDatasourcesAgentmapComponent } from './mn-geo-datasources-agentmap.component';

describe('MnGeoDatasourcesAgentmapComponent', () => {
  let component: MnGeoDatasourcesAgentmapComponent;
  let fixture: ComponentFixture<MnGeoDatasourcesAgentmapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MnGeoDatasourcesAgentmapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MnGeoDatasourcesAgentmapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
