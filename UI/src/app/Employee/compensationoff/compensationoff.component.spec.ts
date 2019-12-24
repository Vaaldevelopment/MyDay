import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompensationoffComponent } from './compensationoff.component';

describe('CompensationoffComponent', () => {
  let component: CompensationoffComponent;
  let fixture: ComponentFixture<CompensationoffComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompensationoffComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompensationoffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
