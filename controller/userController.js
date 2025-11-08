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

export const updatePhotoURL = async(req, res)=>{ 
    try {
        if(!req.file || !req.file.path){
            return res.status(400).json({message: "No photo file uploaded"});
        }
        const photoURL = req.file.path;
        const user = await User.findByIdAndUpdate(
            req.userId,
            { photoURL },
            { new: true }
        );
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        res.status(200).json({message: "Photo URL updated successfully"});
    }
    catch (error) {
        res.status(500).json({message: `Update User Photo URL Error: ${error}`});
    }   
}   

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
