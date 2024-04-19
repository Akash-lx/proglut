import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const slotsSchema = new Schema(
    {

        busActId: {
            required: true,
            type: Schema.Types.ObjectId,
            ref: "Activities"
        },
      
        title: {
            type: String,

        },
        days: [],
        fromdate: {
            type: Date,
            required: true,
        },
        todate: {
            type: Date,
            required: true,
        },
        startTime: {
            type: String,
            required: true,
        },
        endTime: {
            type: String,
            required: true,
        },
        maxseat: {
            type: String,
            required: true,
        },
        duration: {
            type: String,
        },
        rate: {
            type: String,
            required: true,
        },

        status: {
            type: String,
            required: true,
            enum: ['active', 'in-active', 'delete'],
            default: "active",
            index: true
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

slotsSchema.plugin(mongooseAggregatePaginate)

export const Slots = mongoose.model("Slots", slotsSchema)