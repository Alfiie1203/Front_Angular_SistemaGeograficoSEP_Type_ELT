import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeActorComponent } from './type-actor.component';

describe('TypeActorComponent', () => {
  let component: TypeActorComponent;
  let fixture: ComponentFixture<TypeActorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TypeActorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypeActorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
