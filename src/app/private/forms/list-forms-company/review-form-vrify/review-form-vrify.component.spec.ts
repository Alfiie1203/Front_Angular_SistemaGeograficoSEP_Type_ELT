import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewFormVrifyComponent } from './review-form-vrify.component';

describe('ReviewFormVrifyComponent', () => {
  let component: ReviewFormVrifyComponent;
  let fixture: ComponentFixture<ReviewFormVrifyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReviewFormVrifyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewFormVrifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
