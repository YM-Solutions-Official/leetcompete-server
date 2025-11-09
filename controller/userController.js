import User from "../model/userModel.js"
import Match from "../model/matchModel.js";
import MatchParticipant from "../model/matchParticipantModel.js";
import Submission from "../model/submissionModel.js";

export const getCurrentUser = async(req, res)=>{
    try {
        const user = await User.findById(req.userId).select("-password");
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({message: `Get Current User Error: ${error}`});
    }
}

export const updateDescription = async(req, res)=>{ 
    try {
        const { description } = req.body;
        const user = await User.findByIdAndUpdate(
            req.userId,
            { description },
            { new: true }
        );
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        res.status(200).json({message: "Description updated successfully"});
    } catch (error) {
        res.status(500).json({message: `Update User Description Error: ${error}`});
    }
}   

export const updateName = async(req, res)=>{ 
    try {
        const { name } = req.body;  
        const user = await User.findByIdAndUpdate(
            req.userId,
            { name },
            { new: true }
        );  
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        res.status(200).json({message: "Name updated successfully"});
    }
    catch (error) {
        res.status(500).json({message: `Update User Name Error: ${error}`});
    }   
}

export const updatePhotoURL = async (req, res) => {
  console.log("📸 [updatePhotoURL] Triggered.");

  try {
    console.log("🟢 User ID from token:", req.userId);
    console.log("🟡 File data received:", req.file);

    // Check auth
    if (!req.userId) {
      console.log("❌ No userId in request — auth failed.");
      return res.status(401).json({ message: "Unauthorized user" });
    }

    // Check file
    if (!req.file) {
      console.log("❌ No file received by multer.");
      return res.status(400).json({ message: "No image file received" });
    }

    // Check Cloudinary upload result
    if (!req.file.path) {
      console.log("❌ No Cloudinary path found in req.file");
      return res.status(400).json({ message: "Cloudinary upload failed" });
    }

    const photoURL = req.file.path;
    console.log("✅ Cloudinary returned URL:", photoURL);

    // Update user in DB
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { photoURL },
      { new: true }
    );

    if (!updatedUser) {
      console.log("❌ User not found in DB:", req.userId);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("✅ User updated successfully:", updatedUser.name);
    return res.status(200).json({
      message: "Profile picture updated successfully",
      photoURL,
    });
  } catch (error) {
    console.error("💥 updatePhotoURL failed:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
      stack: error.stack,
    });
  }
};



export const getLeaderBoard = async (req, res) => {
  try {
    const users = await User.find({})
      .sort({ rating: -1 })
      .select("name photoURL rating")
      .lean();

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: `Get LeaderBoard Error: ${error.message}` });
  }
};

export const getMatchHistory = async (req, res) => {
  try {
    const userId = req.userId;
    
    // Find all matches where user participated
    const matchParticipants = await MatchParticipant.find({ userId })
      .populate({
        path: "matchId",
        select: "status createdAt endedAt"
      })
      .sort({ createdAt: -1 })
      .lean();

    if (!matchParticipants.length) {
      return res.status(200).json([]);
    }

    // Get detailed match info and opponent details
    const matchHistory = await Promise.all(
      matchParticipants.map(async (participant) => {
        const matchId = participant.matchId._id;
        
        // Get all participants in this match
        const allParticipants = await MatchParticipant.find({ matchId })
          .populate("userId", "name photoURL rating")
          .lean();

        // Find opponent(s)
        const opponents = allParticipants.filter(
          (p) => p.userId._id.toString() !== userId.toString()
        );

        // Count problems solved by each participant
        const userSolved = participant.problems.filter(
          (p) => p.status === "solved"
        ).length;
        const opponentSolved = opponents.reduce(
          (max, opp) => Math.max(max, opp.problems.filter((p) => p.status === "solved").length),
          0
        );

        // Determine result
        let result = "Draw";
        if (userSolved > opponentSolved) result = "Win";
        else if (userSolved < opponentSolved) result = "Loss";

        return {
          matchId: matchId.toString(),
          opponent: opponents[0]?.userId?.name || "Unknown",
          opponentPhoto: opponents[0]?.userId?.photoURL || null,
          problemsSolved: `${userSolved}/${participant.problems.length || 0}`,
          opponentSolved: `${opponentSolved}/${participant.problems.length || 0}`,
          result,
          date: participant.matchId.createdAt,
          duration: Math.floor(
            (new Date(participant.matchId.endedAt || Date.now()) -
              new Date(participant.matchId.createdAt)) /
              60000
          ),
          points: `${userSolved * 3}/${(participant.problems.length || 0) * 3}`,
          problems: participant.problems.map((p) => ({
            problemId: p.problemId.toString(),
            status: p.status,
            attempts: p.attempts
          }))
        };
      })
    );

    res.status(200).json(matchHistory);
  } catch (error) {
    console.error("Get Match History Error:", error);
    res.status(500).json({ message: `Get Match History Error: ${error.message}` });
  }
};
