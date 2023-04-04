import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListFormsCompanyComponent } from './list-forms-company.component';

describe('ListFormsCompanyComponent', () => {
  let component: ListFormsCompanyComponent;
  let fixture: ComponentFixture<ListFormsCompanyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListFormsCompanyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListFormsCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
