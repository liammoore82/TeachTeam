import { Router } from 'express';
import { BlockedUserController } from '../controller/BlockedUserController';

const router = Router();
const blockedUserController = new BlockedUserController();

// POST /api/blocked-users - Block a user
router.post('/', blockedUserController.blockUser.bind(blockedUserController));

// DELETE /api/blocked-users/:userId - Unblock a user
router.delete('/:userId', blockedUserController.unblockUser.bind(blockedUserController));

// GET /api/blocked-users - Get all blocked users
router.get('/', blockedUserController.getBlockedUsers.bind(blockedUserController));

// GET /api/blocked-users/:userId - Check if specific user is blocked
router.get('/:userId', blockedUserController.checkUserBlocked.bind(blockedUserController));

export default router;