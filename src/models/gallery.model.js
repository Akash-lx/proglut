import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const gallerySchema = new Schema(
    {
        image: {
            type: String, //cloudinary url
            // required: true,
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
            index: true
        },
       
        status: {
            type: String,
            required: true,
            enum:['active','in-active','delete'],
            default: "active",
            index: true
        },
        bussinessId: {
            type: Schema.Types.ObjectId,
            ref: "Bussiness"
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "Vendor"
        }

    },
    {
        timestamps: true
    }
)

gallerySchema.plugin(mongooseAggregatePaginate)

export const Gallery = mongoose.model("Gallery", gallerySchema)