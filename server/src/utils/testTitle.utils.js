import Test from "../models/test.model.js";

export const getNextTestTitle = async (userId) => {
  const totalTests = await Test.countDocuments({ createdBy: userId });
  return `Test ${totalTests + 1}`;
};

export const getTestNumber = async (userId, test) => {
  const previousTests = await Test.countDocuments({
    createdBy: userId,
    createdAt: { $lt: test.createdAt }
  });

  return previousTests + 1;
};
