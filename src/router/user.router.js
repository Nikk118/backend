import { Router } from "express";
import { registerUser,loginUser, logoutUser, generateNewAccessAndRefreshToken,getCurrentUser,changeCurrentPassword,updateAccountDetails,updateUserAvatar,updateUserCoverImage, getUserChannelProfile, getWatchHistory } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { get } from "mongoose";

const router =Router()
router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser)

router.route("/refresh-token").post(generateNewAccessAndRefreshToken)



//secure route
router.route("/logout").post(verifyJWT,logoutUser)

router.route("/changeCurrentPassword").post(verifyJWT,changeCurrentPassword)

router.route("/getCurrentUser").get(verifyJWT,getCurrentUser)

router.route("/updateAccountDetails").patch(verifyJWT,updateAccountDetails)

router.route("/updateUserAvatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)

router.route("/updateUserCoverImage").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage)

router.route("/c/:username").get(verifyJWT,getUserChannelProfile)

router.route("/history").get(verifyJWT,getWatchHistory)


export default router