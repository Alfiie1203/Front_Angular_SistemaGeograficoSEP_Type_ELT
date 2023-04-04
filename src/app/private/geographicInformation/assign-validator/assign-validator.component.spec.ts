import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignValidatorComponent } from './assign-validator.component';

describe('AssignValidatorComponent', () => {
  let component: AssignValidatorComponent;
  let fixture: ComponentFixture<AssignValidatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignValidatorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignValidatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
