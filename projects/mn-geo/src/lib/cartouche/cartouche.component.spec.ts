import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CartoucheComponent } from './cartouche.component';

describe('CartoucheComponent', () => {
  let component: CartoucheComponent;
  let fixture: ComponentFixture<CartoucheComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CartoucheComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CartoucheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
