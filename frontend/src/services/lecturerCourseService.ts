import api from './api';

export interface LecturerCourse {
  id: number;
  lecturer: {
    id: number;
    email: string;
  };
  course: {
    id: number;
    code: string;
    title: string;
    roleType: string;
  };
}

export interface Course {
  id: number;
  code: string;
  title: string;
  roleType: string;
}

export const lecturerCourseService = {
  // Get all lecturer-course assignments
  async getAllLecturerCourses(): Promise<LecturerCourse[]> {
    const response = await api.get('/lecturercourses');
    return response.data;
  },

  // Get courses assigned to a specific lecturer
  async getCoursesByLecturer(lecturerId: number): Promise<Course[]> {
    const response = await api.get(`/lecturercourses/lecturer/${lecturerId}`);
    return response.data;
  },

  // Get lecturers assigned to a specific course
  async getLecturersByCourse(courseId: number): Promise<LecturerCourse[]> {
    const response = await api.get(`/lecturercourses/course/${courseId}`);
    return response.data;
  },

  // Create new lecturer-course assignment
  async createLecturerCourse(lecturerId: number, courseId: number): Promise<LecturerCourse> {
    const response = await api.post('/lecturercourses', {
      lecturerId,
      courseId
    });
    return response.data;
  },

  // Delete lecturer-course assignment
  async deleteLecturerCourseByIds(lecturerId: number, courseId: number): Promise<void> {
    await api.delete(`/lecturercourses/lecturer/${lecturerId}/course/${courseId}`);
  }
};