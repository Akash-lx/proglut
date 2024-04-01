// import mongoose, {isValidObjectId} from "mongoose"
import { Activities } from "../models/activities.model.js"
import { Bussiness } from "../models/bussiness.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import fs from "fs"

const getAllActivity = asyncHandler(async (req, res) => {
    const { limit = 20, pageNumber = 0, bussinessId } = req.query

    if (!bussinessId) {
        return res
            .status(400)
            .json(new ApiError(400, "BussinessId is required"))
    }

    // const type = req.path.split("/")[1];
    const result = {};
    const totalPosts = await Activities.countDocuments({ bussinessId: bussinessId }).exec();
    let startIndex = pageNumber * limit;
    const endIndex = (pageNumber + 1) * limit;
    result.totalPosts = totalPosts;
    if (startIndex > 0) {
        result.previous = {
            pageNumber: pageNumber - 1,
            limit: limit,
        };
    }
    if (endIndex < (totalPosts)) {
        result.next = {
            pageNumber: pageNumber + 1,
            limit: limit,
        };
    }
    result.data = await Activities.find({ bussinessId: bussinessId })
        .sort("-_id")
        .skip(startIndex)
        .limit(limit)
        .exec();
    result.rowsPerPage = limit;
    return res
        .status(200)
        .json(
            new ApiResponse(200, result, `Activities List Fetched successfully`)
        )
})

const getActiveActivity = asyncHandler(async (req, res) => {

    const { limit = 200, startIndex = 0, bussinessId } = req.query

    if (!bussinessId) {
        return res
            .status(400)
            .json(new ApiError(400, "BussinessId is required"))
    }
    const category = await Activities.find({ bussinessId: bussinessId, status: 'active' }).populate({path:"activityId",select:"image title"})
        .select("-type")
        .sort("-_id")
        .skip(startIndex)
        .limit(limit)
        .exec();

    return res
        .status(200)
        .json(
            new ApiResponse(200, category, `Activities List Fetched successfully`)
        )
})

const addActivity = asyncHandler(async (req, res) => {
    const { activityId, bussinessId } = req.body

    if (!activityId || !bussinessId) {
        return res
            .status(400)
            .json(new ApiError(400, "Activity ID and Bussiness Id are required"))
    }
    const itemsmap = [];
    activityId.map((x) => {

        let obj = {};
        obj["activityId"] = x;
        obj["bussinessId"] = bussinessId;
        obj["owner"] = req.vendor._id;
        itemsmap.push(obj)


    })

    // console.log(itemsmap);

    const activity = await Activities.insertMany(itemsmap)

    // if (!activity) {
    //     return res
    //         .status(500)
    //         .json(new ApiError(500, `Something went wrong while adding the Activities`, error))

    // }

    return res.status(201).json(
        new ApiResponse(200, activity, `Activities Added Successfully`)
    )

})

const getActivityById = asyncHandler(async (req, res) => {

    const { Id } = req.query
    const createdActivity = await Activities.findById(Id)

    if (!createdActivity) {
        return res
            .status(500)
            .json(new ApiError(500, `Something went wrong while fetching Activities`, error))
    }

    return res.status(201).json(
        new ApiResponse(200, createdActivity, `Activities fetched Successfully`)
    )
})

// const updateActivity = asyncHandler(async (req, res) => {
//     const { activityId,bussinessId } = req.body

//     if (!activityId && !bussinessId) {
//         return res
//             .status(400)
//             .json(new ApiError(400, "Activity ID and Bussiness Id are required"))
//     }

//     const activity = await Activities.findByIdAndUpdate(
//         Id,
//         {
//             $set: {
//                 title,
//                 description,
//                 image: imageLocalPath,
//                 rate,
//                 stock,

//             }
//         },
//         { new: true }
//     ).select("-type")

//     return res
//         .status(200)
//         .json(
//             new ApiResponse(200, activity, `Activities updated successfully`)
//         )

// })

const updateStatusActivity = asyncHandler(async (req, res) => {
    const { Id, status } = req.query
    if (!Id || !status) {
        return res
            .status(400)
            .json(new ApiError(400, "Id And Status are required"))
    }

    const activity = await Activities.findByIdAndUpdate(
        Id,
        {
            $set: {
                status: status
            }
        },
        { new: true }
    )

    return res
        .status(200)
        .json(
            new ApiResponse(200, activity, `Activities Status updated successfully`)
        )
})

const deleteActivity = asyncHandler(async (req, res) => {
    const { Id } = req.body

    // console.log(Id);

    const activity = await Activities.deleteMany(
        {
            owner: req.vendor._id,
            _id: { $in: Id }
        },
    )

    return res
        .status(200)
        .json(
            new ApiResponse(200, activity, `Activities deleted successfully`)
        )
})

const getActivitySlots = asyncHandler(async (req, res) => {

    const { bussActivityId } = req.query
    const activitySlots = await Activities.findById(bussActivityId).select(' slots')

    if (!activitySlots) {
        return res
            .status(500)
            .json(new ApiError(500, `Something went wrong while fetching slots`, error))
    }

    return res.status(201).json(
        new ApiResponse(200, activitySlots, `Activity slots fetched Successfully`)
    )
})

const addSlot = asyncHandler(async (req, res) => {
    const { title, days, startTime, endTime, maxseat, duration, rate, bussActivityId } = req.body

    if (!days || !bussActivityId || !startTime || !endTime || !maxseat || !rate) {
        return res
            .status(400)
            .json(new ApiError(400, "All fields are required"))
    }

    // const nowdate = new Date;

    const addSlot = await Activities.findByIdAndUpdate(
        bussActivityId,
        {
            $push: {
                slots: {
                    title,
                    days,
                    startTime,
                    endTime,
                    maxseat,
                    duration,
                    rate,
                }
            }

        }, { new: true })

    return res.status(201).json(
        new ApiResponse(200, addSlot, `Activity Slot Added Successfully`)
    )

})

const updateSlot = asyncHandler(async (req, res) => {
    const { Id, title, days, startTime, endTime, maxseat, duration, rate, bussActivityId } = req.body

    if (!Id || !days || !bussActivityId || !startTime || !endTime || !maxseat || !rate) {
        return res
            .status(400)
            .json(new ApiError(400, "All fields are required"))
    }
    const updateSlot = await Activities.updateOne(
        { _id: bussActivityId, 'slots._id': { $eq: Id } },
        {
            $set: {
                "slots.$": {
                    title,
                    days,
                    startTime,
                    endTime,
                    maxseat,
                    duration,
                    rate,
                }
            }

        }, { new: true })

    return res.status(201).json(
        new ApiResponse(200, updateSlot, `Slot detail Updated Successfully`)
    )

})

const deleteSlot = asyncHandler(async (req, res) => {
    const { Id, bussActivityId } = req.body

    if (!Id || !bussActivityId) {
        return res
            .status(400)
            .json(new ApiError(400, "All fields are required"))
    }
    const deleteSlot = await Activities.updateOne(
        { _id: bussActivityId },
        {
            $pull: {
                slots: { _id: Id }
            }

        }, { new: true })

    return res.status(201).json(
        new ApiResponse(200, deleteSlot, `Slot Deleted Successfully`)
    )

})

export {
    getAllActivity,
    getActiveActivity,
    addActivity,
    getActivityById,
    // updateActivity,
    updateStatusActivity,
    deleteActivity,
    getActivitySlots,
    addSlot,
    updateSlot,
    deleteSlot,

}
