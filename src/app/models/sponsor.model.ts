import { CareerFair } from './careerfair.model';

export interface Sponsor {
  sponsorId: number;
  name: string;
  email: string;
  amount: number;
  eventId: number;
  careerFair?: CareerFair;
}