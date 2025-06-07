import api from './api';

export interface Course {
  id: number;
  code: string;
  title: string;
  roleType: 'Tutor' | 'Lab Assistant';
}

export interface CreateCourseRequest {
  code: string;
  title: string;
  roleType: 'Tutor' | 'Lab Assistant';
}

export interface UpdateCourseRequest {
  code?: string;
  title?: string;
  roleType?: 'Tutor' | 'Lab Assistant';
}

export const courseService = {
  // Get all courses
  async getAllCourses(): Promise<Course[]> {
    const response = await api.get('/courses');
    return response.data;
  },

  // Get course by ID
  async getCourseById(id: number): Promise<Course> {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },

  // Create new course
  async createCourse(data: CreateCourseRequest): Promise<Course> {
    const response = await api.post('/courses', data);
    return response.data;
  },

  // Update course
  async updateCourse(id: number, data: UpdateCourseRequest): Promise<Course> {
    const response = await api.put(`/courses/${id}`, data);
    return response.data;
  },

  // Delete course
  async deleteCourse(id: number): Promise<void> {
    await api.delete(`/courses/${id}`);
  },

  // Get courses by role type
  async getCoursesByRole(roleType: 'Tutor' | 'Lab Assistant'): Promise<Course[]> {
    const response = await api.get(`/courses/role/${roleType}`);
    return response.data;
  }
};