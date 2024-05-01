import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const eventSchema = new Schema(
    {
        uniqCode: {
            type: String,
            required: true,
            index: { unique: true },
        },

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

        rules: [{
            type: String,
        }],
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
        status: {
            type: String,
            enum: ['pending', 'active', 'in-active', 'reject', 'delete'],
            default: 'pending',
            index: true
        },
        amenities: [{
            type: Schema.Types.ObjectId,
            ref: "Domain"
        }],
        bussinessId: {
            type: Schema.Types.ObjectId,
            ref: "Bussiness"
        },
        hostName: {
            type: String,

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