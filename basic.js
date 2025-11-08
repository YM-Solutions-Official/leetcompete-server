import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = path.resolve(__dirname, "./data/problems.json");
const OUTPUT_FILE = path.resolve(__dirname, "./data/problems_cleaned.json");

// ---------- Helpers ----------
function decodeHTML(str = "") {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function parseDynamicValue(val = "") {
  let text = val.replace(/^"|"$/g, "").trim();
  try {
    if (text.startsWith("{") || text.startsWith("[")) return JSON.parse(text);
  } catch (_) {}

  if (!isNaN(text)) return Number(text);
  if (text.toLowerCase() === "true") return true;
  if (text.toLowerCase() === "false") return false;
  return text;
}

function parseDynamicInput(inputText = "") {
  try {
    if (inputText.startsWith("{") || inputText.startsWith("[")) {
      return JSON.parse(inputText);
    }
  } catch (_) {}

  const obj = {};
  inputText.split(",").forEach((pair) => {
    const [key, value] = pair.split("=").map((s) => s.trim());
    if (!key) return;
    obj[key] = parseDynamicValue(value);
  });
  return obj;
}

function extractExamples(content = "") {
  const cleaned = decodeHTML(content.replace(/\n/g, " ").replace(/\s+/g, " "));

  const regex =
    /<strong>Input:<\/strong>\s*(?:<span[^>]*>)?([^<]*)(?:<\/span>)?.*?<strong>Output:<\/strong>\s*(?:<span[^>]*>)?([^<]*)(?:<\/span>)?/g;

  const examples = [];
  let match;
  while ((match = regex.exec(cleaned)) !== null) {
    const inputText = match[1].trim();
    const outputText = match[2].trim();
    const input = parseDynamicInput(inputText);
    const expectedOutput = parseDynamicValue(outputText);
    examples.push({ input, expectedOutput });
  }
  return examples;
}

// ---------- Main ----------
console.log("📥 Reading problems file...");
const raw = fs.readFileSync(INPUT_FILE, "utf8");
const data = JSON.parse(raw);

if (!data.problems || !Array.isArray(data.problems)) {
  console.error("❌ Invalid data format — expected { problems: [] }");
  process.exit(1);
}

console.log(`✅ Found ${data.problems.length} problems`);

const updatedProblems = data.problems.map((p, i) => {
  const extractedTests = extractExamples(p.content);

  if (i % 200 === 0)
    console.log(`🧩 Processed ${i} / ${data.problems.length}`);

  // Replace old testCases with new ones
  return {
    ...p,
    testCases: extractedTests,
  };
});

fs.writeFileSync(
  OUTPUT_FILE,
  JSON.stringify({ ...data, problems: updatedProblems }, null, 2),
  "utf8"
);

console.log(`\n🎉 Test case replacement complete!`);
console.log(`Saved to: ${OUTPUT_FILE}`);
