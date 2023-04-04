import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidateFormListComponent } from './validate-form-list.component';

describe('ValidateFormListComponent', () => {
  let component: ValidateFormListComponent;
  let fixture: ComponentFixture<ValidateFormListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ValidateFormListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValidateFormListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
