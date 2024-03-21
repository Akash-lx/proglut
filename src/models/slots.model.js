import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const slotSchema = new Schema(
    {
       
        seat: {
            type: Number,
            required: true,
            index: true
        },
        rate: {
            type: Number,
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
        days: [],
       
        status: {
            type: Number,
            required: true,
            enum: ['active', 'in-active', 'delete'],
            default: "active",
            index: true
        },
       
        bussinessId: {
            type: Schema.Types.ObjectId,
            ref: "Bussiness"
        },
        activityId: {
            type: Schema.Types.ObjectId,
            ref: "Activities"
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

slotSchema.plugin(mongooseAggregatePaginate)

export const Slot = mongoose.model("Slot", slotSchema)