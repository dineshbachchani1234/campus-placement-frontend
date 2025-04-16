export interface User {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    password?: string; // Optional for security reasons when retrieving user
    role: 'STUDENT' | 'RECRUITER' | 'ADMIN';
  }