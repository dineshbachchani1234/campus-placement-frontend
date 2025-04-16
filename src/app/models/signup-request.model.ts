export interface SignupRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: 'STUDENT' | 'RECRUITER' | 'ADMIN';
    // Additional fields based on role
    collegeId?: number;
    major?: string;
    gpa?: string;
    resume?: string;
    companyId?: number;
    position?: string;
  }