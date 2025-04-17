import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewExperienceComponent } from './interview-experience.component';

describe('InterviewExperienceComponent', () => {
  let component: InterviewExperienceComponent;
  let fixture: ComponentFixture<InterviewExperienceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewExperienceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterviewExperienceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
