import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Course } from '../entity/Course';
import { Like } from 'typeorm';

export class CourseController {
  private courseRepository = AppDataSource.getRepository(Course);

  // GET /courses - Get all courses
  async getAllCourses(req: Request, res: Response) {
    try {
      const { search, roleType } = req.query;
      let whereCondition: any = {};

      // Add search functionality
      if (search) {
        whereCondition = [
          { code: Like(`%${search}%`) },
          { title: Like(`%${search}%`) }
        ];
      }

      // Filter by role type
      if (roleType) {
        if (Array.isArray(whereCondition)) {
          whereCondition = whereCondition.map(condition => ({ ...condition, roleType }));
        } else {
          whereCondition.roleType = roleType;
        }
      }

      const courses = await this.courseRepository.find({
        where: whereCondition,
        relations: ['applications', 'lecturerCourses']
      });

      res.json(courses);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch courses' });
    }
  }

  // GET /courses/:id - Get course by ID
  async getCourseById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const course = await this.courseRepository.findOne({
        where: { id: parseInt(id) },
        relations: ['applications', 'lecturerCourses', 'lecturerCourses.lecturer']
      });

      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      res.json(course);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch course' });
    }
  }

  // POST /courses - Create new course
  async createCourse(req: Request, res: Response) {
    try {
      const { code, title, roleType } = req.body;

      // Validate input
      if (!Course.validate({ code, title, roleType })) {
        return res.status(400).json({ error: 'Invalid course data' });
      }

      // Check if course code already exists
      const existingCourse = await this.courseRepository.findOne({ where: { code } });
      if (existingCourse) {
        return res.status(409).json({ error: 'Course with this code already exists' });
      }

      // Create course
      const course = this.courseRepository.create({
        code,
        title,
        roleType
      });

      const savedCourse = await this.courseRepository.save(course);
      res.status(201).json(savedCourse);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create course' });
    }
  }

  // PUT /courses/:id - Update course
  async updateCourse(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { code, title, roleType } = req.body;

      const course = await this.courseRepository.findOne({ where: { id: parseInt(id) } });
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      // Update fields
      if (code) course.code = code;
      if (title) course.title = title;
      if (roleType) course.roleType = roleType;

      const updatedCourse = await this.courseRepository.save(course);
      res.json(updatedCourse);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update course' });
    }
  }

  // DELETE /courses/:id - Delete course
  async deleteCourse(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await this.courseRepository.delete(parseInt(id));

      if (result.affected === 0) {
        return res.status(404).json({ error: 'Course not found' });
      }

      res.json({ message: 'Course deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete course' });
    }
  }

  // GET /courses/:id/applications - Get applications for a course
  async getCourseApplications(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const course = await this.courseRepository.findOne({
        where: { id: parseInt(id) },
        relations: ['applications', 'applications.user']
      });

      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      res.json(course.applications);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch course applications' });
    }
  }

  // GET /courses/:id/lecturers - Get lecturers for a course
  async getCourseLecturers(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const course = await this.courseRepository.findOne({
        where: { id: parseInt(id) },
        relations: ['lecturerCourses', 'lecturerCourses.lecturer']
      });

      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      const lecturers = course.lecturerCourses.map(lc => lc.lecturer.toSafeObject());
      res.json(lecturers);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch course lecturers' });
    }
  }
}