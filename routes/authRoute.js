import express from 'express';
import { login, signup, logout, auth0Callback } from '../controller/authController.js';
const authRouter = express.Router();
authRouter.post('/signup', signup);
authRouter.post('/login', login);
authRouter.post('/auth0-callback', auth0Callback);
authRouter.get('/logout', logout);
export default authRouter;