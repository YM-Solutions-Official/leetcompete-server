import express from 'express';
import {
    handleSubmission,
    getMatchSubmissions,
    getUserMatchStats
} from '../controller/submissionController.js';
import isAuth from '../middlewares/isAuth.js';

const router = express.Router();

// Submit a solution
router.post('/submit', isAuth, handleSubmission);

// Get all submissions for a match
router.get('/match/:matchId', isAuth, getMatchSubmissions);

// Get user's statistics for a match
router.get('/stats/:matchId', isAuth, getUserMatchStats);

export default router;