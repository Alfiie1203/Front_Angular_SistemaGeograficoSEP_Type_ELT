import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyCompanyComponent } from './verify-company.component';

describe('VerifyCompanyComponent', () => {
  let component: VerifyCompanyComponent;
  let fixture: ComponentFixture<VerifyCompanyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerifyCompanyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerifyCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
