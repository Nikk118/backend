import { Router } from "express";
import { getAllVedios,publishAVideo } from "../controllers/vedio.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router=Router()

router.route("/all-vedios").get(getAllVedios)

router.route("/publishVideo").post(
    upload.fields([
        {
            name:"videoFile",
            maxCount:1
        },
        {
            name:"thumbNail",
            maxCount:1
        }
    ]),verifyJWT,publishAVideo

)


export default router