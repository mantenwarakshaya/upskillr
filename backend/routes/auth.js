const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const validator = require("validator");
const { userAuth } = require("../middleware/auth");
const { validateSignUpData } = require("../utils/validation");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const authRouter = express.Router();

const isProd = process.env.NODE_ENV === "production";
const cookieConfig = (ms) => ({ 
  httpOnly: true, secure: isProd, sameSite: isProd ? "none" : "lax", 
  ...(ms && { expires: new Date(Date.now() + ms) }) 
});

// 1. SIGNUP
authRouter.post("/signup", async (req, res) => {
  try {
    validateSignUpData(req);

    const { firstName, emailId, password, targetRole } = req.body;

    const existingUser = await User.findOne({ emailId });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const token = jwt.sign(
      {
        firstName,
        emailId,
        password: passwordHash,
        targetRole,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const verifyLink = `${process.env.FRONTEND_URL}/verify-email/${token}`;

    await sendEmail(
      emailId,
      "Verify your UpSkillr account",
      `
        <h2>Welcome, ${firstName}!</h2>
        <p>Click below to verify your email and create your UpSkillr account:</p>
        <a href="${verifyLink}">Verify Email</a>
        <p>This link will expire in 15 minutes.</p>
      `
    );

    return res.status(200).json({
      success: true,
      message: "Verification email sent! Please check your inbox.",
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});


// 2. EMAIL VERIFICATION
authRouter.get("/verify-email/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { firstName, emailId, password, targetRole } = decoded;

    const existingUser = await User.findOne({ emailId });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already verified",
      });
    }

    await new User({
      firstName,
      emailId,
      password,
      targetRole,
      isVerified: true,
    }).save();

    return res.status(201).json({
      success: true,
      message: "Email verified and account created successfully",
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired verification link",
    });
  }
});

authRouter.post("/resend-verification", async (req, res) => {
  try {
    const { emailId } = req.body;

    if (!emailId) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const existingUser = await User.findOne({ emailId });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already verified. Please login.",
      });
    }

    return res.status(400).json({
      success: false,
      message: "Please fill the signup form again to receive a new verification link.",
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

// 3. LOGIN WITH RECOVERY CHECK
authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId }).setOptions({ includeDeleted: true });
    if (!user || !(await user.validatePassword(password))) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    if (user.isDeleted) {
      if (user.deletedAt < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
        return res.status(403).json({ success: false, message: "This account has been permanently removed." });
      }
      return res.status(403).json({ 
        success: false, code: "ACCOUNT_DEACTIVATED", 
        message: "Your account is deactivated. You can restore it within 7 days." 
      });
    }

    res.cookie("jwt_token", await user.getJWT(), cookieConfig(7 * 24 * 60 * 60 * 1000));
    res.json({ success: true, user: { _id: user._id, firstName: user.firstName, lastName: user.lastName, emailId: user.emailId, targetRole: user.targetRole, github: user.github } });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// 4. GET CURRENT USER
authRouter.get("/me", userAuth, async (req, res) => {
  try { 
    res.json({ success: true, user: req.user }); 
  } catch (err) { 
    res.status(400).json({ success: false, message: err.message }); 
  }
});

// 5. EDIT PROFILE (Fixed to bypass password validation loops)
authRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    const { firstName, lastName, targetRole, github, skills } = req.body;
    
    // Quick validation fallback to ensure required fields aren't blank
    if (!firstName || !targetRole) {
      return res.status(400).json({ 
        success: false, 
        message: "First Name and Target Role are required fields." 
      });
    }

    // Use findByIdAndUpdate to directly save changes to the DB
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          firstName: firstName,
          targetRole: targetRole,
          lastName: lastName || "",
          github: github || "",
          skills: Array.isArray(skills) ? skills : []
        }
      },
      { new: true, runValidators: true } // runValidators ensures user validation is checked cleanly
    );

    res.json({ 
      success: true, 
      message: "Profile parameters configured successfully.", 
      user: updatedUser 
    });

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// 6. UPDATE PASSWORD WITH STEP-BY-STEP VALIDATION
authRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // 1. Structural Check
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "Please fill out all password fields." 
      });
    }

    // 2. FIRST STEP: Verify if current password is correct
    const isCurrentMatch = await req.user.validatePassword(currentPassword);
    if (!isCurrentMatch) {
      return res.status(400).json({ 
        success: false, 
        message: "Current password is not correct" 
      });
    }

    // 3. SECOND STEP: Verify new password matches the confirmation password
    // 3a. Verify new password strength (same policy as signup)
    if (!validator.isStrongPassword(newPassword, { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })) {
      return res.status(400).json({
        success: false,
        message: "New password is too weak. It must be at least 8 characters and include uppercase, lowercase, number, and symbol."
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "New password and confirm password are not the same" 
      });
    }

    // 4. OPTIONAL SAFETY: Prevent setting the exact same password again
    const isSameAsOld = await req.user.validatePassword(newPassword);
    if (isSameAsOld) {
      return res.status(400).json({ 
        success: false, 
        message: "Your new password cannot be the same as your old password." 
      });
    }

    // 5. Success: Hash and save
    req.user.password = await bcrypt.hash(newPassword, 10);
    await req.user.save();

    return res.json({ 
      success: true, 
      message: "Security credentials successfully refreshed!" 
    });

  } catch (err) {
    return res.status(500).json({ 
      success: false, 
      message: err.message || "An unexpected system error occurred." 
    });
  }
});

// 7. SOFT DELETE
authRouter.delete("/profile/delete", userAuth, async (req, res) => {
  try {
    req.user.isDeleted = true;
    req.user.deletedAt = new Date();
    await req.user.save();
    
    res.cookie("jwt_token", null, { ...cookieConfig(), expires: new Date(0) })
       .json({ success: true, message: "Workspace deactivated. Retention tracking active for 7 days." });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// 8. RESTORE ACCOUNT
authRouter.post("/restore-account", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId }).setOptions({ includeDeleted: true });
    
    if (!user) return res.status(404).json({ success: false, message: "Profile records not found." });
    if (!user.isDeleted) return res.status(400).json({ success: false, message: "Workspace is already active." });
    if (!(await user.validatePassword(password))) return res.status(400).json({ success: false, message: "Invalid credentials" });
    if (user.deletedAt < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) return res.status(403).json({ success: false, message: "Recovery timeframe expired." });

    user.isDeleted = false;
    user.deletedAt = null;
    await user.save();
    res.json({ success: true, message: "Workspace recovered successfully. You can now log in." });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// 9. LOGOUT
authRouter.post("/logout", async (req, res) => {
  res.cookie("jwt_token", null, { ...cookieConfig(), expires: new Date(0) })
     .json({ success: true, message: "Logout successful." });
});

module.exports = authRouter;