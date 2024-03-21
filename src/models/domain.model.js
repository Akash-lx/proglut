import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const domainSchema = new Schema(
    {
        image: {
            type: String, //cloudinary url
            required: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        description: {
            type: String,
            // required: true
        },
       
        type: {
            type: String,
            required: true,
            enum:['category','activity','aminities'],
            index: true
        },
       
        status: {
            type: String,
            required: true,
            enum:['active','in-active','delete'],
            default: "active",
            index: true
        },
       
    },
    {
        timestamps: true
    }
)

domainSchema.plugin(mongooseAggregatePaginate)

export const Domain = mongoose.model("Domain", domainSchema)