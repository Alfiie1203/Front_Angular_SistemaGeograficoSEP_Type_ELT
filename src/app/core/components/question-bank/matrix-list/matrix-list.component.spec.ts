import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatrixListComponent } from './matrix-list.component';

describe('MatrixListComponent', () => {
  let component: MatrixListComponent;
  let fixture: ComponentFixture<MatrixListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MatrixListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatrixListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
