import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { nanoid } from 'nanoid';

const eventBookingSchema = new Schema(
    {

        bookNo: {
            type: String,
            required: true,
            default: () => nanoid(7),
            index: { unique: true },
        },
       
        eventId: {
            type: Schema.Types.ObjectId,
            ref: "Event",

        },
       
        packageId: {
            type: Schema.Types.ObjectId,
            ref: "Activities",

        },
    
        price: {
            type: Number,
            required: true
        },
        person: {
            type: Number,
            required: true
        },
        fromdate: {
            type: Date,
            required: true
        },
       
        totalPayable: {
            type: Number,
            required: true
        },
        isPaid: {
            type: Boolean,
            default: false
        },
        paidAmount: {
            type: Number,

        },
        transactionId: {
            type: String,

        },
      
        owner: {
            type: Schema.Types.ObjectId,
            ref: "Vendor"
        },
        status: {
            type: String,
            required: true,
            enum: ['active', 'expired', 'canceled'],
            default: "active",
            index: true
        },

    },
    {
        timestamps: true
    }
)

eventBookingSchema.plugin(mongooseAggregatePaginate)

export const EventBooking = mongoose.model("EventBooking", eventBookingSchema)