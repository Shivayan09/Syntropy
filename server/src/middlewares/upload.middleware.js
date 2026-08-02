import multer from "multer";
import { avatarFileFilter } from "./fileUpload.middleware.js";

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {fileSize: 2 * 1024 * 1024},
    fileFilter: avatarFileFilter,
});

export default upload;
