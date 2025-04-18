// Represents a student entity.
import {User} from './user.model';

export interface Student {
    studentId: number;
    firstName: string;
    lastName: string;
    email: string;
    university: string;
    gpa: number;

    user: User;
  }
