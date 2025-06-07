import api from './api';
import { TutorApplication } from '../types/tutor';

export interface CreateApplicationRequest {
  fullName: string;
  courseId: number;
  availability: 'full-time' | 'part-time';
  skills: string;
  credentials: string;
  previousRoles: string;
  userId: number;
}

export interface UpdateApplicationRequest {
  fullName?: string;
  availability?: 'full-time' | 'part-time';
  skills?: string;
  credentials?: string;
  previousRoles?: string;
}

export interface UpdateApplicationStatusRequest {
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
}

export const applicationService = {
  // Get all applications
  async getAllApplications(filters?: {
    status?: string;
    courseId?: number;
    userId?: number;
  }): Promise<TutorApplication[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.courseId) params.append('courseId', filters.courseId.toString());
    if (filters?.userId) params.append('userId', filters.userId.toString());

    const response = await api.get(`/applications?${params.toString()}`);
    return response.data.map(this.transformBackendToFrontend);
  },

  // Get application by ID
  async getApplicationById(id: string): Promise<TutorApplication> {
    const response = await api.get(`/applications/${id}`);
    return this.transformBackendToFrontend(response.data);
  },

  // Create new application
  async createApplication(data: CreateApplicationRequest): Promise<TutorApplication> {
    const response = await api.post('/applications', data);
    return this.transformBackendToFrontend(response.data);
  },

  // Update application
  async updateApplication(id: string, data: UpdateApplicationRequest): Promise<TutorApplication> {
    const response = await api.put(`/applications/${id}`, data);
    return this.transformBackendToFrontend(response.data);
  },

  // Update application status
  async updateApplicationStatus(id: string, data: UpdateApplicationStatusRequest): Promise<TutorApplication> {
    const response = await api.patch(`/applications/${id}/status`, data);
    return this.transformBackendToFrontend(response.data);
  },

  // Delete application
  async deleteApplication(id: string): Promise<void> {
    await api.delete(`/applications/${id}`);
  },

  // Get applications by user
  async getApplicationsByUser(userId: number): Promise<TutorApplication[]> {
    const response = await api.get(`/applications/user/${userId}`);
    return response.data.map(this.transformBackendToFrontend);
  },

  // Get applications by course
  async getApplicationsByCourse(courseId: number): Promise<TutorApplication[]> {
    const response = await api.get(`/applications/course/${courseId}`);
    return response.data.map(this.transformBackendToFrontend);
  },

  // Transform backend data to frontend format
  transformBackendToFrontend(backendData: any): TutorApplication {
    return {
      id: backendData.id.toString(),
      name: backendData.fullName || 'Unknown',
      selectedCourse: backendData.course?.code || 'Unknown Course',
      selectedRole: backendData.course?.roleType === 'Tutor' ? 'tutor' : 'lab-assistant',
      availability: backendData.availability || 'part-time',
      skills: backendData.skills || '',
      credentials: backendData.credentials || '',
      previousRoles: backendData.previousRoles || '',
      email: backendData.user?.email || 'unknown@example.com',
      timestamp: backendData.submittedAt || new Date().toISOString(),
      status: backendData.status || 'pending'
    };
  }
};