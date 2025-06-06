import { Router } from 'express';
import { ApplicationController } from '../controller/ApplicationController';

const router = Router();
const applicationController = new ApplicationController();

// GET /applications - Get all applications with optional filtering
router.get('/', (req, res) => applicationController.getAllApplications(req, res));

// GET /applications/:id - Get application by ID
router.get('/:id', (req, res) => applicationController.getApplicationById(req, res));

// POST /applications - Create new application
router.post('/', (req, res) => applicationController.createApplication(req, res));

// PUT /applications/:id - Update application
router.put('/:id', (req, res) => applicationController.updateApplication(req, res));

// PATCH /applications/:id/status - Update application status
router.patch('/:id/status', (req, res) => applicationController.updateApplicationStatus(req, res));

// DELETE /applications/:id - Delete application
router.delete('/:id', (req, res) => applicationController.deleteApplication(req, res));

// GET /applications/user/:userId - Get applications by user
router.get('/user/:userId', (req, res) => applicationController.getApplicationsByUser(req, res));

// GET /applications/course/:courseId - Get applications by course
router.get('/course/:courseId', (req, res) => applicationController.getApplicationsByCourse(req, res));

export default router;