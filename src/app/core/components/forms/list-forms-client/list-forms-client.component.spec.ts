import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListFormsClientComponent } from './list-forms-client.component';

describe('ListFormsClientComponent', () => {
  let component: ListFormsClientComponent;
  let fixture: ComponentFixture<ListFormsClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListFormsClientComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListFormsClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
