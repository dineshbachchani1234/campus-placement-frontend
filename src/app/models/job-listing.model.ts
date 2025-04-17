import { Company } from './company.model';
import { Application } from './application.model';

export enum JobType {
  INTERNSHIP = 'INTERNSHIP',
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME'
}

export interface JobListing {
  id?:      number;  
  jobId: number;
  title: string;
  description: string;
  salary: number;
  jobType: JobType;
  deadline: string;
  postDate: string;
  isActive: boolean;
  company?: Company;
  applications?: Application[];
}