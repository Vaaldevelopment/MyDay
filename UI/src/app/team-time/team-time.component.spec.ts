import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamTimeComponent } from './team-time.component';

describe('TeamTimeComponent', () => {
  let component: TeamTimeComponent;
  let fixture: ComponentFixture<TeamTimeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamTimeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
