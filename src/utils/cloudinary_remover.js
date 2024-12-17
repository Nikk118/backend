import { v2 as cloudinary} from "cloudinary";
import { apiError } from "./apiError.js";
// import { apiResponse } from "./apiResponse.js";



cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const deletePreviousFile = async (url) => {
    if (!url) return null;

    // Extract the public ID from the Cloudinary URL
    const parts = url.split('/');
    const fileName = parts[parts.length - 1]; // Fixed the typo
    const publicId = fileName.split('.')[0]; // Extracts "image_name" from "image_name.extension"

    if (!publicId) {
        throw new apiError(400, "Older file path is missing");
    }

    try {
        // Use Cloudinary's promise-based destroy method
        const result = await cloudinary.uploader.destroy(publicId);
        console.log("Deleted:", result);
        return result; // Return result for optional use
    } catch (error) {
        console.error("Error deleting file:", error);
        throw new apiError(500, "Issue while deleting the previous file");
    }
};


export {deletePreviousFile}