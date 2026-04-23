import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OhmCoreComponent } from './ohm-core.component';

describe('OhmCoreComponent', () => {
  let component: OhmCoreComponent;
  let fixture: ComponentFixture<OhmCoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OhmCoreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OhmCoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
