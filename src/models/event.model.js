import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const eventSchema = new Schema(
    {
        coverImage: {
            type: String, //cloudinary url
            // required: true
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
        address:
        {
            city: {
                type: String,
            },
            state: {
                type: String,
              
            },
            street: {
                type: String,
              
            },
            area: {
                type: String,
            },
            pincode: {
                type: Number,
            },
            latitude: {
                type: String,
            },
            longitude: {
                type: String,
            }
        },

        entryFee: {
            type: Number,
            required: true,
            index: true
        },
        dateTime: {
            type: Object,
            index: true,
        },
        isPublished: {
            type: Boolean,
            default: true
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

eventSchema.plugin(mongooseAggregatePaginate)

export const Event = mongoose.model("Event", eventSchema)