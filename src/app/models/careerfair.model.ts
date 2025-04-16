import { Company } from './company.model';

export interface CareerFair {
  eventId: number;
  title: string;
  description: string;
  date: string;
  location: string;
  companies?: Company[];
}