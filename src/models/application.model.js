import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const applicationSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        title: {
            type: String,
            trim: true,
        },
        icon: {
            type: String,
        },
        logo: {
            type: String,
        },
        banner: {
            type: String,
        },
        email: {
            type: String,
        },

        mobile: [],
        keywords: {
            type: String,
        },
        description: {
            type: String,
        },
        socialLinks: [],
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
        termsConditions: {
            type: String
        },
        privacyPolicy: {
            type: String
        },
        helpSupport: {
            type: String
        }

    },

    {
        timestamps: true
    }
)

applicationSchema.plugin(mongooseAggregatePaginate)

export const ApplicationSetting = mongoose.model("ApplicationSetting", applicationSchema)