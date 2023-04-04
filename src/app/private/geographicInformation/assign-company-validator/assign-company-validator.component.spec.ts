import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignCompanyValidatorComponent } from './assign-company-validator.component';

describe('AssignCompanyValidatorComponent', () => {
  let component: AssignCompanyValidatorComponent;
  let fixture: ComponentFixture<AssignCompanyValidatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignCompanyValidatorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignCompanyValidatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
