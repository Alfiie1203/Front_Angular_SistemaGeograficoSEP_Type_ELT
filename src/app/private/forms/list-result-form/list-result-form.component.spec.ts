import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListResultFormComponent } from './list-result-form.component';

describe('ListResultFormComponent', () => {
  let component: ListResultFormComponent;
  let fixture: ComponentFixture<ListResultFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListResultFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListResultFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
