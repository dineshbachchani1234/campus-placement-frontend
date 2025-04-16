import { Interview } from "./interview.model";

export enum OfferStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    DECLINED = 'DECLINED',
    EXPIRED = 'EXPIRED'
  }
  
  export interface JobOffer {
    offerId: number;
    interviewId: number;
    offerDate: string;
    expiryDate: string;
    salary: number;
    status: OfferStatus;
    details?: string;
    interview?: Interview;
  }