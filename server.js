// server.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
// Updated CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "https://resume-builder-9chb.vercel.app", // Added production URL
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// MongoDB connection
console.log("Connecting to MongoDB with URI:", process.env.MONGODB_URI);
const db = mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("Error connecting to MongoDB:", err));

const database = mongoose.connection;

const userCollection = database.collection("userdetails");

// MongoDB Models
const User = mongoose.model(
  "User",
  new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    filledForm: { type: Boolean, default: false },
  })
);

const userController = {
  createUser: async (req, res) => {
    try {
      console.log(
        "Received request to create or update user with data:",
        req.body
      );

      const { userId, filledForm } = req.body;
      if (!userId) {
        console.log("Error: No userId provided");
        return res.status(400).json({ error: "UserId is required" });
      }

      console.log("Checking if user already exists with userId:", userId);
      const existingUser = await User.findOne({ userId });

      if (existingUser) {
        console.log("User already exists with userId:", userId);
        existingUser.filledForm = filledForm;
        await existingUser.save();
        console.log("User updated successfully:", existingUser);
        return res.status(200).json({
          message: "User already exists, but form updated",
          user: existingUser,
        });
      }

      console.log("Creating new user with userId:", userId);
      const newUser = new User({ userId, filledForm });
      await newUser.save();
      console.log("User created successfully:", newUser);

      res
        .status(201)
        .json({ message: "User created successfully", user: newUser });
    } catch (err) {
      console.error("Error creating or updating user:", err.message);
      res
        .status(500)
        .json({ error: "Error creating user", message: err.message });
    }
  },

  getUser: async (req, res) => {
    try {
      const { id } = req.params;
      console.log("Fetching user with userId:", id);
      const user = await User.findOne({ userId: id });

      if (!user) {
        console.log("User not found with userId:", id);
        return res.status(404).json({ error: "User not found" });
      }

      console.log("User found:", user);
      res.json(user);
    } catch (err) {
      console.error("Error retrieving user:", err.message);
      res
        .status(500)
        .json({ error: "Error retrieving user", message: err.message });
    }
  },
};

app.get("/", (req, res) => {
  res.send("This is backend");
});

const userDetailsController = {
  createUserDetails: async (req, res) => {
    try {
      console.log(
        "Received request to create or update user details with data:",
        req.body
      );
      const { userId, resumeData } = req.body;

      if (!userId) {
        return res.status(400).json({ error: "UserId is required" });
      }

      console.log("Checking if user details exist for userId:", userId);
      let userDetails = await userCollection.findOne({ userId });

      if (userDetails) {
        console.log("Updating existing user details for userId:", userId);
        userDetails.resumeData = resumeData;
        console.log(userDetails.resumeData.volunteer);
        await userCollection.updateOne(
          { userId },
          { $set: { resumeData } },
          { upsert: true }
        );
        console.log("User details updated successfully:", userDetails);
        return res.status(200).json({
          message: "User details updated successfully",
          userDetails,
        });
      }

      console.log("Creating new user details for userId:", userId);

      await userCollection.insertOne({
        userId,
        resumeData,
      });
      console.log("User details created successfully:", userDetails);

      res.status(201).json({
        message: "User details created successfully",
        userDetails,
      });
    } catch (err) {
      console.error("Error creating/updating user details:", err);
      res.status(500).json({
        error: "Error saving user details",
        message: err.message,
      });
    }
  },

  getUserDetails: async (req, res) => {
    try {
      const { id } = req.params;
      console.log("Fetching user details for userId:", id);
      const userDetails = await userCollection.findOne({ userId: id });

      if (!userDetails) {
        console.log("User details not found for userId:", id);
        return res.status(404).json({ error: "User details not found" });
      }

      console.log("User details found:", userDetails);
      res.json(userDetails);
    } catch (err) {
      console.error("Error retrieving user details:", err);
      res.status(500).json({
        error: "Error retrieving user details",
        message: err.message,
      });
    }
  },
};

// Routes
app.get("/", (req, res) => {
  res.send("This is backend");
});

app.post("/user", userController.createUser);
app.get("/user/:id", userController.getUser);
app.post("/user-details", userDetailsController.createUserDetails);
app.get("/user-details/:id", userDetailsController.getUserDetails);

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
