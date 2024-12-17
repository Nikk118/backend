const asyncHandler=(requestHandler)=>{
    return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next))
        .catch((err)=>next(err))
    }
}
// const asyncHandler = (requestHandler) => {
//     return (req, res, next) => {
//         Promise.resolve(requestHandler(req, res, next)) // Pass the correct arguments: req, res, next
//             .catch((err) => next(err)); // Catch errors and pass them to the next middleware
//     };
// };






export {asyncHandler}

// const asyncHandaler=(fn)=>async(req,res,next)=>{

//     try {
//         await fn(req ,res,next)
//     } catch (error) {
//         res.status(err.code||500).json({
//             success:false,
//             message:err.message
//         })
//     }

// }