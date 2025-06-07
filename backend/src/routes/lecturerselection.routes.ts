import { Router } from 'express';
import { LecturerSelectionController } from '../controller/LecturerSelectionController';

const router = Router();
const selectionController = new LecturerSelectionController();

// GET /lecturer-selections - Get all selections with optional filtering
router.get('/', (req, res) => selectionController.getAllSelections(req, res));

// GET /lecturer-selections/lecturer/:lecturerId - Get selections by lecturer
router.get('/lecturer/:lecturerId', (req, res) => selectionController.getSelectionsByLecturer(req, res));

// POST /lecturer-selections - Create new selection
router.post('/', (req, res) => selectionController.createSelection(req, res));

// PUT /lecturer-selections/:id - Update selection
router.put('/:id', (req, res) => selectionController.updateSelection(req, res));

// DELETE /lecturer-selections/:id - Delete selection
router.delete('/:id', (req, res) => selectionController.deleteSelection(req, res));

// DELETE /lecturer-selections/lecturer/:lecturerId/application/:applicationId
router.delete('/lecturer/:lecturerId/application/:applicationId', (req, res) => selectionController.deleteSelectionByIds(req, res));

// POST /lecturer-selections/reorder - Reorder selections for a lecturer
router.post('/reorder', (req, res) => selectionController.reorderSelections(req, res));

export default router;