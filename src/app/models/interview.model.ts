import { Application } from './application.model';
import { Recruiter } from './recruiter.model';

export enum InterviewStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  RESCHEDULED = 'RESCHEDULED'
}

export enum InterviewResult {
  PASSED = 'PASSED',
  REJECTED = 'REJECTED',
  PENDING = 'PENDING'
}

export interface Interview {
  interviewId: number;
  applicationId: number;
  recruiterId?: number;
  interviewDate: string;
  status: InterviewStatus;
  result?: InterviewResult;
  feedback?: string;
  application?: Application;
  recruiter?: Recruiter;
}

export interface InterviewExperience {
  experienceId: number;
  interviewId: number;
  studentId: number;
  comment: string;
  rating: number;
  submissionDate: string;
  interview?: Interview;
}