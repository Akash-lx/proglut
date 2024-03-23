import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const masterSchema = new Schema(
    {
       
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
            enum:['unit'],
            default: "unit",
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

masterSchema.plugin(mongooseAggregatePaginate)

export const Master = mongoose.model("Master", masterSchema)