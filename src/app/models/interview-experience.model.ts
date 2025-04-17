export interface InterviewExperience {
  experienceID?: number;
  interview: {
    interviewId: number;
    application?: {
      job?: {
        title?: string;
        company?: {
          companyName?: string;
        }
      }
    };
  };
  student: {
    studentId: number;
    firstName?: string;
    lastName?: string;
  };
  comment: string;
  rating: number;
  postDate?: string;
}