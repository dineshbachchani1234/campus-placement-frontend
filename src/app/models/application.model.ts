// Represents a job application submitted by a student.
export interface Application {
    applicationId: number;
    studentId: number;
    jobId: number;
    applicationDate: string; // You can use ISO date string or Date type if you convert accordingly.
    // Using a union type for status based on your SQL ENUM values:
    status: 'PENDING' | 'SHORTLISTED' | 'REJECTED' | 'INTERVIEWED' | 'OFFERED' | 'ACCEPTED' | 'DECLINED';
  }
  