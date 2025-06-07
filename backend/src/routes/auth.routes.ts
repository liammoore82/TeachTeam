import { Router } from 'express';
import { AuthController } from '../controller/AuthController';

const router = Router();
const authController = new AuthController();

// POST /auth/signin
router.post('/signin', (req, res) => authController.signIn(req, res));

// POST /auth/signup
router.post('/signup', (req, res) => authController.signUp(req, res));

// GET /auth/profile/:email
router.get('/profile/:email', (req, res) => authController.getProfile(req, res));

export default router;