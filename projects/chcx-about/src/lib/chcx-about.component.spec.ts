import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChcxAboutComponent } from './chcx-about.component';

describe('ChcxAboutComponent', () => {
  let component: ChcxAboutComponent;
  let fixture: ComponentFixture<ChcxAboutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChcxAboutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChcxAboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
