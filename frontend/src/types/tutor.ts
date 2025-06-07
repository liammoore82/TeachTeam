// types/tutor.ts

export interface TutorApplication {
  id: string;
  name: string;
  selectedCourse: string;
  selectedRole: string; // New field for role (tutor or lab-assistant)
  availability: string;
  skills: string;
  credentials: string;
  previousRoles: string;
  email: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
}

export interface SelectedCandidate {
  applicationId: string;
  name: string;
  email: string;
  course: string;
  role: string; // New field for role
  rank: number;
  comments: string;
}