import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessGroupComponent } from './business-group.component';

describe('BusinessGroupComponent', () => {
  let component: BusinessGroupComponent;
  let fixture: ComponentFixture<BusinessGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusinessGroupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusinessGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
