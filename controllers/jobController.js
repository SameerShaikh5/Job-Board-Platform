
import { Application } from "../models/applicationModel.js";
import Job from "../models/jobModel.js";

// Render Job Creation Page
export const createJobPage = (req, res) => {
  if (req.user.role !== "employer") {
    return res.status(403).send("Access denied. Only employers can create jobs.");
  }
  res.render("addjob", { error: null });
};

// Handle Job Creation
export const createJob = async (req, res) => {
  try {

    if (req.user.role !== "employer") {
      return res.status(403).send("Access denied. Only employers can create jobs.");
    }
    const { title, company, location, description, skillsRequired } = req.body;


    if (!title || !company || !location || !description) {
      return res.render("createJob", {
        error: "All fields are required.",
      });
    }

    const skillsArray = skillsRequired
      ? skillsRequired.split(",").map((s) => s.trim())
      : [];

    await Job.create({
      title,
      company,
      location,
      description,
      skillsRequired: skillsArray,
      postedBy: req.user._id, // assuming user is authenticated
    });

    res.redirect("/");
  } catch (error) {
    console.error("Job creation error:", error);
    res.render("addjob", {
      error: "Something went wrong while creating the job.",
    });
  }
};



// Render Edit Job Page
export const editJobPage = async (req, res) => {
  try {
    const jobId = req.params.id;

    // Find the job by ID
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).send("Job not found");
    }

    // Render edit page and pass the job data
    res.render("editjob", { job, error: null });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

// Handle Job Update
export const editJob = async (req, res) => {
  try {
    const jobId = req.params.id;

    // Find the job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).send("Job not found");
    }

    // Update only fields provided in the form
    const { title, company, location, description, skillsRequired } = req.body;
    if (title) job.title = title;
    if (company) job.company = company;
    if (location) job.location = location;
    if (description) job.description = description;
    if (skillsRequired) {
      job.skillsRequired = skillsRequired.split(",").map(s => s.trim());
    }

    await job.save();
    res.redirect(`/jobs/${jobId}`); // Or wherever you want to redirect after update
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};



// Display Job Details Page
export const jobDetailsPage = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("postedBy", "name email");
    if (!job) {
      return res.status(404).send("Job not found!")
    }

    let hasApplied = false;
    if (req.user && req.user.role === "jobseeker") {
      const existingApp = await Application.findOne({
        user: req.user._id,
        job: job._id,
      });
      hasApplied = !!existingApp;
    }

    res.render("jobdetailpage", {
      job,
      hasApplied,
      errorMessage: null,
      successMessage: null,
      user: res.locals.user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};


// Delete Job
export const deleteJob = async (req, res) => {
  try {
    const jobId = req.params.id;

    // Find the job by ID
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).send("Job not found");
    }

    // Optional: Only allow the user who posted the job to delete it
    if (req.user._id.toString() !== job.postedBy.toString()) {
      return res.status(403).send("You are not authorized to delete this job");
    }

    await Job.findByIdAndDelete(jobId);

    // Redirect to jobs list or homepage
    res.redirect("/"); // or wherever you want
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// Apply for Job
export const applyForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("postedBy", "name email");
    if (!job) {
      return res.status(404).send("Job not found!");
    }

    // Not logged in
    if (!req.user) {
      return res.redirect("/users/login")
    }

    // Employers cannot apply
    if (req.user.role === "employer") {
      return res.render("jobdetailpage", {
        job,
        user: req.user,
        hasApplied: false,
        errorMessage: "Employers cannot apply for jobs.",
        successMessage: null,
      });
    }

    // Check if already applied
    const existingApp = await Application.findOne({
      user: req.user._id,
      job: job._id,
    });

    if (existingApp) {
      return res.render("jobdetailpage", {
        job,
        user: req.user,
        hasApplied: true,
        errorMessage: "You have already applied for this job.",
        successMessage: null,
      });
    }

    // Create new application
    await Application.create({
      user: req.user._id,
      job: job._id,
    });

    return res.render("jobdetailpage", {
      job,
      user: req.user,
      hasApplied: true,
      errorMessage: null,
      successMessage: "Application submitted successfully!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};


export const viewAppliedJobs = async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect("/login"); // redirect if not logged in
    }

    // Find all applications by this user and populate job details
    const applications = await Application.find({ user: req.user._id })
      .populate("job")
      .sort({ createdAt: -1 }); // latest first

    res.render("appliedjobs", { user: req.user, applications });
  } catch (error) {
    console.error(error);
    res.status(500).render("appliedjobs", {
      applications: [],
      errorMessage: "Server Error"
    });

  }
};