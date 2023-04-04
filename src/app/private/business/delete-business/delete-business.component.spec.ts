import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteBusinessComponent } from './delete-business.component';

describe('DeleteBusinessComponent', () => {
  let component: DeleteBusinessComponent;
  let fixture: ComponentFixture<DeleteBusinessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteBusinessComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteBusinessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
