

import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Job from "../models/jobModel.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies.token;
    // If no token, redirect to login
    if (!token) {
      return res.redirect("/users/login");
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user in DB
    const user = await User.findById(decoded.userId).select("-password"); // exclude password

    if (!user) {
      res.clearCookie("token");
      return res.redirect("/users/login");
    }

    // Attach user data to req for later use
    req.user = user;
    // Continue to next middleware or route
    next();

  } catch (error) {
    console.log("Auth error:", error.message);
    return res.redirect("/users/login");
  }
};


export const isLoggedIn = async (req, res, next) => {
  const token = req.cookies.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select("-password");
      res.locals.user = user; // 👈 Pass user data to all views
    } catch (error) {
      res.locals.user = null;
    }
  } else {
    res.locals.user = null;
  }

  next();
}


export const authorizeEmployer = async (req, res, next) => {
  try {
    const jobId = req.params.id; // assuming the route has /jobs/:id or /jobs/edit/:id
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).send("Job not found");
    }

    // Check if logged-in user is the job creator OR role is employer
    if (job.postedBy.toString() === req.user._id.toString() || req.user.role === "employer") {
      req.job = job; // attach job to request for controller use
      next();
    } else {
      return res.status(403).send("You are not authorized to perform this action");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};
