const syllabusMimeTypes = new Set([
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
]);

const avatarMimeTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
]);

export const syllabusFileFilter = (req, file, cb) => {
    if (!syllabusMimeTypes.has(file.mimetype)) {
        return cb(new Error("Only PDF, JPG, PNG, and WEBP files are allowed."));
    }

    return cb(null, true);
};

export const avatarFileFilter = (req, file, cb) => {
    if (!avatarMimeTypes.has(file.mimetype)) {
        return cb(new Error("Only JPG, PNG, and WEBP avatar files are allowed."));
    }

    return cb(null, true);
};
