import { Company } from "./company.model";
import { InterviewExperience } from "./interview.model";
import { JobOffer } from "./job-offer.model";
import { Recruiter } from "./recruiter.model";
import { Student } from "./student.model";

// application.model.ts
export enum ApplicationStatus {
  PENDING = 'PENDING',
  SHORTLISTED = 'SHORTLISTED',
  REJECTED = 'REJECTED',
  INTERVIEWED = 'INTERVIEWED',
  OFFERED = 'OFFERED',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED'
}

export interface Application {
  applicationId: number;
  applicationDate: string;
  status: ApplicationStatus;
  student: Student;
  job: JobListing;
  interviews?: Interview[];
  name: string;
}

// interview.model.ts
export enum InterviewStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum InterviewResult {
  PENDING = 'PENDING',
  SELECTED = 'SELECTED',
  REJECTED = 'REJECTED'
}

export interface Interview {
  interviewId: number;
  interviewDate: string;
  status: InterviewStatus;
  result: InterviewResult;
  feedback?: string;
  application: Application;
  recruiter: Recruiter;
  offer?: JobOffer;
  experiences?: InterviewExperience[];
}

// job-listing.model.ts
export enum JobType {
  INTERNSHIP = 'INTERNSHIP',
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME'
}

export interface JobListing {
  jobId: number;
  title: string;
  description: string;
  salary: number;
  jobType: JobType;
  deadline: string;
  postDate: string;
  isActive: boolean;
  company: Company;
  applications?: Application[];
  hasApplied?: boolean;
  
}