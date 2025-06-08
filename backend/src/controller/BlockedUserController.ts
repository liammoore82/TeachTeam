import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';
import { BlockedUser } from '../entity/BlockedUser';

export class BlockedUserController {
  private userRepository = AppDataSource.getRepository(User);
  private blockedUserRepository = AppDataSource.getRepository(BlockedUser);

  // POST /blocked-users - Block a user
  async blockUser(req: Request, res: Response) {
    try {
      const { userId, reason, message } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      // Check if user exists
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if user is already blocked
      const existingBlock = await this.blockedUserRepository.findOne({
        where: { userId, isActive: true }
      });

      if (existingBlock) {
        return res.status(409).json({ error: 'User is already blocked' });
      }

      // Create blocked user entry
      const blockedUser = this.blockedUserRepository.create({
        userId,
        user,
        reason: reason || 'Blocked by administrator',
        message: message || 'Your account has been blocked by an administrator.'
      });

      const savedBlockedUser = await this.blockedUserRepository.save(blockedUser);

      res.status(201).json({
        message: 'User blocked successfully',
        blockedUser: savedBlockedUser
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to block user' });
    }
  }

  // DELETE /blocked-users/:userId - Unblock a user
  async unblockUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      // Find active block for user
      const blockedUser = await this.blockedUserRepository.findOne({
        where: { userId: parseInt(userId), isActive: true }
      });

      if (!blockedUser) {
        return res.status(404).json({ error: 'User is not currently blocked' });
      }

      // Deactivate the block instead of deleting (for audit trail)
      blockedUser.isActive = false;
      await this.blockedUserRepository.save(blockedUser);

      res.json({
        message: 'User unblocked successfully'
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to unblock user' });
    }
  }

  // GET /blocked-users - Get all blocked users
  async getBlockedUsers(req: Request, res: Response) {
    try {
      const blockedUsers = await this.blockedUserRepository.find({
        where: { isActive: true },
        relations: ['user']
      });

      res.json(blockedUsers);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get blocked users' });
    }
  }

  // GET /blocked-users/:userId - Check if specific user is blocked
  async checkUserBlocked(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const blockedUser = await this.blockedUserRepository.findOne({
        where: { userId: parseInt(userId), isActive: true },
        relations: ['user']
      });

      res.json({
        isBlocked: !!blockedUser,
        blockedUser: blockedUser || null
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to check user block status' });
    }
  }
}