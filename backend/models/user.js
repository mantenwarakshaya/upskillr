const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, default: "" },
  emailId: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  
  targetRole: { type: String, required: true }, 
  skills: { type: [String], default: [] },
  github: { type: String, default: "", validate: {
    validator: function(v) {
      if (!v) return true; // Allow empty string bypasses
      return validator.isURL(v);
    },
    message: "Invalid GitHub URL"
  }},
  resumeUrl: { type: String }, 
  aiUsage: {
  creditsRemaining: {
    type: Number,
    default: 20,
  },
  lastResetDate: {
    type: Date,
    default: Date.now,
  },
},
  
  isDeleted: { type: Boolean, default: false, Republication: true },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

// Global Query Middleware to exclude soft-deleted profiles dynamically
userSchema.pre(/^find/, function (next) {
  // If explicitly requested via options, skip filtering out soft-deleted users
  if (this.getOptions().includeDeleted) {
    return next();
  }
  this.where({ isDeleted: false });
  next();
});

// Secure Password Hashing
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err); 
  }
});

// Single point of truth for JWT creation
userSchema.methods.getJWT = function () {
  const secret = process.env.JWT_SECRET || "your_fallback_jwt_secret_key";
  return jwt.sign({ _id: this._id }, secret, { expiresIn: "7d" });
};

userSchema.methods.validatePassword = async function (passwordInput) {
  return bcrypt.compare(passwordInput, this.password);
};

module.exports = mongoose.model("User", userSchema);