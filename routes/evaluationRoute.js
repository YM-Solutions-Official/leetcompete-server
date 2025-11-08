import { Router } from 'express';
import { evaluateCode } from '../services/geminiService.js';

const evaluationRouter = Router();

evaluationRouter.post('/evaluate', async (req, res) => {
    try {
        const { problemStatement, description, userCode, testCases, language } = req.body;

        // Validate required fields
        if (!userCode || !testCases || !Array.isArray(testCases) || testCases.length === 0 || !language) {
            return res.status(400).json({
                error: "Missing required fields: userCode, language, and a non-empty array of testCases"
            });
        }

        const result = await evaluateCode(
            problemStatement || '',  // Optional
            description || '',       // Optional
            userCode,
            testCases,
            language
        );

        res.json(result);
    } catch (error) {
        console.error('Code evaluation error:', error);
        res.status(500).json({
            error: error.message || 'Internal server error during code evaluation'
        });
    }
});

export default evaluationRouter;