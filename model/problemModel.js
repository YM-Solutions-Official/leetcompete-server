import mongoose from "mongoose";

const codeSnippetSchema = new mongoose.Schema({
  lang: String,
  langSlug: String,
  code: String
}, { _id: false });

const problemSchema = new mongoose.Schema({
  problemNumber: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  content: { type: String, required: true },
  testCases: [String],
  sampleTestCase: String,
  hints: [String],
  topicTags: [String],
  codeSnippets: [codeSnippetSchema],
  leetcodeUrl: String
}, { timestamps: true });


problemSchema.index({ difficulty: 1, topicTags: 1 });


// This function is no longer needed as the controller logic is more efficient
// You can remove this or keep it, but the controller won't use it.
/*
problemSchema.statics.getRandomProblems = async function (count, difficulty, topics) {
  const query = { difficulty };
  if (topics && topics.length > 0) {
    query.topicTags = { $in: topics };
  }

  return this.aggregate([
    { $match: query },
    { $sample: { size: count } }
  ]);
};
*/

const Problem = mongoose.model('Problem', problemSchema);
export default Problem;