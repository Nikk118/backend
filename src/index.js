
import {app} from "./app.js"
import dotenv from 'dotenv';
dotenv.config({path: './env'});  


import connectDB from './db/index.js';



connectDB()
.then(()=>{
    app.listen(process.env.PORT || 3000,()=>{
        console.log(`server is running on port : ${process.env.PORT}`)

    })
})
.catch((err)=>{
    console.log("connection fail...",err);
})






// import express from 'express'
// const app = express()

// ;( async()=>{
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        
//         app.on("error",(error)=>{
//             console.log("app error")
//             throw error
//         })

//         app.listen(process.env.PORT,()=>{
//             console.log("port: ",process.env.PORT)
//         })

//     } catch (error) {
//         console.log("error ",error)
//     }
// })()

// import express, { urlencoded } from "express";

// const app = express();
// app.use(express.json());
// app.use(urlencoded({ extended: true }));

// app.post('/test', (req, res) => {
//     console.log(req.body); // Should log the parsed body
//     res.send('Body received');
// });

// app.listen(3000, () => console.log('Server is running on port 3000'));
