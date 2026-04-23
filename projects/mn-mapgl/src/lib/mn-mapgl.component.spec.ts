import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MnMapglComponent } from './mn-mapgl.component';

describe('MnMapglComponent', () => {
  let component: MnMapglComponent;
  let fixture: ComponentFixture<MnMapglComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MnMapglComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MnMapglComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
