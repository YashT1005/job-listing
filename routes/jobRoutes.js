const express = require("express");
const router = express.Router();
const Job = require("../models/job");
const jwtVerify = require("../middlewares/authmiddleware");

// Create a new Job
router.post("/create", jwtVerify, async (req, res) => {
    try {
        const { companyName, title, description, logoUrl } = req.body;

        if (!companyName || !title || !description || !logoUrl) {
            return res.status(400).json({ errorMessage: "Bad request" });
        }

        await Job.create({
            companyName,
            title,
            description,
            logoUrl,
            refUserId: req.body.userId,
        });

        res.json({
            message: "New Job Created successfully",
            CompanyName: companyName,
        });
    } catch (error) {
        console.log(error);
    }
});

// Edit Job
router.put("/edit/:jobId", jwtVerify, async (req, res) => {
    try {
        const { companyName, title, description, logoUrl } = req.body;
        const jobId = req.params.jobId;
        // console.log(jobId);
        // console.log(req.body.userId);
        const job = await Job.findById(jobId);
        // console.log(job.refUserId.toHexString());
        // console.log(`new ObjectId('${ job.refUserId }')`);

        if (!companyName || !title || !description || !logoUrl || !jobId) {
            return res.status(400).json({
                errorMessage: "Bad request",
            });
        }

        if (req.body.userId === job.refUserId.toHexString()) {
            await Job.updateOne(
                { _id: jobId },
                {
                    $set: {
                        companyName,
                        title,
                        description,
                        logoUrl,
                    },
                }
            );

            return res.json({
                message: "Job details updated successfully",
            });
        }

        res.status(401).json({ message: "Unauthorized" });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
});

// Geting the job details by id
router.get("/job-description/:jobId", async (req, res) => {
    try {
        const jobId = req.params.jobId;

        if (!jobId) {
            return res.status(400).json({
                errorMessage: "Bad request",
            });
        }

        const jobDetails = await Job.findById(jobId);

        return res.json({
            data: jobDetails,
        });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
});

// Get all jobs
router.get("/all", async (req, res) => {
    try {
        const title = req.query.title || "";
        const skills = req.query.skills;
        let filterSkills = skills?.split(",");

        let filter = {};

        if (filterSkills) {
            filter = { skills: { $in: [...filterSkills] } };
        }

        const jobList = await Job.find(
            {
                title: { $regex: title, $options: "i" },
                ...filter,
            },
            {
                _id: 0,
                companyName: 1,
                title: 1,
                skills: 1,
            }
        );

        return res.json({
            data: jobList,
        });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
});

// Delete Job
router.delete("/delete/:id", async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                errorMessage: "Job not found",
            });
        }

        // if (job.refUserId.toString() !== job.refUserId.toString()) {
        // }

        await job.deleteOne();

        return res.json({ message: "job deleted successfully" });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
});

module.exports = router;
