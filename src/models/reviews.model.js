import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const reviewSchema = new Schema(
    {
        rating: {
            type: Number,
            required: true
        },
        content: {
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
        }
    },
    {
        timestamps: true
    }
)


reviewSchema.plugin(mongooseAggregatePaginate)

export const Review = mongoose.model("Review", reviewSchema)