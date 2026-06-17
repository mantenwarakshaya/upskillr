const express = require("express");
const User = require("../models/user");
const validator = require("validator");
const { userAuth } = require("../middleware/auth");
const { validateSignUpData } = require("../utils/validation");

const authRouter = express.Router();

const isProd = process.env.NODE_ENV === "production";
const cookieConfig = (ms) => ({ 
  httpOnly: true, 
  secure: isProd, 
  sameSite: isProd ? "none" : "lax", 
  ...(ms && { expires: new Date(Date.now() + ms) }) 
});

// 1. SIGNUP
authRouter.post("/signup", async (req, res) => {
  try {
    if (typeof validateSignUpData === "function") {
      validateSignUpData(req);
    }

    const { firstName, emailId, password, targetRole } = req.body;
    // Bypassing default query hook to check if user already exists (even if soft-deleted)
    const existingUser = await User.findOne({ emailId }).setOptions({ includeDeleted: true });

    if (existingUser) {
      if (existingUser.isDeleted) {
        return res.status(400).json({ 
          success: false, 
          message: "This email belongs to a deactivated account. Please restore it instead." 
        });
      }
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const user = new User({ firstName, emailId, password, targetRole });
    await user.save();

    return res.status(201).json({ success: true, message: "Account created successfully" });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// 2. LOGIN
authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId }).setOptions({ includeDeleted: true });
    
    if (!user || !(await user.validatePassword(password))) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    // Checking if 7-day window expired
    if (user.isDeleted) {
      if (user.deletedAt && user.deletedAt < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
        return res.status(403).json({ success: false, message: "This account has been permanently removed." });
      }
      return res.status(403).json({ 
        success: false, 
        code: "ACCOUNT_DEACTIVATED", 
        message: "Your account is deactivated. You can restore it within 7 days." 
      });
    }

    const token = user.getJWT(); // Reused method logic uniformly

    res.cookie("jwt_token", token, cookieConfig(7 * 24 * 60 * 60 * 1000));
    res.json({ 
      success: true, 
      token,
      user: { 
        _id: user._id, 
        firstName: user.firstName, 
        lastName: user.lastName || "", 
        emailId: user.emailId, 
        targetRole: user.targetRole, 
        github: user.github || "",
        skills: user.skills || []
      } 
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// 3. GET CURRENT USER
authRouter.get("/me", userAuth, async (req, res) => {
  try { 
    res.json({ success: true, user: req.user }); 
  } catch (err) { 
    res.status(400).json({ success: false, message: err.message }); 
  }
});

// 4. EDIT PROFILE
authRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    const { firstName, lastName, targetRole, github, skills } = req.body;
    
    if (!firstName || !targetRole) {
      return res.status(400).json({ success: false, message: "First Name and Target Role are required." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          firstName,
          targetRole,
          lastName: lastName || "",
          github: github || "",
          skills: Array.isArray(skills) ? skills : []
        }
      },
      { new: true, runValidators: true }
    );

    res.json({ success: true, message: "Profile parameters configured successfully.", user: updatedUser });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// 5. UPDATE PASSWORD
authRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: "Please fill out all password fields." });
    }

    const isCurrentMatch = await req.user.validatePassword(currentPassword);
    if (!isCurrentMatch) {
      return res.status(400).json({ success: false, message: "Current password is not correct" });
    }

    if (!validator.isStrongPassword(newPassword, { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters and include uppercase, lowercase, number, and symbol."
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "New password and confirm password are not the same" });
    }

    if (await req.user.validatePassword(newPassword)) {
      return res.status(400).json({ success: false, message: "Your new password cannot be the same as your old password." });
    }

    req.user.password = newPassword; 
    await req.user.save();

    return res.json({ success: true, message: "Security credentials successfully refreshed!" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || "An unexpected system error occurred." });
  }
});

// 6. SOFT DELETE
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

// 7. RESTORE ACCOUNT
authRouter.post("/restore-account", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId }).setOptions({ includeDeleted: true });
    
    if (!user) return res.status(404).json({ success: false, message: "Profile records not found." });
    if (!user.isDeleted) return res.status(400).json({ success: false, message: "Workspace is already active." });
    if (!(await user.validatePassword(password))) return res.status(400).json({ success: false, message: "Invalid credentials" });
    
    if (user.deletedAt && user.deletedAt < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
      return res.status(403).json({ success: false, message: "Recovery timeframe expired." });
    }

    user.isDeleted = false;
    user.deletedAt = null;
    await user.save();
    res.json({ success: true, message: "Workspace recovered successfully. You can now log in." });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// 8. LOGOUT
authRouter.post("/logout", async (req, res) => {
  res.cookie("jwt_token", null, { ...cookieConfig(), expires: new Date(0) })
     .json({ success: true, message: "Logout successful." });
});

module.exports = authRouter;