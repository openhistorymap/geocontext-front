import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MnCachingComponent } from './mn-caching.component';

describe('MnCachingComponent', () => {
  let component: MnCachingComponent;
  let fixture: ComponentFixture<MnCachingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MnCachingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MnCachingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
