import { Company } from './company.model';
import { Application } from './application.model';

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
  companyId: number;
  company?: Company;
  applications?: Application[];
}