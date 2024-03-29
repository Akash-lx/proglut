import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const eventSchema = new Schema(
    {
        coverImages: [],

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
            },
            fullAddress: {
                type: String,
            }
        },

        entryFee: {
            type: Number,
            required: true,
            index: true
        },
        dateTime: {
            startDate: {
                type: Date,
            },
            endDate: {
                type: Date,
              
            },
            startTime: {
                type: String,
              
            },
            endTime: {
                type: String,
            },
           
        },
        isPublished: {
            type: Boolean,
            default: true
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

eventSchema.plugin(mongooseAggregatePaginate)

export const Event = mongoose.model("Event", eventSchema)