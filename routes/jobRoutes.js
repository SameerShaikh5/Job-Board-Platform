

import express from "express";
import { authorizeEmployer, isAuthenticated } from "../middlewares/auth.js";
import { createJobPage, createJob, editJob, editJobPage, jobDetailsPage, deleteJob, applyForJob, viewAppliedJobs } from "../controllers/jobController.js";

const router = express.Router();

router.get("/applied-jobs", isAuthenticated, viewAppliedJobs);

// Create Job routes
router.route("/add")
.get(isAuthenticated, createJobPage)
    .post(isAuthenticated, createJob);

router.route("/edit/:id")
    .get(isAuthenticated, authorizeEmployer, editJobPage)
    .post(isAuthenticated, authorizeEmployer, editJob)

router.route("/:id")
    .get(jobDetailsPage)

router.get("/apply/:id", isAuthenticated, applyForJob)


router.post("/delete/:id", isAuthenticated, authorizeEmployer, deleteJob);


export const jobRoutes = router