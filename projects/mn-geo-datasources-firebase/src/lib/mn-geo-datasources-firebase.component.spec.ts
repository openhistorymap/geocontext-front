import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MnGeoDatasourcesFirebaseComponent } from './mn-geo-datasources-firebase.component';

describe('MnGeoDatasourcesFirebaseComponent', () => {
  let component: MnGeoDatasourcesFirebaseComponent;
  let fixture: ComponentFixture<MnGeoDatasourcesFirebaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MnGeoDatasourcesFirebaseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MnGeoDatasourcesFirebaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
