import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Application } from '../entity/Application';

export class ApplicationController {
    private applicationRepository = AppDataSource.getRepository(Application);

    async getAll(req: Request, res: Response) {
        const applications = await this.applicationRepository.find({
            relations: ['candidate', 'course']
        });
        return res.json(applications);
    }

    async getOne(req: Request, res: Response) {
        const application = await this.applicationRepository.findOne({
            where: { id: parseInt(req.params.id) },
            relations: ['candidate', 'course']
        });
        return res.json(application);
    }

    async create(req: Request, res: Response) {
        const application = this.applicationRepository.create(req.body);
        const result = await this.applicationRepository.save(application);
        return res.json(result);
    }

    async updateStatus(req: Request, res: Response) {
        await this.applicationRepository.update(req.params.id, { 
            status: req.body.status 
        });
        const updatedApplication = await this.applicationRepository.findOneBy({ 
            id: parseInt(req.params.id) 
        });
        return res.json(updatedApplication);
    }

    async delete(req: Request, res: Response) {
        await this.applicationRepository.delete(req.params.id);
        return res.json({ message: 'Application deleted' });
    }
}