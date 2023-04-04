import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTraceabilityComponent } from './view-traceability.component';

describe('ViewTraceabilityComponent', () => {
  let component: ViewTraceabilityComponent;
  let fixture: ComponentFixture<ViewTraceabilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewTraceabilityComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewTraceabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
