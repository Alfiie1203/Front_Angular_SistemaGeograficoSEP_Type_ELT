import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyFormListComponent } from './verify-form-list.component';

describe('VerifyFormListComponent', () => {
  let component: VerifyFormListComponent;
  let fixture: ComponentFixture<VerifyFormListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerifyFormListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerifyFormListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
