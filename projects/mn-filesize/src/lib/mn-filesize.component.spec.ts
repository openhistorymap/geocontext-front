import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MnFilesizeComponent } from './mn-filesize.component';

describe('MnFilesizeComponent', () => {
  let component: MnFilesizeComponent;
  let fixture: ComponentFixture<MnFilesizeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MnFilesizeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MnFilesizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
