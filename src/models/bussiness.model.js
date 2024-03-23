import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const bussinessSchema = new Schema(
    {
        coverImage: {
            type: String, //cloudinary url
            // required: true
        },
        brandLogo: {
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
            },
            fullAddress: {
                type: String,
            }
        },

        activities: [{
            type: Schema.Types.ObjectId,
            ref: "Activities"
        }],
        amenities: [{
            type: Schema.Types.ObjectId,
            ref: "Domain"
        }],
        bussinessHour: [
            {
               
                title: {
                    type: String,

                },
                days: [],
                startTime: {
                    type: String,
                    required: true,
                },
                endTime: {
                    type: String,
                    required: true,
                },

            }
        ],
        isPublished: {
            type: Boolean,
            default: true
        },
        domain: {
            type: Schema.Types.ObjectId,
            ref: "Domain",
            required: true
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

bussinessSchema.plugin(mongooseAggregatePaginate)

export const Bussiness = mongoose.model("Bussiness", bussinessSchema)