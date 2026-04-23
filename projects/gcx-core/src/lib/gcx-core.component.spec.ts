import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GcxCoreComponent } from './gcx-core.component';

describe('GcxCoreComponent', () => {
  let component: GcxCoreComponent;
  let fixture: ComponentFixture<GcxCoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GcxCoreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GcxCoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
