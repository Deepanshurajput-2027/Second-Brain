import multer from 'multer';

// Use memory storage so we can stream the buffer directly to Gemini later
const storage = multer.memoryStorage();

// Set file size limit to 10MB
export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  }
});
