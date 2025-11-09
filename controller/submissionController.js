import Match from '../model/matchModel.js';
import Problem from '../model/problemModel.js';
import Submission from '../model/submissionModel.js';
import MatchParticipant from '../model/matchParticipantModel.js';
import { evaluateCode } from '../services/geminiService.js';

// Helper function to emit progress update
const emitProgressUpdate = (io, matchId, userId, problemId, status, message) => {
    io.to(matchId).emit('problemProgress', {
        userId,
        problemId,
        status,
        message,
        timestamp: new Date()
    });
};

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
        const { matchId, problemId, code, language } = req.body;
        const userId = req.user.id;
        const io = req.app.get('io');

        // 1. Validate match
        const match = await validateMatch(matchId);

        // 2. Get problem details
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        // 3. Get participant record
        let participant = await MatchParticipant.findOne({ userId, matchId });
        if (!participant) {
            return res.status(404).json({ message: 'Participant not found in match' });
        }

        // 4. Evaluate code
        const result = await evaluateCode(
            problem.statement,
            problem.description,
            code,
            problem.testCases,
            language
        );

        // 5. Create submission record
        const submission = await Submission.create({
            userId,
            matchId,
            problemId,
            code,
            language,
            status: result.status,
            testCasesPassed: result.testCasesPassed || 0,
            totalTestCases: result.totalTestCases,
            error: result.error || null,
            testResults: result.testResults || []
        });

        // 6. Update problem progress
        let problemProgress = participant.problems.find(p => p.problemId.toString() === problemId);
        if (!problemProgress) {
            participant.problems.push({
                problemId,
                status: 'not_attempted',
                attempts: 0,
                bestScore: 0
            });
            problemProgress = participant.problems[participant.problems.length - 1];
        }

        problemProgress.attempts += 1;
        problemProgress.lastSubmissionTime = new Date();

        // 7. Update status based on result
        const previousStatus = problemProgress.status;
        if (result.status === 'Accepted') {
            problemProgress.status = 'solved';
            if (problemProgress.bestScore === 0) {
                problemProgress.bestScore = 1;
                participant.totalScore += 1;
            }
            // Emit success notification and progress update
            io.to(matchId).emit('submissionResult', {
                userId,
                problemId,
                status: 'solved',
                previousStatus,
                message: 'solved the problem! 🎉',
                progress: {
                    solved: participant.problems.filter(p => p.status === 'solved').length,
                    attempted: participant.problems.filter(p => p.status === 'attempted').length,
                    total: match.problems.length
                }
            });
        } else {
            problemProgress.status = 'attempted';
            // Emit attempt notification and progress update
            io.to(matchId).emit('submissionResult', {
                userId,
                problemId,
                status: 'attempted',
                previousStatus,
                message: 'attempted the problem',
                progress: {
                    solved: participant.problems.filter(p => p.status === 'solved').length,
                    attempted: participant.problems.filter(p => p.status === 'attempted').length,
                    total: match.problems.length
                }
            });
        }

        await participant.save();

        // 8. Get updated progress for both participants
        const participants = await MatchParticipant.find({ matchId })
            .populate('problems.problemId')
            .lean();

        // 9. Emit progress update
        const progressData = participants.map(p => ({
            userId: p.userId,
            problems: p.problems.map(prob => ({
                problemId: prob.problemId._id,
                status: prob.status,
                attempts: prob.attempts
            })),
            totalScore: p.totalScore
        }));

        io.to(matchId).emit('battleProgress', {
            matchId,
            progress: progressData
        });

        // 10. Check if match should end
        await checkMatchEnd(matchId);

        // 11. Send response
        res.json({
            success: true,
            submission: {
                id: submission._id,
                status: result.status,
                testCasesPassed: result.testCasesPassed,
                totalTestCases: result.totalTestCases,
                error: result.error,
                testResults: result.testResults
            },
            progress: {
                status: problemProgress.status,
                attempts: problemProgress.attempts,
                score: participant.totalScore
            }
        });

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