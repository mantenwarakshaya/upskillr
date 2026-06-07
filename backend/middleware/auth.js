const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    console.log("Cookies:", req.cookies);

    const token = req.cookies.jwt_token;

    console.log("Token:", token);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please login",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    console.log("Decoded:", decoded);

    const user = await User.findById(decoded._id);

    console.log("User:", user?._id);

    if (!user || user.isDeleted) {
      return res.status(401).json({
        success: false,
        message: "User not found or deactivated",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.log("AUTH ERROR:", err);
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

module.exports = { userAuth };