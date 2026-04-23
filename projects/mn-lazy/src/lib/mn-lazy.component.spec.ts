import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MnLazyComponent } from './mn-lazy.component';

describe('MnLazyComponent', () => {
  let component: MnLazyComponent;
  let fixture: ComponentFixture<MnLazyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MnLazyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MnLazyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
