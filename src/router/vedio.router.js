import { Router } from "express";
import { getAllVedios } from "../controllers/vedio.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router()

router.route("/all-vedios").get(getAllVedios)


export default router