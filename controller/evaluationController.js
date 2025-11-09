import axios from "axios";
import Problem from "../model/problemModel.js";

const JUDGE0_API_URL = "https://judge0-ce.p.rapidapi.com";
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;

// -------------------- RUN SINGLE TEST --------------------
export const runSingleTest = async (req, res) => {
  try {
    const { problemId, code } = req.body;
    const languageId = 105; // ✅ C++ only

    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ message: "Problem not found" });
    if (!problem.testCases?.length)
      return res.status(404).json({ message: "No test cases available" });

    const testCase = problem.testCases[0];
    const result = await runJudge0(code, testCase.input, testCase.expectedOutput, problem);

    const outputText =
      result.stdout || result.stderr || result.compile_output || "";
    const expected = formatExpectedOutput(testCase.expectedOutput);

    res.json({
      mode: "run",
      input: testCase.input,
      expectedOutput: expected,
      output: outputText.trim(),
      passed: compareOutputs(outputText.trim(), expected),
      status: result.status,
    });
  } catch (err) {
    console.error("Run Test Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// -------------------- SUBMIT ALL TESTS --------------------
export const submitAllTests = async (req, res) => {
  try {
    const { problemId, code } = req.body;
    const languageId = 105;

    const problem = await Problem.findById(problemId);
    if (!problem || !problem.testCases?.length)
      return res
        .status(404)
        .json({ message: "Problem or test cases missing" });

    let passedCount = 0;
    const results = [];

    for (const [index, testCase] of problem.testCases.entries()) {
      const result = await runJudge0(code, testCase.input, testCase.expectedOutput, problem);
      const outputText =
        result.stdout || result.stderr || result.compile_output || "";
      const expected = formatExpectedOutput(testCase.expectedOutput);
      const passed = compareOutputs(outputText.trim(), expected);

      if (passed) passedCount++;
      results.push({
        testCase: index + 1,
        input: testCase.input,
        expectedOutput: expected,
        output: outputText.trim(),
        passed,
        status: result.status,
      });
    }

    res.json({
      mode: "submit",
      totalTests: problem.testCases.length,
      passedTests: passedCount,
      allPassed: passedCount === problem.testCases.length,
      results,
    });
  } catch (err) {
    console.error("Submit Tests Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// -------------------- FORMAT OUTPUT FOR COMPARISON --------------------
function formatExpectedOutput(output) {
  if (output === null || output === undefined) return "null";
  if (typeof output === "string") return output.trim();
  if (typeof output === "boolean") return output ? "true" : "false";
  if (Array.isArray(output)) {
    return JSON.stringify(output);
  }
  return String(output).trim();
}

// -------------------- COMPARE OUTPUTS WITH FLEXIBILITY --------------------
function compareOutputs(actual, expected) {
  const actualTrimmed = String(actual).trim();
  const expectedTrimmed = String(expected).trim();
  
  // Exact match
  if (actualTrimmed === expectedTrimmed) return true;
  
  // Try parsing as JSON (for arrays/objects)
  try {
    const actualJson = JSON.parse(actualTrimmed);
    const expectedJson = JSON.parse(expectedTrimmed);
    return JSON.stringify(actualJson) === JSON.stringify(expectedJson);
  } catch (e) {
    // Not JSON, continue with string comparison
  }
  
  // Numeric comparison (with tolerance)
  const actualNum = parseFloat(actualTrimmed);
  const expectedNum = parseFloat(expectedTrimmed);
  if (!isNaN(actualNum) && !isNaN(expectedNum)) {
    return Math.abs(actualNum - expectedNum) < 0.0001;
  }
  
  return false;
}

// -------------------- UNIVERSAL JUDGE0 WRAPPER --------------------
async function runJudge0(code, input, expectedOutput, problem) {
  // Extract function name and parameter types from problem metadata
  const functionName = problem.metaData?.name || "solution";
  const params = problem.metaData?.params || [];
  const returnType = problem.metaData?.return?.type || "string";
  
  // Build parameter parsing code
  let paramParseCode = "";
  if (Array.isArray(input) && typeof input === "object" && input !== null) {
    // Input is an object with named parameters
    let paramIndex = 0;
    for (const param of params) {
      const paramName = param.name;
      const paramType = param.type;
      paramParseCode += buildParamParser(paramName, paramType, paramIndex);
      paramIndex++;
    }
  } else {
    // Single parameter input
    paramParseCode = `auto param = readInput();\n`;
  }

  // Build print statement based on return type
  const printCode = buildPrintStatement(returnType, functionName);

  // ✅ Universal print helpers (handle all C++ result types)
  const printHelpers = `
template<typename T>
void printElement(const T &val) {
    if constexpr (std::is_same_v<T, std::string>)
        std::cout << '\\"' << val << '\\"';
    else if constexpr (std::is_same_v<T, bool>)
        std::cout << (val ? "true" : "false");
    else
        std::cout << val;
}

template<typename T>
void printVec(const std::vector<T> &v) {
    std::cout << "[";
    for (size_t i = 0; i < v.size(); ++i) {
        printElement(v[i]);
        if (i + 1 < v.size()) std::cout << ", ";
    }
    std::cout << "]";
}

template<typename T>
void printVec2D(const std::vector<std::vector<T>> &v) {
    std::cout << "[";
    for (size_t i = 0; i < v.size(); ++i) {
        printVec(v[i]);
        if (i + 1 < v.size()) std::cout << ", ";
    }
    std::cout << "]";
}

template<typename T>
void printVec3D(const std::vector<std::vector<std::vector<T>>> &v) {
    std::cout << "[";
    for (size_t i = 0; i < v.size(); ++i) {
        printVec2D(v[i]);
        if (i + 1 < v.size()) std::cout << ", ";
    }
    std::cout << "]";
}

template<typename T>
void printAny(const T &res) {
    if constexpr (std::is_same_v<T, int> || std::is_same_v<T, long long> || std::is_same_v<T, double>)
        std::cout << res;
    else if constexpr (std::is_same_v<T, std::string>)
        printElement(res);
    else if constexpr (std::is_same_v<T, bool>)
        std::cout << (res ? "true" : "false");
    else if constexpr (std::is_same_v<T, std::vector<int>>)
        printVec(res);
    else if constexpr (std::is_same_v<T, std::vector<long long>>)
        printVec(res);
    else if constexpr (std::is_same_v<T, std::vector<std::string>>)
        printVec(res);
    else if constexpr (std::is_same_v<T, std::vector<std::vector<int>>>)
        printVec2D(res);
    else if constexpr (std::is_same_v<T, std::vector<std::vector<long long>>>)
        printVec2D(res);
    else if constexpr (std::is_same_v<T, std::vector<std::vector<std::string>>>)
        printVec2D(res);
    else if constexpr (std::is_same_v<T, std::vector<std::vector<std::vector<int>>>>)
        printVec3D(res);
    else
        printElement(res);
}
`;

  // Format input into string
  const formatInput = (val) => {
    if (typeof val === "object" && val !== null) {
      if (Array.isArray(val)) {
        return val.join(" ");
      }
      return Object.values(val).join(" ");
    }
    return String(val);
  };
  const formattedInput = formatInput(input);

  // ✅ Wrap code into runnable program
  const wrappedCode = `
#include <bits/stdc++.h>
using namespace std;
${printHelpers}

${code}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    string line;
    getline(cin, line);
    stringstream ss(line);

    vector<int> nums;
    int x;
    while (ss >> x) nums.push_back(x);

    Solution s;
    auto result = s.${functionName}(nums);
    printAny(result);
    return 0;
}
`;

  const headers = {
    "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
    "x-rapidapi-key": JUDGE0_API_KEY,
    "content-type": "application/json",
  };

  // Submit code to Judge0
  const submission = await axios.post(
    `${JUDGE0_API_URL}/submissions?base64_encoded=true&wait=true`,
    {
      source_code: Buffer.from(wrappedCode).toString("base64"),
      language_id: 105,
      stdin: Buffer.from(formattedInput).toString("base64"),
    },
    { headers }
  );

  const result = submission.data;
  const decode = (b64) =>
    b64 ? Buffer.from(b64, "base64").toString("utf8").trim() : "";

  return {
    stdout: decode(result.stdout),
    stderr: decode(result.stderr),
    compile_output: decode(result.compile_output),
    status: result.status?.description,
  };
}

// -------------------- HELPER TO BUILD PARAMETER PARSER --------------------
function buildParamParser(paramName, paramType, index) {
  // This is a simplified version - can be extended based on actual needs
  const typeMap = {
    integer: "int",
    string: "string",
    vector: "vector<int>",
    "vector<integer>": "vector<int>",
  };
  
  const cppType = typeMap[paramType] || paramType;
  return `${cppType} ${paramName};\ncin >> ${paramName};\n`;
}

// -------------------- HELPER TO BUILD PRINT STATEMENT --------------------
function buildPrintStatement(returnType, functionName) {
  const typeMap = {
    integer: "int",
    string: "string",
    vector: "vector<int>",
    "vector<integer>": "vector<int>",
    "list<integer>": "vector<int>",
  };
  
  // For now, use generic printAny
  return `printAny(result);`;
}
