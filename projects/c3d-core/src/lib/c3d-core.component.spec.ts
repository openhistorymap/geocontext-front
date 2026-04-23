import { ComponentFixture, TestBed } from '@angular/core/testing';

import { C3dCoreComponent } from './c3d-core.component';

describe('C3dCoreComponent', () => {
  let component: C3dCoreComponent;
  let fixture: ComponentFixture<C3dCoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [C3dCoreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(C3dCoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
