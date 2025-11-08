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
    const result = await runJudge0(code, testCase.input, testCase.expectedOutput);

    const outputText =
      result.stdout || result.stderr || result.compile_output || "";
    const expected = String(testCase.expectedOutput).trim();

    res.json({
      mode: "run",
      input: testCase.input,
      expectedOutput: expected,
      output: outputText.trim(),
      passed: outputText.trim() === expected,
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
      const result = await runJudge0(code, testCase.input, testCase.expectedOutput);
      const outputText =
        result.stdout || result.stderr || result.compile_output || "";
      const expected = String(testCase.expectedOutput).trim();
      const passed = outputText.trim() === expected;

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

// -------------------- UNIVERSAL JUDGE0 WRAPPER --------------------
async function runJudge0(code, input, expectedOutput = null) {
  const formatInput = (val) => {
    if (Array.isArray(val)) return val.join(" ");
    if (typeof val === "object") return Object.values(val).join(" ");
    return String(val);
  };
  const formattedInput = formatInput(input);

  // ✅ Universal print helpers (handle all C++ result types)
  const printHelpers = `
template<typename T>
void printElement(const T &val) {
    if constexpr (std::is_same_v<T, std::string>)
        std::cout << '"' << val << '"';
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
void printAny(const T &res) {
    if constexpr (std::is_same_v<T, std::vector<int>>)
        printVec(res);
    else if constexpr (std::is_same_v<T, std::vector<long long>>)
        printVec(res);
    else if constexpr (std::is_same_v<T, std::vector<std::string>>)
        printVec(res);
    else if constexpr (std::is_same_v<T, std::vector<std::vector<int>>>)
        printVec2D(res);
    else
        printElement(res);
}
`;

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
    auto result = s.incremovableSubarrayCount(nums);
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
