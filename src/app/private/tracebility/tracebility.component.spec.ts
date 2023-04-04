import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TracebilityComponent } from './tracebility.component';

describe('TracebilityComponent', () => {
  let component: TracebilityComponent;
  let fixture: ComponentFixture<TracebilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TracebilityComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TracebilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
