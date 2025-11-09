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
    if (!validator.isEmail(email)) {
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
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
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
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect email or password" });
    }
    const token = await genToken(existingUser._id);

    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    const { password: _, ...userData } = existingUser.toObject();
    return res.status(200).json(userData);
  } catch (error) {
    return res.status(500).json({ message: `Login Error: ${error.message}` });
  }
};

export const logout = async (req, res) => {
  try {
    await res.clearCookie("token");
    res.status(200).json({ message: "Logout Successfully" });
  } catch (error) {
    return res.status(500).json({ message: `Logout Error: ${error.message}` });
  }
};

export const auth0Callback = async (req, res) => {
  try {
    const { auth0Id, email, name, picture, emailVerified } = req.body;

    // Validate required fields
    if (!auth0Id || !email || !name) {
      return res.status(400).json({
        message: "Missing required Auth0 user data",
      });
    }

    // Check if user already exists by auth0Id or email
    let user = await User.findOne({
      $or: [{ auth0Id: auth0Id }, { email: email }],
    });

    let isNewUser = false;

    if (user) {
      // Existing user - login flow
      if (!user.auth0Id) {
        // User exists with email but no auth0Id, link accounts
        user.auth0Id = auth0Id;
        user.authProvider = "auth0";
        user.photoURL = picture || user.photoURL;
        user.emailVerified = emailVerified || user.emailVerified;
        await user.save();
      }

      // Generate token and set cookie (same as regular login)
      const token = await genToken(user._id);
      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      const { password: _, ...userData } = user.toObject();
      return res.status(200).json({
        user: userData,
        isNewUser: false,
      });
    } else {
      // New user - registration flow
      isNewUser = true;

      // Create placeholder password for Auth0 users
      const placeholderPassword = await bcrypt.hash(
        Math.random().toString(36),
        10
      );

      const newUser = await User.create({
        auth0Id: auth0Id,
        email: email,
        name: name,
        photoURL: picture || "",
        authProvider: "auth0",
        emailVerified: emailVerified || false,
        password: placeholderPassword, // Required by schema but not used for Auth0 users
      });

      // Generate token and set cookie (same as regular signup)
      const token = await genToken(newUser._id);
      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      const { password: _, ...userData } = newUser.toObject();
      return res.status(201).json({
        user: userData,
        isNewUser: true,
      });
    }
  } catch (error) {
    console.error("Auth0 callback error:", error);
    return res.status(500).json({
      message: `Authentication failed: ${error.message}`,
    });
  }
};
