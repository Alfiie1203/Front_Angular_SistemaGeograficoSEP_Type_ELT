import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidateTraceabilityComponent } from './validate-traceability.component';

describe('ValidateTraceabilityComponent', () => {
  let component: ValidateTraceabilityComponent;
  let fixture: ComponentFixture<ValidateTraceabilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ValidateTraceabilityComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValidateTraceabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
