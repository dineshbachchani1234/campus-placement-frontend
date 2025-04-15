// Represents an interview related to an application.
export interface Interview {
    interviewId: number;
    applicationId: number;
    interviewDate: string; // ISO date string
    feedback: string;
    result: string;
  }
  