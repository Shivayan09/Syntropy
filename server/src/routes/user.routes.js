import express from 'express'
import { protect } from '../middlewares/auth.middleware.js';
import { updateProfile } from '../controllers/user.controller.js';

const userRouter = express.Router();

userRouter.put('/update-profile', protect, updateProfile);

export default userRouter