import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignCompanyVerifyComponent } from './assign-company-verify.component';

describe('AssignCompanyVerifyComponent', () => {
  let component: AssignCompanyVerifyComponent;
  let fixture: ComponentFixture<AssignCompanyVerifyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignCompanyVerifyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignCompanyVerifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
