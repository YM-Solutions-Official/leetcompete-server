import Problem from "../model/problemModel.js";

// Helper to capitalize first letter (e.g., "easy" -> "Easy")
const capitalizeFirstLetter = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const getProblems = async (req, res) => {
  console.log("[API getProblems] RECEIVED REQ:", req.body);
  try {
    const { difficulties, duration, numberOfProblems, topics } = req.body;

    // --- Validation ---
    if (!difficulties || difficulties.length === 0) {
      console.log("[API getProblems] ❌ Error: No difficulties selected");
      return res.status(400).json({ message: "Select at least one difficulty" });
    }
    const numProblems = parseInt(numberOfProblems, 10);
    if (isNaN(numProblems) || numProblems < 1) {
      console.log("[API getProblems] ❌ Error: Invalid numberOfProblems");
      return res.status(400).json({ message: "Number of problems must be at least 1" });
    }
    if (!topics || topics.length === 0) {
      console.log("[API getProblems] ❌ Error: No topics selected");
      return res.status(400).json({ message: "Select at least one topic" });
    }

    // --- Build Query ---
    const useRandomTopics = topics.length === 1 && topics[0] === "Random";
    const difficultiesCapitalized = difficulties.map(capitalizeFirstLetter);

    // Base query object
    const matchQuery = {
      difficulty: { $in: difficultiesCapitalized }
    };

    // Add topics to query only if "Random" is not selected
    if (!useRandomTopics) {
      matchQuery.topicTags = { $in: topics };
    }
    
    console.log(`[API getProblems] 🔍 Finding ${numProblems} problems with query:`, JSON.stringify(matchQuery));

    // --- Efficient Single Query ---
    // Instead of looping, we use a single aggregation pipeline
    // 1. $match: Filter documents based on our query
    // 2. $sample: Randomly pick 'numProblems' documents from the filtered set
    const problems = await Problem.aggregate([
      { $match: matchQuery },
      { $sample: { size: numProblems } }
    ]);

    if (!problems || problems.length === 0) {
      console.log("[API getProblems] ⚠️ No problems found matching criteria.");
      return res.status(404).json({ message: "No problems found matching your criteria. Try a broader search." });
    }
    
    console.log(`[API getProblems] ✅ Found ${problems.length} problems.`);
    
    // --- Metadata for Battle ---
    // The client might receive *fewer* problems than requested if not enough match.
    // We should report the *actual* number found.
    // And if 'difficulties' was [Easy, Medium, Easy], we need to report that.
    const finalDifficulties = difficulties.slice(0, numProblems);

    return res.status(200).json({
      metadata: {
        totalProblems: problems.length, // Report actual number found
        duration,
        difficulties: finalDifficulties, // Report the original request, trimmed
        topics: useRandomTopics ? ["Random"] : topics,
        generatedAt: new Date()
      },
      problems // The array of problem objects
    });

  } catch (error) {
    console.error("[API getProblems] ❌ FATAL ERROR:", error);
    return res.status(500).json({ message: `Get Problems Error: ${error.message}` });
  }
};