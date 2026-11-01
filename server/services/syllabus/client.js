// What other services are allowed to ask the syllabus service.
// Everything runs in one process for now, so this reads the model directly.
// When services run as separate containers, this becomes an HTTP call to /internal/syllabus.
import Syllabus from "./models/syllabus.model.js";

export const getUserSyllabus = (userId) => Syllabus.findOne({ user: userId }).lean();
