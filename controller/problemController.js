import Problem from "../model/problemModel.js";

const capitalizeFirstLetter = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const getProblems = async (req, res) => {
  try {
    const { difficulties, duration, numberOfProblems, topics } = req.body;

    if (!difficulties || difficulties.length === 0)
      return res.status(400).json({ message: "Select at least one difficulty" });
    if (!numberOfProblems || numberOfProblems < 1)
      return res.status(400).json({ message: "Number of problems must be at least 1" });
    if (!topics || topics.length === 0)
      return res.status(400).json({ message: "Select at least one topic" });

    const problems = [];
    const useRandomTopics = topics.length === 1 && topics[0] === "Random";

    for (let i = 0; i < numberOfProblems; i++) {
      const difficulty = difficulties[i]; 
      
      const probs = await Problem.getRandomProblems(
        1,  
        capitalizeFirstLetter(difficulty),
        useRandomTopics ? [] : topics
      );
      
      if (probs.length > 0) {
        problems.push(probs[0]);  
      }
    }

    return res.status(200).json({
      metadata: {
        totalProblems: problems.length,
        duration,
        difficulties,
        topics,
        generatedAt: new Date()
      },
      problems
    });

  } catch (error) {
    console.error("Get Problems Error:", error);
    return res.status(500).json({ message: `Get Problems Error: ${error.message}` });
  }
};

export { getProblems };
