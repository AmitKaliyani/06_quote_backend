import multer from "multer";
import path from "path";
import logger from "../config/logger.js";

console.log(path.join(process.cwd(), "src", "uploads"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "src", "uploads") || "src/uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpg|jpeg|webp|png/;

  const extname = path.extname(file.originalname);
  const mimeType = file.mimetype.split("/")[1];
  // console.log(extname, mimeType);

  if (!allowed.test(extname) || !allowed.test(mimeType)) {
    cb(new Error("Invalid File type ! only Images allowed "));
  }

  cb(null, true);
};

const upload = multer({
  storage,
  // fileFilter,
  // limits: { fileSize: 5 * 1024 * 1024 },
});

export default upload;
