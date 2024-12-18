import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/user.model.js"
import {apiError} from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import  jwt from "jsonwebtoken"
import { deletePreviousFile } from "../utils/cloudinary_remover.js"
import mongoose from "mongoose"


const generateAccessAndRefreshToken=async(userId)=>{
    try {
        const user =await User.findOne(userId)
        console.log(userId);
        const accessToken=user.generateAccessToken()
        console.log("sherrr",accessToken);
        
        // console.log(user.accessToken);
        
        const refreshToken=user.generateRefreshToken()
        console.log("here 2 hi khende");
        user.refreshToken=refreshToken
        console.log(user.refreshToken);
        
        await user.save({validateBeforeSave:false})
        console.log("after save");
        
        return {refreshToken,accessToken}

    } catch (error) {
        throw new apiError(500,"somthing went wrong")
    }
}

const options ={
    httpOnly:true,
    secure:true
}

const registerUser=asyncHandler(async(req,res)=>{
    

    //getttin data
    const {username,fullname,password, email}=req.body


    //validation for feilds
    if(
        [username,fullname,password, email].some((feild)=>
            feild?.trim() === ""
        )
    ){
        throw new apiError(400,"all feild are require")
    }


    //user existing validation
    const userExist=await User.findOne({
        $or:[{username},{email}]
    })

    if (userExist) {
        throw new apiError(409,"username already exists")
    }

    //files validation
    const avatarLocalpath=req.files?.avatar[0]?.path;
    const coverImageLocalPath=req.files?.coverImage[0]?.path;

    if (!avatarLocalpath) {
        throw new apiError(409,"coverImage is required")
    }

    //upload on clodinoury
    const avatar =await uploadOnCloudinary(avatarLocalpath)
    const coverImage =await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new apiError(409,"image require")
    }
    

    // insert data in db
    const user= await User.create({
        fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        username,
        email,
        password
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new apiError(500,"cannot create new error")
    }


    //response
    return res.status(201).json(
       new apiResponse(200,createdUser,"success")
    )

    
   
    
})

const loginUser=asyncHandler(async(req,res)=>{
    

    //data
    //compare find
    //password compare
    //access and refresh token
    //cookies
    //res

    const {username,email,password}=req.body
    console.log("console hi khende",req.body);
    

    if (!username && !email) {
        throw new apiError(409,"email or username is require");
    }

    const user =await User.findOne({$or:[{username},{email}]})
    
    if(!user){
        throw new apiError(400,"user does not exist")
    }

    const isPasswordValid=await user.isPasswordCorrect(password)

    if(isPasswordValid){
        throw new apiError(400,"password is incorrect")
    }

    const {refreshToken,accessToken}= await generateAccessAndRefreshToken({_id:user._id})

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    
    console.log( "oyoyoyoyoyoyoy",loggedInUser,accessToken,refreshToken);
    
    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new apiResponse(200,{
            user:loggedInUser,accessToken,refreshToken
        },"user logged in succesfully")
        
    )
})

const logoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshToken:1
            }
        },{
            new:true
        }
    )

    const options ={
        httpOnly:true,
        secure:true
    }

    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new apiResponse(200,{},"user logged out")
    )
})

const generateNewAccessAndRefreshToken=asyncHandler(async(req,res)=>{
   try {
     //get token
     console.log("1");

     const incomingRefreshToken=req.cookies.refreshToken|| req.body.refreshToken;
 
         if (!incomingRefreshToken) {
             throw new apiError(401,"unauthorized request")
         }
         console.log("2");
         
     //decode  token
     const decodedToken= jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
 
     const user= await User.findById(decodedToken?._id);
     console.log("3");
 
     if (!user) {
         throw new apiError(401,"invaild token")
     }
     //compare tokens
     console.log("4");

     if (incomingRefreshToken!==user?.refreshToken) {
         throw new apiError(401,"invalid refresh token")
     }
     //generate new tokens
     const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id)
     console.log("5");
     
     //set new tokens
     return res.status(200)
                 .cookie("accessToken",accessToken,options)
                 .cookie("refreshToken",refreshToken,options)
                 .json(
                     new apiResponse(200,{accessToken,refreshToken},"success!")
                 )      
   } catch (error) {    
        throw new apiError(401,"invalid refresh token")
   }
})

const changeCurrentPassword=asyncHandler(async(req,res)=>{
    const {password,newPassword}=req.body

    const user = await User.findById(req.user._id)
    console.log(user);
    

    if (!user) {
        throw new apiError(400,"user dosent exists")
    }

    // const isPasswordValid=await user.isPasswordCorrect(Password)
    const isPasswordValid=await user.isPasswordCorrect(password)

    if(isPasswordValid){
        throw new apiError(400,"password is incorrect")
    }

    user.password=newPassword;
    user.save({validateBeforeSave:false})

    return res.status(200)
            .json(
                new apiResponse(200,{},"password changed successfully")
            )
})

const getCurrentUser=asyncHandler(async(req,res)=>{
    return res.status(200)
            .json(
                new apiResponse(200,req.user,"currrent user")
            )
})

const updateAccountDetails=asyncHandler(async(req,res)=>{
    const {fullname,username,email}=req.body

    const user= await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullname,
                email,
                username
            }
        },
        {new:true}
    ).select("-password")

    return res.status(200)
        .json(
            new apiResponse(200,user,"user updated successfully")
        )


})

const updateUserAvatar=asyncHandler(async(req,res)=>{
    const avatarLocalPath=req.file?.path
    
    if (!avatarLocalPath) {
        throw new apiError(400,"avatar file is missing")
    }
    const avatar=await uploadOnCloudinary(avatarLocalPath)
    console.log("after upload",avatar);

    if (!avatar.url) {
        throw new apiError(400,"eror while uploading")
    }

    const user =await User.findById(req.user._id).select("-password")

    if (!user) {
        throw new apiError(401, "Unauthorized user");
    }

    if (user.avatar) {
        await deletePreviousFile(user.avatar)
    }

    user.avatar= avatar.url

    await user.save()

    return res.status(200).json(
        new apiResponse(200, user, "avatar updated successfully")
    );
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;

    // Check if a new file was uploaded
    if (!coverImageLocalPath) {
        throw new apiError(400, "Cover image file is missing");
    }

    // Upload the new cover image to Cloudinary
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!coverImage.url) {
        throw new apiError(400, "Error while uploading");
    }

    // Find the user
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
        throw new apiError(401, "Unauthorized user");
    }

    // Delete the previous image if it exists
    if (user.coverImage) {
        await deletePreviousFile(user.coverImage);
    }

    // Update the user's cover image
    user.coverImage = coverImage.url;
    await user.save();

    // Return updated user details, excluding password
    return res.status(200).json(
        new apiResponse(200, user, "Cover image updated successfully")
    );
});

const getUserChannelProfile=asyncHandler(async(req,res)=>{
    const {username}=req.params

    if (!username) {
        throw new apiError(400,"username is missing")
    }

    const channel=await User.aggregate([
        {
            $match:{
                username:username?.toLowerCase()
            }
        },
        {
            $lookup:{
               from:"subscribtions",
               localField:"_id",
               foreignField:"channel",
               as:"subscribers" 
            }
        },
        {
            $lookup:{
                from:"subscribtions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
           
        },
        {
            $addFields:
            {
                SubscribersCount:
                {
                    $size:"$subscribers"
                }
                ,
                ChannelsSubscribedTo:
                {
                    $size:"subscribedTo"
                },
                
                isSubscribed:{
                $cond:{
                    if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                    then:true,
                    else:false
                    }
                }
                
            }
        },
        {
            $project:{
                fullname:1,
                username:1,
                email:1,
                coverImage:1,
                avatar:1,
                SubscribersCount:1,
                ChannelsSubscribedTo:1,
                isSubscribed:1

            }
        }
    ])
    
    if (!channel) {
        throw new apiError(404,"channel doesnt exist")
    }

    return res .status(200)
            .json(
                new apiResponse(200,channel[0],"user channel fetch successfully")
            )
})

const getWatchHistory=asyncHandler(async(req,res)=>{
   
    const user=await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(String(req.user._id))
            }
        },
        {
            $lookup:{
                from:"vedios",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullname:1,
                                        username:1,
                                        avatar:1

                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]

            }
        }
    ])

    return res.status(200)
            .json(
                new apiResponse(200,user[0].watchHistory,"watch history fecth successfully")
            )
})

export  {
    registerUser,
    loginUser,
    logoutUser,
    generateNewAccessAndRefreshToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}