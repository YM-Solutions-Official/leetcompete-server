import Match from '../model/matchModel.js';
import Problem from '../model/problemModel.js';
import Submission from '../model/submissionModel.js';
import MatchParticipant from '../model/matchParticipantModel.js';
import { evaluateCode } from '../services/geminiService.js';

// Helper function to validate match status
const validateMatch = async (matchId) => {
    const match = await Match.findById(matchId);
    if (!match) {
        throw new Error('Match not found');
    }
    if (match.status !== 'in-progress') {
        throw new Error('Match is not active or has ended');
    }
    return match;
};

// Helper function to check if match should end
const checkMatchEnd = async (matchId) => {
    const match = await Match.findById(matchId)
        .populate('problems')
        .populate('participants');

    const totalProblems = match.problems.length;
    
    // Check if all participants have solved all problems
    const allComplete = match.participants.every(participant => {
        const solvedCount = participant.problems.filter(p => p.status === 'solved').length;
        return solvedCount === totalProblems;
    });

    if (allComplete) {
        await determineWinner(matchId);
    }
};

// Helper function to determine match winner
const determineWinner = async (matchId) => {
    const participants = await MatchParticipant.find({ matchId })
        .sort({ score: -1, totalTime: 1 }); // Sort by highest score and lowest time

    const winner = participants[0];
    
    // Update match status
    await Match.findByIdAndUpdate(matchId, {
        status: 'completed',
        endedAt: new Date(),
        winnerId: winner.userId
    });

    return winner.userId;
};

// Main submission handler
export const handleSubmission = async (req, res) => {
    try {
        const { matchId, problemId, userCode, language } = req.body;
        const userId = req.user._id; // Assuming user is authenticated

        // 1. Validate Match
        await validateMatch(matchId);

        // 2. Get Problem and Test Cases
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        // 3. Evaluate Code
        const evaluationResult = await evaluateCode(
            problem.title,
            problem.description,
            userCode,
            problem.testCases,
            language
        );

        // 4. Create Submission
        const submission = await Submission.create({
            userId,
            problemId,
            matchId,
            code: userCode,
            language,
            status: evaluationResult.status === 'Completed' ? 
                    evaluationResult.overallResult : evaluationResult.status,
            results: evaluationResult
        });

        // 5. Update Score if Accepted
        if (evaluationResult.status === 'Completed' && 
            evaluationResult.overallResult === 'Accepted') {
            await updateScore(userId, matchId, problemId);
        }

        // 6. Check Match End
        await checkMatchEnd(matchId);

        // 7. Return Response
        res.json(evaluationResult);

    } catch (error) {
        console.error('Submission error:', error);
        res.status(400).json({ error: error.message });
    }
};

// Get submission history for a match
export const getMatchSubmissions = async (req, res) => {
    try {
        const { matchId } = req.params;
        const submissions = await Submission.find({ matchId })
            .sort({ createdAt: -1 })
            .populate('userId', 'username')
            .populate('problemId', 'title');
        res.json(submissions);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get submission statistics for a user in a match
export const getUserMatchStats = async (req, res) => {
    try {
        const { matchId } = req.params;
        const userId = req.user._id;

        const stats = await MatchParticipant.findOne({ matchId, userId })
            .populate('solvedProblems', 'title');
            
        res.json(stats);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}