import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MnGeoTransformersComponent } from './mn-geo-transformers.component';

describe('MnGeoTransformersComponent', () => {
  let component: MnGeoTransformersComponent;
  let fixture: ComponentFixture<MnGeoTransformersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MnGeoTransformersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MnGeoTransformersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
