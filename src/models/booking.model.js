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

        activities: [
            {
                activityId: {
                    type: Schema.Types.ObjectId,
                    ref: "Activities",
                    required: true
                },
                slotId: {
                    type: Schema.Types.ObjectId,
                    ref: "Slots",
                    required: true
                },

                date: {
                    type: Date,
                    required: true
                },

                person: {
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
                },
                status: {
                    type: String,
                    required: true,
                    enum: ['completed', 'running', 'expired'],
                    default: "running",
                },
            },
        ],

        addonItems: [
            {
                itemId: {
                    type: Schema.Types.ObjectId,
                    ref: "Item",
                    required: true
                },
                type: {
                    type: String,
                   default:"item"
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
                },
                status: {
                    type: String,
                    required: true,
                    enum: ['active', 'delivered'],
                    default: "active",
                },
            },
        ],
        addonFoods: [
            {
                itemId: {
                    type: Schema.Types.ObjectId,
                    ref: "Item",
                    required: true
                },
                type: {
                    type: String,
                    default:"food"
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
                },
                status: {
                    type: String,
                    required: true,
                    enum: ['active', 'delivered'],
                    default: "active",
                },
            },
        ],

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