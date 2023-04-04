import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenQuestionComponent } from './open-question.component';

describe('OpenQuestionComponent', () => {
  let component: OpenQuestionComponent;
  let fixture: ComponentFixture<OpenQuestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OpenQuestionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpenQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
