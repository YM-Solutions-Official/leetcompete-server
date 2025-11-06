import User from "../model/userModel.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import { genToken } from "../config/token.js";

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    if (!validator.isEmail(email)){
      return res
        .status(400)
        .json({ message: "Please enter a valid email address" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must have at least 8 characters" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    const token = await genToken(newUser._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, 
      sameSite: "Strict", 
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    console.log(token);
    const { password: _, ...userData } = newUser.toObject();
    return res.status(201).json(userData);
  } catch (error) {
    return res.status(500).json({ message: `Sign Up Error: ${error.message}` });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    let existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }
    let isMatch = await bcrypt.compare(password, existingUser.password);
    if(!isMatch){
        return res.status(400).json({ message: "Incorrect email or password" });
    }
    const token = await genToken(existingUser._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, 
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    const { password: _, ...userData } = existingUser.toObject();
    return res.status(200).json(userData);  
  } catch (error) {
    return res.status(500).json({ message: `Login Error: ${error.message}` });
}

};

export const logout = async(req, res)=>{
    try {
        await res.clearCookie('token');
        res.status(200).json({message: 'Logout Successfully'});
    } catch (error) {
        return res.status(500).json({ message: `Logout Error: ${error.message}` });
    }
}

