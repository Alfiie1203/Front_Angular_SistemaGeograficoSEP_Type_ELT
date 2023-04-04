import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListFormsColaboratorsComponent } from './list-forms-colaborators.component';

describe('ListFormsColaboratorsComponent', () => {
  let component: ListFormsColaboratorsComponent;
  let fixture: ComponentFixture<ListFormsColaboratorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListFormsColaboratorsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListFormsColaboratorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
