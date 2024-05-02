import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const complaintSchema = new Schema(
    {
        complaintNo: {
            type: String,
            required: true,
            index: { unique: true },
        },
        description: {
            type: String,
            required: true
        },
        bussinessId: {
            type: Schema.Types.ObjectId,
            ref: "Bussiness"
        },
        eventId: {
            type: Schema.Types.ObjectId,
            ref: "Event"
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "Vendor"
        },
        status: {
            type: String,
            required: true,
            enum:['active','solved','viewed','invaild'],
            default: "active",
           
        },
    },
    {
        timestamps: true
    }
)


complaintSchema.plugin(mongooseAggregatePaginate)

export const Complaint = mongoose.model("Complaint", complaintSchema)