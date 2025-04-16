import { Application } from './application.model';
import { Recruiter } from './recruiter.model';

export interface Interview {
  interviewId: number;
  applicationId: number;
  recruiterId?: number;
  interviewDate: string;
  feedback?: string;
  result?: string;
  application?: Application;
  recruiter?: Recruiter;
}