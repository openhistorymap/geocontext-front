import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MnGeoDatasourcesComponent } from './mn-geo-datasources.component';

describe('MnGeoDatasourcesComponent', () => {
  let component: MnGeoDatasourcesComponent;
  let fixture: ComponentFixture<MnGeoDatasourcesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MnGeoDatasourcesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MnGeoDatasourcesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
