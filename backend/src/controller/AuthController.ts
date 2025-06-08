import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';
import { BlockedUser } from '../entity/BlockedUser';

export class AuthController {
  private userRepository = AppDataSource.getRepository(User);
  private blockedUserRepository = AppDataSource.getRepository(BlockedUser);

  // POST /auth/signin - Sign in user
  async signIn(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Find user by email
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Simple password check (not secure for production)
      if (user.password !== password) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check if user is blocked
      let blockedUser = await this.blockedUserRepository.findOne({
        where: { user: { id: user.id }, isActive: true }
      });

      // Fallback to direct userId check if relation query doesn't work
      if (!blockedUser) {
        blockedUser = await this.blockedUserRepository.findOne({
          where: { userId: user.id, isActive: true }
        });
      }

      if (blockedUser) {
        return res.status(403).json({ 
          error: 'Account blocked',
          message: blockedUser.message,
          blockedAt: blockedUser.blockedAt,
          reason: blockedUser.reason
        });
      }

      res.json({
        user: user.toSafeObject()
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to sign in' });
    }
  }

  // POST /auth/signup - Sign up new user
  async signUp(req: Request, res: Response) {
    try {
      const { email, password, role = 'candidate' } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Check if user already exists
      const existingUser = await this.userRepository.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
      }

      // Create user
      const user = this.userRepository.create({
        email,
        password, // Store plain text (not secure for production)
        role
      });

      const savedUser = await this.userRepository.save(user);

      res.status(201).json({
        user: savedUser.toSafeObject()
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create user' });
    }
  }

  // GET /auth/profile/:email - Get user profile by email
  async getProfile(req: Request, res: Response) {
    try {
      const { email } = req.params;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user.toSafeObject());
    } catch (error) {
      res.status(500).json({ error: 'Failed to get profile' });
    }
  }
}