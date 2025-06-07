import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';

export class AuthController {
  private userRepository = AppDataSource.getRepository(User);

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

      res.json({
        user: user.toSafeObject()
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to sign in' });
    }
  }


}