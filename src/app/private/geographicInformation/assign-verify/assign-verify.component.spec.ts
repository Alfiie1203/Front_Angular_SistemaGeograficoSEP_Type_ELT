import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignVerifyComponent } from './assign-verify.component';

describe('AssignVerifyComponent', () => {
  let component: AssignVerifyComponent;
  let fixture: ComponentFixture<AssignVerifyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignVerifyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignVerifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
