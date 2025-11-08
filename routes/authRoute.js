import express from 'express';
import { login, signup, logout, auth0Callback } from '../controller/authController.js';
const authRouter = express.Router();
authRouter.post('/signup', signup);
authRouter.post('/login', login);
authRouter.get('/logout', logout);
authRouter.post('/auth0-callback', auth0Callback);
export default authRouter;