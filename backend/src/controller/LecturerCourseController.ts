import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { LecturerCourse } from '../entity/LecturerCourse';
import { User } from '../entity/User';
import { Course } from '../entity/Course';

export class LecturerCourseController {
  private lecturerCourseRepository = AppDataSource.getRepository(LecturerCourse);
  private userRepository = AppDataSource.getRepository(User);
  private courseRepository = AppDataSource.getRepository(Course);

  // GET /lecturer-courses - Get all lecturer-course assignments
  async getAllLecturerCourses(req: Request, res: Response) {
    try {
      const { lecturerId, courseId } = req.query;
      let whereCondition: any = {};

      // Filter by lecturer
      if (lecturerId) {
        whereCondition.lecturer = { id: parseInt(lecturerId as string) };
      }

      // Filter by course
      if (courseId) {
        whereCondition.course = { id: parseInt(courseId as string) };
      }

      const lecturerCourses = await this.lecturerCourseRepository.find({
        where: whereCondition,
        relations: ['lecturer', 'course']
      });

      res.json(lecturerCourses);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch lecturer-course assignments' });
    }
  }

  // GET /lecturer-courses/:id - Get lecturer-course assignment by ID
  async getLecturerCourseById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const lecturerCourse = await this.lecturerCourseRepository.findOne({
        where: { id: parseInt(id) },
        relations: ['lecturer', 'course']
      });

      if (!lecturerCourse) {
        return res.status(404).json({ error: 'Lecturer-course assignment not found' });
      }

      res.json(lecturerCourse);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch lecturer-course assignment' });
    }
  }

  // POST /lecturer-courses - Create new lecturer-course assignment
  async createLecturerCourse(req: Request, res: Response) {
    try {
      const { lecturerId, courseId } = req.body;

      // Validate lecturer exists and is a lecturer
      const lecturer = await this.userRepository.findOne({ where: { id: lecturerId } });
      if (!lecturer) {
        return res.status(404).json({ error: 'Lecturer not found' });
      }
      if (lecturer.role !== 'lecturer') {
        return res.status(400).json({ error: 'User is not a lecturer' });
      }

      // Validate course exists
      const course = await this.courseRepository.findOne({ where: { id: courseId } });
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      // Validate input
      if (!LecturerCourse.validate({ lecturer, course })) {
        return res.status(400).json({ error: 'Invalid lecturer-course assignment data' });
      }

      // Check if assignment already exists
      const existingAssignment = await this.lecturerCourseRepository.findOne({
        where: {
          lecturer: { id: lecturerId },
          course: { id: courseId }
        }
      });

      if (existingAssignment) {
        return res.status(409).json({ error: 'Lecturer is already assigned to this course' });
      }

      // Create assignment
      const lecturerCourse = this.lecturerCourseRepository.create({
        lecturer,
        course
      });

      const savedLecturerCourse = await this.lecturerCourseRepository.save(lecturerCourse);
      
      // Fetch with relations for response
      const lecturerCourseWithRelations = await this.lecturerCourseRepository.findOne({
        where: { id: savedLecturerCourse.id },
        relations: ['lecturer', 'course']
      });

      res.status(201).json(lecturerCourseWithRelations);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create lecturer-course assignment' });
    }
  }

  // DELETE /lecturer-courses/:id - Delete lecturer-course assignment
  async deleteLecturerCourse(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await this.lecturerCourseRepository.delete(parseInt(id));

      if (result.affected === 0) {
        return res.status(404).json({ error: 'Lecturer-course assignment not found' });
      }

      res.json({ message: 'Lecturer-course assignment deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete lecturer-course assignment' });
    }
  }

  // DELETE /lecturer-courses/lecturer/:lecturerId/course/:courseId - Delete by lecturer and course IDs
  async deleteLecturerCourseByIds(req: Request, res: Response) {
    try {
      const { lecturerId, courseId } = req.params;
      
      const lecturerCourse = await this.lecturerCourseRepository.findOne({
        where: {
          lecturer: { id: parseInt(lecturerId) },
          course: { id: parseInt(courseId) }
        }
      });

      if (!lecturerCourse) {
        return res.status(404).json({ error: 'Lecturer-course assignment not found' });
      }

      await this.lecturerCourseRepository.remove(lecturerCourse);
      res.json({ message: 'Lecturer-course assignment deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete lecturer-course assignment' });
    }
  }

  // GET /lecturer-courses/lecturer/:lecturerId - Get courses for a specific lecturer
  async getCoursesByLecturer(req: Request, res: Response) {
    try {
      const { lecturerId } = req.params;
      
      const lecturerCourses = await this.lecturerCourseRepository.find({
        where: { lecturer: { id: parseInt(lecturerId) } },
        relations: ['course']
      });

      const courses = lecturerCourses.map(lc => lc.course);
      res.json(courses);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch lecturer courses' });
    }
  }

  // GET /lecturer-courses/course/:courseId - Get lecturers for a specific course
  async getLecturersByCourse(req: Request, res: Response) {
    try {
      const { courseId } = req.params;
      
      const lecturerCourses = await this.lecturerCourseRepository.find({
        where: { course: { id: parseInt(courseId) } },
        relations: ['lecturer']
      });

      const lecturers = lecturerCourses.map(lc => lc.lecturer.toSafeObject());
      res.json(lecturers);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch course lecturers' });
    }
  }

  // POST /lecturer-courses/bulk - Bulk assign lecturer to multiple courses
  async bulkAssignLecturerToCourses(req: Request, res: Response) {
    try {
      const { lecturerId, courseIds } = req.body;

      // Validate lecturer exists and is a lecturer
      const lecturer = await this.userRepository.findOne({ where: { id: lecturerId } });
      if (!lecturer || lecturer.role !== 'lecturer') {
        return res.status(400).json({ error: 'Invalid lecturer' });
      }

      const assignments = [];
      const errors = [];

      for (const courseId of courseIds) {
        try {
          // Check if course exists
          const course = await this.courseRepository.findOne({ where: { id: courseId } });
          if (!course) {
            errors.push(`Course with ID ${courseId} not found`);
            continue;
          }

          // Check if assignment already exists
          const existingAssignment = await this.lecturerCourseRepository.findOne({
            where: {
              lecturer: { id: lecturerId },
              course: { id: courseId }
            }
          });

          if (existingAssignment) {
            errors.push(`Lecturer already assigned to course ${course.code}`);
            continue;
          }

          // Create assignment
          const lecturerCourse = this.lecturerCourseRepository.create({
            lecturer,
            course
          });

          const savedAssignment = await this.lecturerCourseRepository.save(lecturerCourse);
          assignments.push(savedAssignment);
        } catch (error) {
          errors.push(`Failed to assign course ${courseId}: ${error}`);
        }
      }

      res.json({
        success: assignments.length,
        errors: errors,
        assignments: assignments
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to bulk assign lecturer to courses' });
    }
  }
}