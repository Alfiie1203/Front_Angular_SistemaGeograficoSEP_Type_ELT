import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumeVerifyTraceabilityComponent } from './resume-verify-traceability.component';

describe('ResumeVerifyTraceabilityComponent', () => {
  let component: ResumeVerifyTraceabilityComponent;
  let fixture: ComponentFixture<ResumeVerifyTraceabilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResumeVerifyTraceabilityComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResumeVerifyTraceabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
