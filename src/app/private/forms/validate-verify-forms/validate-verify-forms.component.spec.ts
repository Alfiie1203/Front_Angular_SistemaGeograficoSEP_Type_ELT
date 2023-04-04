import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidateFormsComponent } from './validate-verify-forms.component';

describe('ValidateFormsComponent', () => {
  let component: ValidateFormsComponent;
  let fixture: ComponentFixture<ValidateFormsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ValidateFormsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValidateFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
