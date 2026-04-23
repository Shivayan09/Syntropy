import express from 'express'
import { protect } from '../middlewares/auth.middleware.js';
import { getAiTokenStatus, updateAvatar, updateProfile } from '../controllers/user.controller.js';
import { avatarUpload, handleSingleUpload } from '../middlewares/upload.middleware.js';

const userRouter = express.Router();

userRouter.get('/ai-token-status', protect, getAiTokenStatus);
userRouter.put('/update-profile', protect, updateProfile);
userRouter.put("/update-avatar", protect, handleSingleUpload(avatarUpload, "avatar"), updateAvatar);

export default userRouter;
