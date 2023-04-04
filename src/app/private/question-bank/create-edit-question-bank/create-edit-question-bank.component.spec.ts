import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEditQuestionBankComponent } from './create-edit-question-bank.component';

describe('CreateEditQuestionBankComponent', () => {
  let component: CreateEditQuestionBankComponent;
  let fixture: ComponentFixture<CreateEditQuestionBankComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateEditQuestionBankComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateEditQuestionBankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
