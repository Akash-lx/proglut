import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const activitySchema = new Schema(
    {
              
        activityId: {
            type: Schema.Types.ObjectId,
            ref: "Domain"
        },
        bussinessId: {
            type: Schema.Types.ObjectId,
            ref: "Bussiness"
        },

        eventId: {
            type: Schema.Types.ObjectId,
            ref: "Event"
        },

        title: {
            type: String,
        },
        amount: {
            type: Number,
        },
        forPeople: {
            type: Number,
        },
       
        description: {
            type: String,
        },
       
        status: {
            type: String,
            required: true,
            enum:['active','in-active','delete'],
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

activitySchema.plugin(mongooseAggregatePaginate)

export const Activities = mongoose.model("Activities", activitySchema)