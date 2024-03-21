import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const itemSchema = new Schema(
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
        rate: {
            type: Number,
            required: true,
        },
        stock: {
            type: Number,
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
            enum: ['active', 'in-active', 'delete'],
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

itemSchema.plugin(mongooseAggregatePaginate)

export const Item = mongoose.model("Item", itemSchema)