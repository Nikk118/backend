import { parse } from "dotenv";
import {Video} from "../models/video.model.js"
import {asyncHandler} from "../utils/asyncHandler.js"

import {apiResponse} from "../utils/apiResponse.js"
import {apiError} from "../utils/apiError.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVedios=asyncHandler(async(req,res)=>{
    try {
        const {page=1,limit=10,query,sortBy="createdAt",sortType="desc",userId}=req.query
    
        const pageNumber=parseInt(page,10);
        const limitNumber=parseInt(limit,10);
        console.log(1);
        
        //filter query
        const filter={};
        if(query){
            filter.title={ $regex: new RegExp(query, 'i') };
        }
        console.log(filter.title);
        
        if (userId) {
            filter.userId=userId;
        }
    
        //sort result 
        
        
        const sort = {};
        // sort[sortBy]=sortType="asc"?1:-1;
        sort[sortBy] = sortType === "asc" ? 1 : -1;

        console.log(3);
        
        //get data from table
        const videos = await Video.find(filter)
            .sort(sort) // Apply sorting based on the dynamic 'sort' object
            .skip((pageNumber - 1) * limitNumber) // Skip records for pagination
            .limit(limitNumber); // Limit the number of records fetched

        if (!videos) {
            throw new apiError(400,"missing vedios")
            console.log(videos);
            
        }
        console.log(4);
        
       
        return res.status(200)
                .json(
                    new apiResponse(200,videos," all vedios fetched successfully")
                )  
        
          
    } catch (error) {
        throw new apiError(500,"cannot get vedios")
    }

})

const publishAVideo=asyncHandler(async(req,res)=>{
    const {title,description}=req.body

    if (!title && !description) {
        throw new apiError(400,"all feils are neccessary");
    }

    //get files
    const videoPath=req.files?.videoFile[0]?.path
    const thumbNailPath=req.files?.thumbNail[0]?.path

    if (!videoPath&&!thumbNailPath) {
        throw new apiError(409,"vedio and thumbnail are necessary")
    }

    //upload on cloudinary
    const video=await uploadOnCloudinary(videoPath)
    const thumbNail=await uploadOnCloudinary(thumbNailPath)

    if (!video && !thumbNail) {
        throw new apiError(500,"error while uploading files")
    }

    //get durartion
    const videoDuration=video?.duration;

    //get user
    const owner = req.user._id

    //entery in database
    const videoData=await Video.create({
        title:title,
        description:description,
        videoFile:video.url,
        thumbNail:thumbNail.url,
        duration:videoDuration,
        owner:owner
    })

    //confirm if created 

    const videoCreated = await Video.findById(videoData._id).select("-isPublic")

    if (!videoCreated) {
        throw new apiError(500,"cannot upload video")
    }

    return res.status(200)
        .json(
            new apiResponse(200,videoCreated,"video punlished successfully")
        )

    
})


export {
    getAllVedios,
    publishAVideo
}

