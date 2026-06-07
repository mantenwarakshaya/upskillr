const jobAnalysisService = require(
  "../services/jobAnalysisService"
);

const jobAnalysisController = async (
  req,
  res
) => {
  try {
    const { targetRole } = req.body;

    if (!targetRole) {
      return res.status(400).json({
        message:
          "Target role is required",
      });
    }

    const result =
      await jobAnalysisService(
        req.user._id,
        targetRole
      );

    res.json(result);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

module.exports = jobAnalysisController;