const validator = require("validator");

const validateSignUpData = (req) => {
  const { firstName, emailId, password, targetRole } = req.body;

  if (!firstName) throw new Error("Name is required!");
  if (!validator.isEmail(emailId)) throw new Error("Valid email is required!");
  const strengthOptions = { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 };
  if (!validator.isStrongPassword(password, strengthOptions)) throw new Error("Password too weak! It must be at least 8 characters and include uppercase, lowercase, number, and symbol.");
  if (!targetRole) throw new Error("Target career role is required!");
};

module.exports = { validateSignUpData };