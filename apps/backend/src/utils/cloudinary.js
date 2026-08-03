import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import * as dotenv from 'dotenv';
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a memory buffer to Cloudinary using a stream.
 * @param {Buffer} buffer - The file buffer
 * @param {string} folderName - Optional folder name in Cloudinary
 * @returns {Promise<object>} - Resolves with the Cloudinary response
 */
export const uploadToCloudinary = (buffer, folderName = 'second_brain_uploads') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folderName,
        resource_type: 'auto', // Automatically handle images, raw PDFs, etc.
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};
