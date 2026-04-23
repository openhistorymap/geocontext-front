import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChcxStaticComponent } from './chcx-static.component';

describe('ChcxStaticComponent', () => {
  let component: ChcxStaticComponent;
  let fixture: ComponentFixture<ChcxStaticComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChcxStaticComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChcxStaticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
