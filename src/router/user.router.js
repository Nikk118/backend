import { Router } from "express";
import { registerUser,loginUser, logoutUser, generateNewAccessAndRefreshToken,getCurrentUser,changeCurrentPassword,updateAccountDetails,updateUserAvatar,updateUserCoverImage } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

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

router.route("/getCurrentUser").post(verifyJWT,getCurrentUser)

router.route("/updateAccountDetails").post(verifyJWT,updateAccountDetails)

router.route("/updateUserAvatar").post(verifyJWT,upload.single("avatar"),updateUserAvatar)

router.route("/updateUserCoverImage").post(verifyJWT,upload.single("coverImage"),updateUserCoverImage)


export default router