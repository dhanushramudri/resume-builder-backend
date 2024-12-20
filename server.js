const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose"); // Import mongoose for MongoDB
require("dotenv").config(); // To load environment variables from .env file

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000", // Allow requests from the frontend
  })
);

// MongoDB connection using process.env.MONGODB_URI
console.log("Connecting to MongoDB with URI:", process.env.MONGODB_URI);
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("Error connecting to MongoDB:", err));

// MongoDB Models
const User = mongoose.model(
  "User",
  new mongoose.Schema({
    userId: { type: String, required: true, unique: true }, // Use userId as a unique identifier
    filledForm: { type: Boolean, default: false }, // Flag for form completion
  })
);

// Controllers
const userController = {
  createUser: async (req, res) => {
    try {
      console.log(
        "Received request to create or update user with data:",
        req.body
      );

      const { userId, filledForm } = req.body; // Destructure the userId and filledForm from the body
      if (!userId) {
        console.log("Error: No userId provided");
        return res.status(400).json({ error: "UserId is required" });
      }

      // Check if the user already exists
      console.log("Checking if user already exists with userId:", userId);
      const existingUser = await User.findOne({ userId });

      if (existingUser) {
        console.log("User already exists with userId:", userId);
        // Update the user if they exist
        existingUser.filledForm = filledForm; // Update the filledForm field
        await existingUser.save();
        console.log("User updated successfully:", existingUser);
        return res.status(200).json({
          message: "User already exists, but form updated",
          user: existingUser,
        });
      }

      // Create a new user if they do not exist
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
      const { id } = req.params; // Get the userId from the URL parameters
      console.log("Fetching user with userId:", id);
      const user = await User.findOne({ userId: id }); // Find the user by userId

      if (!user) {
        console.log("User not found with userId:", id);
        return res.status(404).json({ error: "User not found" });
      }

      console.log("User found:", user);
      res.json(user); // Send the user data as a response
    } catch (err) {
      console.error("Error retrieving user:", err.message);
      res
        .status(500)
        .json({ error: "Error retrieving user", message: err.message });
    }
  },
};

// Routes
app.get("/", (req, res) => {
  res.send("This is backend"); // Display the message on the root route
});

app.post("/user", userController.createUser); // Route for creating or updating a user
app.get("/user/:id", userController.getUser); // Route for fetching a user by ID

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
module.exports = app;
