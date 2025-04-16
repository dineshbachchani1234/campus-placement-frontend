import { Student } from './student.model';

export interface Certification {
  certificationId: number;
  studentId: number;
  name: string;
  certificationDate: string;
  student?: Student;
}