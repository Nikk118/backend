import mongoose,{Schema} from "mongoose";
import mongooseAggregatepaginate from "mongoose-aggregate-paginate-v2"

const videoSchema=new Schema({
    videoFile:{
        type:String,
        require:true
    },
    thumbNail:{
        type:String,
        require:true
    },
    title:{
        type:String,
        require:true
    },
    description:{
        type:String,
        require:true
    },
    duration:{
        type:Number,
        require:true
    },
    isPublic:{
        type:Boolean,
        require:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }

},{timestamps:true})

videoSchema.plugin(mongooseAggregatepaginate)

export const Video=mongoose.model("Vedio",videoSchema)