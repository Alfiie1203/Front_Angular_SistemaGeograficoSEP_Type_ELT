import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyTraceabilityComponent } from './verify-traceability.component';

describe('VerifyTraceabilityComponent', () => {
  let component: VerifyTraceabilityComponent;
  let fixture: ComponentFixture<VerifyTraceabilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerifyTraceabilityComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerifyTraceabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
