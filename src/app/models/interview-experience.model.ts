export interface InterviewExperience {
  experienceID?: number;
  interview: {
    interviewId: number;
  };
  student: {
    studentId: number;
  };
  comment: string;
  rating: number;
  postDate?: string;
}