import User from "../model/userModel.js"
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
