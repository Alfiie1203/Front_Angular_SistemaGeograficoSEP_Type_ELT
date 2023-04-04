import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewFormVerifyComponent } from './review-form-verify.component';

describe('ReviewFormVerifyComponent', () => {
  let component: ReviewFormVerifyComponent;
  let fixture: ComponentFixture<ReviewFormVerifyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReviewFormVerifyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewFormVerifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
