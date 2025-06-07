import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { LecturerSelection } from '../entity/LecturerSelection';
import { User } from '../entity/User';
import { Application } from '../entity/Application';

export class LecturerSelectionController {
  private selectionRepository = AppDataSource.getRepository(LecturerSelection);
  private userRepository = AppDataSource.getRepository(User);
  private applicationRepository = AppDataSource.getRepository(Application);

  // GET /lecturer-selections - Get all selections with optional filtering
  async getAllSelections(req: Request, res: Response) {
    try {
      const { lecturerId, applicationId } = req.query;
      let whereCondition: any = {};

      if (lecturerId) {
        whereCondition.lecturer = { id: parseInt(lecturerId as string) };
      }

      if (applicationId) {
        whereCondition.application = { id: parseInt(applicationId as string) };
      }

      const selections = await this.selectionRepository.find({
        where: whereCondition,
        relations: ['lecturer', 'application', 'application.user', 'application.course'],
        order: { rank: 'ASC' }
      });

      res.json(selections);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch selections' });
    }
  }

  // GET /lecturer-selections/lecturer/:lecturerId - Get selections by lecturer
  async getSelectionsByLecturer(req: Request, res: Response) {
    try {
      const { lecturerId } = req.params;

      const selections = await this.selectionRepository.find({
        where: { lecturer: { id: parseInt(lecturerId) } },
        relations: ['application', 'application.user', 'application.course'],
        order: { rank: 'ASC' }
      });

      res.json(selections);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch lecturer selections' });
    }
  }
  async createSelection(req: Request, res: Response) {
    try {
      const { lecturerId, applicationId, rank, comments } = req.body;

      // Validate lecturer exists
      const lecturer = await this.userRepository.findOne({
        where: { id: lecturerId, role: 'lecturer' }
      });
      if (!lecturer) {
        return res.status(404).json({ error: 'Lecturer not found' });
      }

      // Validate application exists
      const application = await this.applicationRepository.findOne({
        where: { id: applicationId },
        relations: ['user', 'course']
      });
      if (!application) {
        return res.status(404).json({ error: 'Application not found' });
      }

      // Check if selection already exists
      const existingSelection = await this.selectionRepository.findOne({
        where: {
          lecturer: { id: lecturerId },
          application: { id: applicationId }
        }
      });

      if (existingSelection) {
        // Update existing selection
        existingSelection.rank = rank;
        existingSelection.comments = comments || '';

        const updatedSelection = await this.selectionRepository.save(existingSelection);

        const selectionWithRelations = await this.selectionRepository.findOne({
          where: { id: updatedSelection.id },
          relations: ['lecturer', 'application', 'application.user', 'application.course']
        });

        return res.json(selectionWithRelations);
      }

      // Create new selection
      const selection = this.selectionRepository.create({
        lecturer,
        application,
        rank,
        comments: comments || ''
      });

      const savedSelection = await this.selectionRepository.save(selection);

      const selectionWithRelations = await this.selectionRepository.findOne({
        where: { id: savedSelection.id },
        relations: ['lecturer', 'application', 'application.user', 'application.course']
      });

      res.status(201).json(selectionWithRelations);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create selection' });
    }
  }

  // PUT /lecturer-selections/:id - Update selection
  async updateSelection(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { rank, comments } = req.body;

      const selection = await this.selectionRepository.findOne({
        where: { id: parseInt(id) },
        relations: ['lecturer', 'application', 'application.user', 'application.course']
      });

      if (!selection) {
        return res.status(404).json({ error: 'Selection not found' });
      }

      if (rank !== undefined) selection.rank = rank;
      if (comments !== undefined) selection.comments = comments;

      const updatedSelection = await this.selectionRepository.save(selection);
      res.json(updatedSelection);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update selection' });
    }
  }

  // DELETE /lecturer-selections/:id - Delete selection
  async deleteSelection(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await this.selectionRepository.delete(parseInt(id));

      if (result.affected === 0) {
        return res.status(404).json({ error: 'Selection not found' });
      }

      res.json({ message: 'Selection deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete selection' });
    }
  }

  // DELETE /lecturer-selections/lecturer/:lecturerId/application/:applicationId
  async deleteSelectionByIds(req: Request, res: Response) {
    try {
      const { lecturerId, applicationId } = req.params;

      const result = await this.selectionRepository.delete({
        lecturer: { id: parseInt(lecturerId) },
        application: { id: parseInt(applicationId) }
      });

      if (result.affected === 0) {
        return res.status(404).json({ error: 'Selection not found' });
      }

      res.json({ message: 'Selection deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete selection' });
    }
  }
}
