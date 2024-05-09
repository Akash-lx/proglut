import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const couponSchema = new Schema(
    {

        title: {
            type: String,
            required: true,
        },

        code: {
            type: String,
            required: true,
            index: { unique: true },
        },
       
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        disType: {
            type: String,
            enum: ['flat', 'percent'],
            default: "active",
        },
        discount: {
            type: Number,
            required: true,
        },
        minAmt: {
            type: Number,
            required: true,
        },
        isVisible: {
            type: Boolean,
            default:true,
        },
        desc: {
            type: String,
         },

        status: {
            type: String,
            required: true,
            enum: ['active', 'in-active', 'delete'],
            default: "active",
           
        },
        eventId: {
            type: Schema.Types.ObjectId,
            ref: "Event"
        },
        businessId: {
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

couponSchema.plugin(mongooseAggregatePaginate)

export const Coupon = mongoose.model("Coupon", couponSchema)