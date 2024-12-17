import mongoose,{Schema} from "mongoose";
import mongooseAggregatepaginate from "mongoose-aggregate-paginate-v2"

const vedioSchema=new Schema({
    vedioFile:{
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

vedioSchema.plugin(mongooseAggregatepaginate)

export const Vedio=mongoose.model("Vedio",vedioSchema)