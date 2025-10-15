import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken.js";

// Render Register Page
export const registerPage = (req, res) => {
  res.render("register", { error: null });
};

// Register User
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, contact, skills } = req.body;
    const skillArray = skills.split(',').map(s => s.trim());

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render("register", { error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      contact,
      skills:skillArray,
    });

    generateToken(res, user._id);
    res.redirect("/users/profile");
  } catch (error) {
    console.error(error);
    res.render("register", { error: "Something went wrong!" });
  }
};

// Render Login Page
export const loginPage = (req, res) => {
  res.render("login", { error: null });
};


// login user
export const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;
    password = password.trim()
    email = email.trim()

    const user = await User.findOne({ email });

    if (!user) {
      return res.render("login", { error: "User not found!" });
    }

    const isMatch = await user.comparePassword(password); // 👈 This line uses schema method

    
    if (!isMatch) {
      return res.render("login", { error: "Invalid password!" });
    }

    generateToken(res, user._id);
    return res.redirect("/");
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error");
  }
};


// Profile Page (Protected)
export const profilePage = async (req, res) => {
  res.render("userprofile", { user: req.user });
};


export const updateUser = async (req, res) => {
  try {
    const userId = req.user._id; // from isAuthenticated middleware
    const { name, contact, skills } = req.body;

    const updateData = {};

    // Add fields only if provided
    if (name) updateData.name = name;
    if (contact) updateData.contact = contact;
    if (skills) {
      updateData.skills = skills.split(",").map(s => s.trim());
    }

    if (Object.keys(updateData).length === 0) {
      return res.render("userprofile", {
        user: req.user,
        error: "Please provide at least one field to update!",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    res.render("userprofile", {
      user: updatedUser,
      message: "Profile updated successfully!",
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).render("userprofile", {
      user: req.user,
      error: "Something went wrong while updating profile!",
    });
  }
};


// Logout
export const logoutUser = (req, res) => {
  res.clearCookie("token");
  res.redirect("/users/login");
};
