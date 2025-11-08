import mongoose from "mongoose";

const codeSnippetSchema = new mongoose.Schema(
  {
    lang: String,
    langSlug: String,
    code: String,
  },
  { _id: false }
);

// ✅ Define structured test cases
const testCaseSchema = new mongoose.Schema(
  {
    input: mongoose.Schema.Types.Mixed,          // can be object, array, or primitive
    expectedOutput: mongoose.Schema.Types.Mixed, // flexible
  },
  { _id: false }
);

const problemSchema = new mongoose.Schema(
  {
    problemNumber: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    content: { type: String, required: true },

    // ✅ Updated field
    testCases: [testCaseSchema],

    sampleTestCase: String,
    hints: [String],
    topicTags: [String],
    codeSnippets: [codeSnippetSchema],
    leetcodeUrl: String,
  },
  { timestamps: true }
);

// Indexing for better query performance
problemSchema.index({ difficulty: 1, topicTags: 1 });

const Problem = mongoose.model("Problem", problemSchema);
export default Problem;
