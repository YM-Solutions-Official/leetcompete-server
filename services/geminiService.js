import fetch from 'node-fetch';

const MODEL_NAME = 'gemini-2.0-flash';

export async function evaluateCode(problemStatement, description, userCode, testCases, language) {
    try {
        const API_KEY = process.env.GEMINI_API_KEY;
        console.log('Environment variables:', {
            GEMINI_API_KEY_EXISTS: !!process.env.GEMINI_API_KEY,
            GEMINI_API_KEY_VALUE: process.env.GEMINI_API_KEY,
            ALL_ENV_KEYS: Object.keys(process.env)
        });
        
        if (!API_KEY) {
            throw new Error('GEMINI_API_KEY not configured in environment');
        }

        // Build the prompt
        const prompt = `You are an expert code evaluator. Analyze and test this ${language} code:

PROBLEM STATEMENT:
${problemStatement}

PROBLEM DESCRIPTION:
${description}

USER CODE:
\`\`\`${language}
${userCode}
\`\`\`

TEST CASES:
${JSON.stringify(testCases, null, 2)}

INSTRUCTIONS:
1. First check for syntax errors. If found, return Syntax Error.
2. If no syntax errors, execute the code against each test case.
3. The code should read input from stdin and write output to stdout.
4. Compare actual output with expected output exactly.
5. Stop at first failure.

RETURN ONLY VALID JSON with one of these formats:

ACCEPTED (all tests pass):
{
  "status": "Accepted",
  "testCasesPassed": ${testCases.length},
  "totalTestCases": ${testCases.length}
}

WRONG ANSWER (output mismatch):
{
  "status": "Wrong Answer", 
  "testCaseFailed": 1,
  "totalTestCases": ${testCases.length},
  "input": "the input that failed",
  "expectedOutput": "expected output",
  "actualOutput": "actual output from code"
}

RUNTIME ERROR (code crashes):
{
  "status": "Runtime Error",
  "testCaseFailed": 1, 
  "totalTestCases": ${testCases.length},
  "input": "input that caused error",
  "error": "specific error message"
}

SYNTAX ERROR (invalid code):
{
  "status": "Syntax Error",
  "error": "specific syntax error description"
}

IMPORTANT: Return ONLY the JSON, no other text.`;

        const payload = {
            contents: [{
                parts: [{ text: prompt }]
            }],
            generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 1024,
                responseMimeType: "application/json"
            }
        };

        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API error: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!responseText) {
            throw new Error('No response content from Gemini');
        }

        return JSON.parse(responseText.trim());
    } catch (error) {
        console.error('Gemini API error:', error);
        throw error;
    }
}