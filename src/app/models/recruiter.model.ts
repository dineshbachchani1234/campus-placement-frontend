import { Company } from './company.model';
import { User } from './user.model';

export interface Recruiter {
  recruiterId: number;
  userId: number;
  position: string;
  companyId: number;
  company?: Company;
  user?: User;
}