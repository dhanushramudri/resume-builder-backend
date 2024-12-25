const mongoose = require("mongoose");

const userDetailsSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  filledForm: { type: Boolean, default: false }, // Flag for form completion

  resumeData: {
    basics: {
      firstName: String,
      lastName: String,
      name: String,
      label: String,
      image: String,
      email: String,
      phone: String,
      url: String,
      summary: String,
      college: String,
      specialization: String,
      course: String,
      branch: String,
      passOutYear: String,
      cgpa: String,
      gender: String,
      genderOther: String,
      dateOfBirth: String,
      jobPreferredCountries: [String],
      jobPreferredStates: [String],
      jobPreferredCities: [String],
      location: {
        address: String,
        postalCode: String,
        city: String,
        countryCode: String,
        region: String,
      },
      relExp: String,
      totalExp: String,
      objective: String,
      profiles: [
        {
          network: String,
          username: String,
          url: String,
        },
      ],
    },
    skills: {
      languages: [{ name: String, level: String }],
      frameworks: [{ name: String, level: String }],
      technologies: [{ name: String, level: String }],
      libraries: [{ name: String, level: String }],
      databases: [{ name: String, level: String }],
      practices: [{ name: String, level: String }],
      tools: [{ name: String, level: String }],
    },
    work: [
      {
        name: String,
        position: String,
        startDate: String,
        endDate: String,
        isWorkingHere: Boolean,
        summary: String,
      },
    ],
    education: [
      {
        institution: String,
        studyType: String,
        area: String,
        startDate: String,
        endDate: String,
        score: String,
      },
    ],
    activities: {
      involvements: String,
      achievements: String,
    },
    volunteer: [
      {
        organization: String,
        position: String,
        startDate: String,
        endDate: String,
        summary: String,
      },
    ],
    awards: [
      {
        title: String,
        date: String,
        issuer: String,
        summary: String,
      },
    ],
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const UserDetails = mongoose.model("UserDetails", userDetailsSchema);
module.exports = UserDetails;
