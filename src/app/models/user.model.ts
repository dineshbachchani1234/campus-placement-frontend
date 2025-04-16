export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: 'STUDENT' | 'ADMIN' | 'RECRUITER'; // Match the backend enum
    token: string;
  }