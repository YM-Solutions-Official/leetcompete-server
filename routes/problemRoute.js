import express from 'express';
const router = express.Router();
import { getProblems } from '../controller/problemController.js';
import isAuth from '../middlewares/isAuth.js';

// should it be post or get? 
router.post('/get-problems', isAuth, getProblems);
export default router;
