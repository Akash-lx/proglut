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
        slots: [ {
               
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

        }],
        // foods: [{
        //     type: Schema.Types.ObjectId,
        //     ref: "Item"
        // }],
        // seat: {
        //     type: Number,
        //     required: true
        // },
       
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