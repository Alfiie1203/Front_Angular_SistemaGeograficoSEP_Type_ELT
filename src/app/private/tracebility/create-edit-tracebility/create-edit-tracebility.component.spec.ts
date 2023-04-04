import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEditTracebilityComponent } from './create-edit-tracebility.component';

describe('CreateEditTracebilityComponent', () => {
  let component: CreateEditTracebilityComponent;
  let fixture: ComponentFixture<CreateEditTracebilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateEditTracebilityComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateEditTracebilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
