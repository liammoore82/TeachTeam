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
}