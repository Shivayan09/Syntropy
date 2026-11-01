// What other services are allowed to ask the generation service.
// Everything runs in one process for now, so these read the model directly.
// When services run as separate containers, these become HTTP calls to /internal/generation.
import Test from "./models/test.model.js";

// The full test, including answers. Only returned if the user owns it.
export const getUserTest = (testId, userId) => Test.findOne({ _id: testId, createdBy: userId }).lean();

export const countUserTests = (userId) => Test.countDocuments({ createdBy: userId });

export const getUserAptitudeTests = (userId) =>
    Test.find({ createdBy: userId, category: "aptitude" }).select("_id questions aptitude").lean();
