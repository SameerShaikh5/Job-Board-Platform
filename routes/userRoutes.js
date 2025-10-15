import express from "express";
import {
  registerPage,
  registerUser,
  loginPage,
  loginUser,
  profilePage,
  logoutUser,
  updateUser,
} from "../controllers/userController.js";
import { isAuthenticated} from "../middlewares/auth.js";

const router = express.Router();

// Register routes
router
  .route("/register")
  .get(registerPage)   // render form
  .post(registerUser); // handle submission

// Login routes
router
  .route("/login")
  .get(loginPage)
  .post(loginUser);

router.
route("/profile")
.get(isAuthenticated,profilePage)
.post(isAuthenticated, updateUser)

// Logout
router.get("/logout", logoutUser);

export const userRoutes = router;
