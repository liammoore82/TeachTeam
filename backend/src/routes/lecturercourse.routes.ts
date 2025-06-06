import { Router } from 'express';
import { LecturerCourseController } from '../controller/LecturerCourseController';

const router = Router();
const lecturerCourseController = new LecturerCourseController();

// GET /lecturer-courses - Get all lecturer-course assignments with optional filtering
router.get('/', (req, res) => lecturerCourseController.getAllLecturerCourses(req, res));

// GET /lecturer-courses/:id - Get lecturer-course assignment by ID
router.get('/:id', (req, res) => lecturerCourseController.getLecturerCourseById(req, res));

// POST /lecturer-courses - Create new lecturer-course assignment
router.post('/', (req, res) => lecturerCourseController.createLecturerCourse(req, res));

// DELETE /lecturer-courses/:id - Delete lecturer-course assignment by ID
router.delete('/:id', (req, res) => lecturerCourseController.deleteLecturerCourse(req, res));

// DELETE /lecturer-courses/lecturer/:lecturerId/course/:courseId - Delete by lecturer and course IDs
router.delete('/lecturer/:lecturerId/course/:courseId', (req, res) => lecturerCourseController.deleteLecturerCourseByIds(req, res));

// GET /lecturer-courses/lecturer/:lecturerId - Get courses for a specific lecturer
router.get('/lecturer/:lecturerId', (req, res) => lecturerCourseController.getCoursesByLecturer(req, res));

// GET /lecturer-courses/course/:courseId - Get lecturers for a specific course
router.get('/course/:courseId', (req, res) => lecturerCourseController.getLecturersByCourse(req, res));

// POST /lecturer-courses/bulk - Bulk assign lecturer to multiple courses
router.post('/bulk', (req, res) => lecturerCourseController.bulkAssignLecturerToCourses(req, res));

export default router;