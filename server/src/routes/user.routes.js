import express from 'express'
import { protect } from '../middlewares/auth.middleware.js';
import { updateAvatar, updateProfile } from '../controllers/user.controller.js';
import upload from '../middlewares/upload.middleware.js';

const userRouter = express.Router();

userRouter.put('/update-profile', protect, updateProfile);
userRouter.put("/update-avatar", protect, upload.single("avatar"), updateAvatar);

export default userRouter