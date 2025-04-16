import { College } from './college.model';

export interface PlacementReport {
  reportId: number;
  collegeId: number;
  year: number;
  placedStudents: number;
  totalStudents: number;
  college?: College;
}