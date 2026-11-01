import Test from "../models/test.model.js";

const categoryFilter = (category) =>
  category === "aptitude" ? { category: "aptitude" } : { category: { $ne: "aptitude" } };

const titlePrefix = (category) => (category === "aptitude" ? "Aptitude Set" : "Test");

export const getNextTestTitle = async (userId, category = "academic") => {
  const totalTests = await Test.countDocuments({ createdBy: userId, ...categoryFilter(category) });
  return `${titlePrefix(category)} ${totalTests + 1}`;
};

export const getTestNumber = async (userId, test) => {
  const category = test?.category === "aptitude" ? "aptitude" : "academic";

  const previousTests = await Test.countDocuments({
    createdBy: userId,
    ...categoryFilter(category),
    createdAt: { $lt: test.createdAt }
  });

  return previousTests + 1;
};

export const getGeneratedTestTitle = async (userId, test) => {
  const category = test?.category === "aptitude" ? "aptitude" : "academic";
  const number = await getTestNumber(userId, test);
  return `${titlePrefix(category)} ${number}`;
};
