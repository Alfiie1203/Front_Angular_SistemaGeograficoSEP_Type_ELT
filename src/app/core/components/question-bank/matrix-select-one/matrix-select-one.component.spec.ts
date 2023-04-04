import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatrixSelectOneComponent } from './matrix-select-one.component';

describe('MatrixSelectOneComponent', () => {
  let component: MatrixSelectOneComponent;
  let fixture: ComponentFixture<MatrixSelectOneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MatrixSelectOneComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatrixSelectOneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
