import { v2 as cloudinary} from "cloudinary";
import fs from "fs";

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});


const uploadOnCloudinary=async(localFilePath)=>{
    try {
        if(!localFilePath) return null

        //upload
        console.log(localFilePath)
        const response=await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        console.log("successfully uploadaed",response.url);
        fs.unlink(localFilePath, (err) => {
            if (err) {
                console.error("Error deleting local file:", err);
            } else {
                console.log("File successfully deleted from local storage:", localFilePath);
            }
        });
        
        return response;
        
    } catch (error) {
        fs.unlinkSync(localFilePath)//remove file from server
        return null;
    }
}
export {uploadOnCloudinary} 