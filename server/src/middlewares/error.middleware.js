import multer from "multer";

export const errorHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                message: "Uploaded file is too large.",
            });
        }

        return res.status(400).json({
            success: false,
            message: "Invalid file upload.",
        });
    }

    if (err) {
        return res.status(400).json({
            success: false,
            message: err.message || "Request could not be processed.",
        });
    }

    return next();
};
