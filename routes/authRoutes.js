const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/register", async (req, res) => {
    try {
        // console.log("Hieee!");
        const { name, email, mobile, password } = req.body;

        if (!name || !email || !mobile || !password) {
            return res.status(400).json({ errorMessage: "Bad request" });
        }

        const isExistingUser = await User.findOne({ email: email });

        if (isExistingUser) {
            return res
                .status(409)
                .json({ message: "User already exist (email)" });
        }

        const isMobile = await User.findOne({ mobile: mobile });

        if (isMobile) {
            return res
                .status(409)
                .json({ message: "User already exist (mobile)" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // await User.create({
        //     name,
        //     email,
        //     mobile,
        //     password: hashedPassword,
        // });

        const userData = new User({
            name,
            email,
            mobile,
            password: hashedPassword,
        });

        const userResponse = await userData.save();

        const token = await jwt.sign(
            { userId: userResponse._id },
            process.env.JWT_SECRET
        );

        res.json({
            message: "User registered successfully",
            token: token,
            name: name,
        });
    } catch (error) {
        console.log(error);
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(409).json({
                errorMessage: "Bad request! Invalid credentials",
            });
        }

        const userDetails = await User.findOne({ email });

        if (!userDetails) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            userDetails.password
        );

        if (!passwordMatch) {
            return res.status(401).json({ message: "Incorrect password" });
        }

        const token = await jwt.sign(
            { userId: userDetails._id },
            process.env.JWT_SECRET
        );

        res.json({
            message: "Login Successfull",
            token: token,
            name: userDetails.name,
        });
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;
