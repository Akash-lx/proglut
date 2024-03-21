import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const bookingSchema = new Schema(
    {

        bookNo: {
            type: Number,
            required: true,
            trim: true,
            index: true
        },
       type: {
            type: Number,
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
            ref: "Slot",
          
        },
        addonItems: [
            {
                itemId: {
                    type: Schema.Types.ObjectId,
                    ref: "Item",
                    required: true
                },
                type: {
                    type: Number,
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
        bussinessId: {
            type: Schema.Types.ObjectId,
            ref: "Bussiness",
            required: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
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