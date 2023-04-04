import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEditTraceabilityAdminComponent } from './create-edit-traceability-admin.component';

describe('CreateEditTraceabilityAdminComponent', () => {
  let component: CreateEditTraceabilityAdminComponent;
  let fixture: ComponentFixture<CreateEditTraceabilityAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateEditTraceabilityAdminComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateEditTraceabilityAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
