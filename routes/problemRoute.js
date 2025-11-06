import express from 'express';
const router = express.Router();
import { getProblems } from '../controller/problemController.js';
import isAuth from '../middlewares/isAuth.js';

router.post('/get-problems', isAuth, getProblems);
export default router;
