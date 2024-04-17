import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { nanoid } from 'nanoid';

const bookingSchema = new Schema(
    {

        bookNo: {
            type: String,
            required: true,
            default: () => nanoid(7),
            index: { unique: true },
        },
        type: {
            type: String,
            required: true,
            index: true
        },

        activityId: {
            type: Schema.Types.ObjectId,
            ref: "Activities",

        },
        eventId: {
            type: Schema.Types.ObjectId,
            ref: "Event",

        },
        slotId: {
            type: Schema.Types.ObjectId,
           

        },
        packageId: {
            type: Schema.Types.ObjectId,
          

        },
        addonItems: [
            {
                itemId: {
                    type: Schema.Types.ObjectId,
                    ref: "Item",
                    required: true
                },
                type: {
                    type: String,
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true
                },
                rate: {
                    type: Number,
                    required: true
                },
                itemTotal: {
                    type: Number,
                    required: true
                }

            },
        ],
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
        todate: {
            type: Date,
           
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
        bussinessId: {
            type: Schema.Types.ObjectId,
            ref: "Bussiness",
           
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

bookingSchema.plugin(mongooseAggregatePaginate)

export const Booking = mongoose.model("Booking", bookingSchema)