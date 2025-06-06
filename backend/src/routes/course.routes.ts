import { Router } from 'express';
import { CourseController } from '../controller/CourseController';

const router = Router();
const courseController = new CourseController();

// GET /courses - Get all courses with optional search and filtering
router.get('/', (req, res) => courseController.getAllCourses(req, res));

// GET /courses/:id - Get course by ID
router.get('/:id', (req, res) => courseController.getCourseById(req, res));

// POST /courses - Create new course
router.post('/', (req, res) => courseController.createCourse(req, res));

// PUT /courses/:id - Update course
router.put('/:id', (req, res) => courseController.updateCourse(req, res));

// DELETE /courses/:id - Delete course
router.delete('/:id', (req, res) => courseController.deleteCourse(req, res));

// GET /courses/:id/applications - Get applications for a course
router.get('/:id/applications', (req, res) => courseController.getCourseApplications(req, res));

// GET /courses/:id/lecturers - Get lecturers for a course
router.get('/:id/lecturers', (req, res) => courseController.getCourseLecturers(req, res));

export default router;