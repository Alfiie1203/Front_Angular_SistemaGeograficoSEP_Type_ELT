import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatrixSelectMultipleComponent } from './matrix-select-multiple.component';

describe('MatrixSelectMultipleComponent', () => {
  let component: MatrixSelectMultipleComponent;
  let fixture: ComponentFixture<MatrixSelectMultipleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MatrixSelectMultipleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatrixSelectMultipleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
