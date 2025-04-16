import { Student } from './student.model';
import { JobListing } from './job-listing.model';
import { Interview } from './interview.model';

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
  studentId: number;
  jobId: number;
  applicationDate: string;
  status: ApplicationStatus;
  student?: Student;
  job?: JobListing;
  interviews?: Interview[];
}