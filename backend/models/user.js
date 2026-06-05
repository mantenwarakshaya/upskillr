const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// 1. Define the sub-document schema for Analysis History
const analysisSchema = new mongoose.Schema({
  role: { 
    type: String, 
    required: true 
  },
  matchPercentage: { 
    type: Number, 
    required: true,
    min: 0,
    max: 100
  },
  missingSkills: { 
    type: [String], 
    default: [] 
  },
  strengths: { 
    type: [String], 
    default: [] 
  },
  roadmap: { 
    type: [String], 
    default: [] 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// 2. Define the Main User Schem

const userSchema = new mongoose.Schema({
  firstName: { 
    type: String, 
    required: true 
  },
  lastName: { 
    type: String 
  },

  emailId: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  
  // AI Career Inputs
  targetRole: { 
    type: String, 
    required: true 
  }, // e.g., "MERN Developer"
  skills: {
    type: [String],
    default: []
  },

  github: { 
    type: String, 
    validate: [validator.isURL, "Invalid GitHub URL"] 
  },
  resumeUrl: { 
    type: String 
  }, // Path to stored PDF
  
  analysisHistory: [analysisSchema], // Array of past analyses

  currentSavedRoadmap: {
    type: mongoose.Schema.Types.Mixed, // Allows storing full JSON structure from Gemini
    default: null
  },
  
  // isVerified: { 
  //   type: Boolean, 
  //   default: false 
  // },
  isDeleted: { 
    type: Boolean, 
    default: false 
  }
}, { timestamps: true });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    throw new Error(err); 
  }
});

userSchema.methods.getJWT = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

userSchema.methods.validatePassword = async function (passwordInput) {
  return bcrypt.compare(passwordInput, this.password);
};

module.exports = mongoose.model("User", userSchema);