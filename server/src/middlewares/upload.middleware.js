import fs from "fs";
import path from "path";
import multer from "multer";

const UPLOADS_DIR = "uploads";
const AVATAR_MAX_SIZE = 5 * 1024 * 1024;
const SYLLABUS_MAX_SIZE = 10 * 1024 * 1024;

const avatarMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const syllabusMimeTypes = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);

fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const createFileFilter = (allowedMimeTypes, errorMessage) => (req, file, cb) => {
  if (allowedMimeTypes.has(file.mimetype)) {
    return cb(null, true);
  }

  const error = new Error(errorMessage);
  error.statusCode = 400;
  return cb(error);
};

export const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: AVATAR_MAX_SIZE },
  fileFilter: createFileFilter(avatarMimeTypes, "Only JPG, PNG, or WEBP avatar images are allowed.")
});

export const syllabusUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
      const safeExt = path.extname(file.originalname || "").toLowerCase();
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
    }
  }),
  limits: { fileSize: SYLLABUS_MAX_SIZE },
  fileFilter: createFileFilter(syllabusMimeTypes, "Only PDF, JPG, PNG, or WEBP syllabus files are allowed.")
});

export const handleSingleUpload = (uploader, fieldName) => (req, res, next) => {
  uploader.single(fieldName)(req, res, (err) => {
    if (!err) {
      return next();
    }

    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        const limitMessage =
          fieldName === "avatar"
            ? "Avatar file is too large. Maximum size is 5MB."
            : "Syllabus file is too large. Maximum size is 10MB.";

        return res.status(400).json({
          success: false,
          message: limitMessage
        });
      }

      return res.status(400).json({
        success: false,
        message: "Invalid upload request."
      });
    }

    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message || "Invalid upload request."
    });
  });
};
