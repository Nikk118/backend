import mongoose,{Schema} from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new Schema(
    {
        username:{
            type:String,
            require:true,
            unique:true,
            lowercse:true,
            trim:true,
            index:true
        },
        email:{
            type:String,
            require:true,
            unique:true,
            lowercse:true,
            trim:true
        },
        fullname:{
            type:String,
            require:true,
            trim:true
        },
        avatar:{
            type:String,
            require:true
        },
        coverImage:{
            type:String //cloudinary url
        },
        watchHistory:[
            {
                type:Schema.Types.ObjectId,
                ref:"Vedio"
            }
        ],
        password:{
            type:String,
            require:true
        },
        refreshToken:{
            type:String
        }
    },{
        timestamps:true
    }
)

userSchema.pre("save",async function(next){
    if (!this.isModified("password")) return next();
        
     this.password= bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect=async function (password) {
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken=function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken=function(){
    
    
    return jwt.sign(
        {
            _id:this._id,
            email:this.email
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESG_TOKEN_EXPIRY
        }
    )
}

export const User =mongoose.model("User",userSchema)