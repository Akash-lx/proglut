import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const notificationSchema = new Schema(
    {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        logo: {
            type: String,
       },
        bussinessId: {
            type: Schema.Types.ObjectId,
            ref: "Bussiness"
        },
        eventId: {
            type: Schema.Types.ObjectId,
            ref: "Event"
        },
        from: {
            type: Schema.Types.ObjectId,
            ref: "Vendor"
        },
        to: {
            type: Schema.Types.ObjectId,
            ref: "Vendor"
        },
        status: {
            type: Number,
            required: true,
            enum:[0,1],
            default: 0,
           
        },
    },
    {
        timestamps: true
    }
)


notificationSchema.plugin(mongooseAggregatePaginate)

export const Notification = mongoose.model("Notification", notificationSchema)