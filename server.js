const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// Set MongoDB timeouts
mongoose.set("socketTimeoutMS", 30000);
mongoose.set("serverSelectionTimeoutMS", 30000);

// Middleware setup
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// CORS configuration
app.use(
  cors({
    origin: "*", // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

// Additional CORS headers middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Content-Length, X-Requested-With"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

// Request timeout middleware
app.use((req, res, next) => {
  req.setTimeout(25000);
  res.setTimeout(25000);
  next();
});

// MongoDB connection
console.log("Connecting to MongoDB with URI:", process.env.MONGODB_URI);
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 30000,
    connectTimeoutMS: 30000,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("Error connecting to MongoDB:", err));

const database = mongoose.connection;
const userCollection = database.collection("userdetails");

// Updated User Schema with image support
const User = mongoose.model(
  "User",
  new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    filledForm: { type: Boolean, default: false },
    profileImage: { type: String }, // For storing base64 images
  })
);

// User Controller
const userController = {
  createUser: async (req, res) => {
    try {
      console.log(
        "Received request to create or update user with data:",
        req.body
      );
      const { userId, filledForm, profileImage } = req.body;

      if (!userId) {
        console.log("Error: No userId provided");
        return res.status(400).json({ error: "UserId is required" });
      }

      console.log("Checking if user already exists with userId:", userId);
      const existingUser = await User.findOne({ userId });

      if (existingUser) {
        console.log("User already exists with userId:", userId);
        existingUser.filledForm = filledForm;
        if (profileImage) {
          existingUser.profileImage = profileImage;
        }
        await existingUser.save();
        console.log("User updated successfully:", existingUser);
        return res.status(200).json({
          message: "User updated successfully",
          user: existingUser,
        });
      }

      console.log("Creating new user with userId:", userId);
      const newUser = new User({ userId, filledForm, profileImage });
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

// User Details Controller
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
        await userCollection.updateOne(
          { userId },
          { $set: { resumeData } },
          { upsert: true }
        );
        userDetails = await userCollection.findOne({ userId });
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

      userDetails = await userCollection.findOne({ userId });
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
  });
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
