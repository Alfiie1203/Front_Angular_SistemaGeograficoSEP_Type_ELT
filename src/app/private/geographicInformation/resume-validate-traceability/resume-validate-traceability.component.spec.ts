import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumeValidateTraceabilityComponent } from './resume-validate-traceability.component';

describe('ResumeValidateTraceabilityComponent', () => {
  let component: ResumeValidateTraceabilityComponent;
  let fixture: ComponentFixture<ResumeValidateTraceabilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResumeValidateTraceabilityComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResumeValidateTraceabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
