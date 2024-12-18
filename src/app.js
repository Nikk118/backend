import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import userRouter from "./router/user.router.js"
import vedioRouter from "./router/vedio.router.js"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


// routes
app.use("/api/v1/user",userRouter)

app.use("/api/v1/vedio",vedioRouter)



export { app }