import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Application } from '../entity/Application';
import { User } from '../entity/User';
import { Course } from '../entity/Course';

export class ApplicationController {
  private applicationRepository = AppDataSource.getRepository(Application);
  private userRepository = AppDataSource.getRepository(User);
  private courseRepository = AppDataSource.getRepository(Course);

  // GET /applications - Get all applications
  async getAllApplications(req: Request, res: Response) {
    try {
      const { status, courseId, userId } = req.query;
      let whereCondition: any = {};

      // Filter by status
      if (status) {
        whereCondition.status = status;
      }

      // Filter by course
      if (courseId) {
        whereCondition.course = { id: parseInt(courseId as string) };
      }

      // Filter by user
      if (userId) {
        whereCondition.user = { id: parseInt(userId as string) };
      }

      const applications = await this.applicationRepository.find({
        where: whereCondition,
        relations: ['user', 'course']
      });

      res.json(applications);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch applications' });
    }
  }

  // GET /applications/:id - Get application by ID
  async getApplicationById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const application = await this.applicationRepository.findOne({
        where: { id: parseInt(id) },
        relations: ['user', 'course']
      });

      if (!application) {
        return res.status(404).json({ error: 'Application not found' });
      }

      res.json(application);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch application' });
    }
  }

  // POST /applications - Create new application
  async createApplication(req: Request, res: Response) {
    try {
      const { fullName, courseId, availability, skills, credentials, previousRoles, userId } = req.body;

      // Validate user exists
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Validate course exists
      const course = await this.courseRepository.findOne({ where: { id: courseId } });
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      // Validate input
      const applicationData = { fullName, course, availability, skills, credentials, user };
      if (!Application.validate(applicationData)) {
        return res.status(400).json({ error: 'Invalid application data' });
      }

      // Check if user already applied for this course
      const existingApplication = await this.applicationRepository.findOne({
        where: {
          user: { id: userId },
          course: { id: courseId }
        }
      });

      if (existingApplication) {
        return res.status(409).json({ error: 'User has already applied for this course' });
      }

      // Create application
      const application = this.applicationRepository.create({
        fullName,
        course,
        availability,
        skills,
        credentials,
        previousRoles,
        user
      });

      const savedApplication = await this.applicationRepository.save(application);
      
      // Fetch with relations for response
      const applicationWithRelations = await this.applicationRepository.findOne({
        where: { id: savedApplication.id },
        relations: ['user', 'course']
      });

      res.status(201).json(applicationWithRelations);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create application' });
    }
  }

  // PUT /applications/:id - Update application
  async updateApplication(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { fullName, availability, skills, credentials, previousRoles } = req.body;

      const application = await this.applicationRepository.findOne({
        where: { id: parseInt(id) },
        relations: ['user', 'course']
      });

      if (!application) {
        return res.status(404).json({ error: 'Application not found' });
      }

      // Check if application can be edited
      if (!application.canEdit()) {
        return res.status(400).json({ error: 'Application cannot be edited in current status' });
      }

      // Update fields
      if (fullName) application.fullName = fullName;
      if (availability) application.availability = availability;
      if (skills) application.skills = skills;
      if (credentials) application.credentials = credentials;
      if (previousRoles) application.previousRoles = previousRoles;

      const updatedApplication = await this.applicationRepository.save(application);
      res.json(updatedApplication);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update application' });
    }
  }

  // PATCH /applications/:id/status - Update application status
  async updateApplicationStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['pending', 'approved', 'rejected', 'withdrawn'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const application = await this.applicationRepository.findOne({
        where: { id: parseInt(id) },
        relations: ['user', 'course']
      });

      if (!application) {
        return res.status(404).json({ error: 'Application not found' });
      }

      application.updateStatus(status);
      const updatedApplication = await this.applicationRepository.save(application);
      
      res.json(updatedApplication);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update application status' });
    }
  }

  // DELETE /applications/:id - Delete application
  async deleteApplication(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await this.applicationRepository.delete(parseInt(id));

      if (result.affected === 0) {
        return res.status(404).json({ error: 'Application not found' });
      }

      res.json({ message: 'Application deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete application' });
    }
  }

  // GET /applications/user/:userId - Get applications by user
  async getApplicationsByUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const applications = await this.applicationRepository.find({
        where: { user: { id: parseInt(userId) } },
        relations: ['course']
      });

      res.json(applications);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user applications' });
    }
  }

  // GET /applications/course/:courseId - Get applications by course
  async getApplicationsByCourse(req: Request, res: Response) {
    try {
      const { courseId } = req.params;
      const applications = await this.applicationRepository.find({
        where: { course: { id: parseInt(courseId) } },
        relations: ['user', 'course']
      });

      res.json(applications);
    } catch (error) {
      console.error('Error fetching applications by course:', error);
      res.status(500).json({ error: 'Failed to fetch course applications' });
    }
  }
}