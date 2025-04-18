export interface PlacementReport {
  id: {
    collegeID: number;
    year:      number;
  };
  placedStudents: number;
  totalStudents:  number;
  reportDate:     string;
}