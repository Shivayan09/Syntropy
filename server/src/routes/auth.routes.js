import express from 'express'
import { getMe, login, logout, register } from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.get('/getMe', protect, getMe);

export default authRouter;