export type TutorApplication = {
    id: string;
    name: string;
    selectedCourse: string;
    availability: string;
    skills: string;
    credentials: string;
    previousRoles: string;
    email: string;
    timestamp?: string;
  }
  
  export type SelectedCandidate = {
    applicationId: string;
    name: string;
    email: string;
    course: string;
    rank: number;
    comments: string;
  }