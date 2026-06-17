const User = require("../../models/user");

const deductCredits = async (userId, amount) => {
  const updatedUser = await User.findOneAndUpdate(
    {
      _id: userId,
      "aiUsage.creditsRemaining": { $gte: amount }
    },
    {
      $inc: {
        "aiUsage.creditsRemaining": -amount
      }
    },
    {
      new: true
    }
  );

  if (!updatedUser) {
    throw new Error("Insufficient credits");
  }

  return updatedUser.aiUsage.creditsRemaining;
};

module.exports = {
  deductCredits,
};