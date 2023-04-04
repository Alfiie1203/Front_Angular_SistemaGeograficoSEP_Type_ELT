import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeographicinformationComponent } from './geographicinformation.component';

describe('GeographicinformationComponent', () => {
  let component: GeographicinformationComponent;
  let fixture: ComponentFixture<GeographicinformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeographicinformationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeographicinformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
