import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectOneListComponent } from './select-one-list.component';

describe('SelectOneListComponent', () => {
  let component: SelectOneListComponent;
  let fixture: ComponentFixture<SelectOneListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectOneListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectOneListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
