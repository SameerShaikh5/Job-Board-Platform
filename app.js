import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDb from "./config/connectDb.js"
import {errorMiddleware} from "./middlewares/errorMiddleware.js"
import { userRoutes } from "./routes/userRoutes.js";
import cookieParser from "cookie-parser";
import { isLoggedIn } from "./middlewares/auth.js";
import { jobRoutes } from "./routes/jobRoutes.js";
import Job from "./models/jobModel.js";

dotenv.config();

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

const app = express();

// connect database
connectDb()

app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))

app.use(express.static(path.join(__dirname, "public")))
app.set("view engine", "ejs")

// check if logged in
app.use(isLoggedIn)

app.get("/", async (req, res) => {
  try {
    const { title, location } = req.query; // get query params

    // Build a filter object
    let filter = {};

    if (title) {
      filter.title = { $regex: title, $options: "i" }; // case-insensitive search
    }

    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    // Fetch jobs from DB
    const jobs = await Job.find(filter).limit(10).sort({ createdAt: -1 });

    res.render("index", { jobs });
  } catch (error) {
    console.error(error);
    res.render("index", { jobs: [] });
  }
});




app.use("/users",userRoutes)
app.use("/jobs", jobRoutes)

app.use(errorMiddleware)

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
