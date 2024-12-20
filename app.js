const express = require("express");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const dbConnect = require("./utils/dbConnect");

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Connect to MongoDB
dbConnect();

// Middleware
app.use(express.json());

// Routes
app.use("/user", userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: "Something went wrong!" });
});

module.exports = app;
