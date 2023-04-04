import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEditBusinessComponent } from './create-edit-business.component';

describe('CreateBusinessComponent', () => {
  let component: CreateEditBusinessComponent;
  let fixture: ComponentFixture<CreateEditBusinessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateEditBusinessComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateEditBusinessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
