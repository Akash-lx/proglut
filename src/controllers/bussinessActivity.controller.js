import mongoose, { isValidObjectId } from "mongoose"
import { Activities } from "../models/activities.model.js"
import { Slots } from "../models/slots.model.js"
// import { Bussiness } from "../models/bussiness.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import fs from "fs"

const getAllActivity = asyncHandler(async (req, res) => {
    try {
        const { limit = 200, startIndex = 0, bussinessId, status } = req.query

        if (!bussinessId) {
            throw new ApiError(400, `BussinessId is required`)
        }

        const query = {}
        query["bussinessId"] = new mongoose.Types.ObjectId(bussinessId);
        if (status && status != undefined) { query["status"] = status } else { query["status"] = { $ne: "delete" } };

        const category = await Activities.find(query)
            .populate({ path: "activityId", select: "image title" })
            .select("-type")
            .sort("-_id")
            .skip(startIndex)
            .limit(limit)
            .exec();

        if (!category) {
            throw new ApiError(500, `Something went wrong while fetching Activities list`)
        } else if (category.length == 0) {
            throw new ApiError(404, `Data Not Found ! Activitiy list is empty`)

        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, category, `Activities List Fetched successfully`)
            )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in Bussiness Activity'))
    }
})

const getActiveActivity = asyncHandler(async (req, res) => {

    try {
        const { limit = 200, startIndex = 0, bussinessId } = req.query

        if (!bussinessId) {
            throw new ApiError(400, `BussinessId is required`)
        }

        const category = await Activities.aggregate([
            {
                $match: {
                    bussinessId: new mongoose.Types.ObjectId(bussinessId),
                    status: 'active'
                }
            },

            {
                $lookup: {
                    from: "domains",
                    localField: "activityId",
                    foreignField: "_id",
                    as: "activityId",
                    pipeline: [{
                        $project: {
                            title: 1,

                        }
                    }
                    ]
                },
            },

            {
                $lookup: {
                    from: "slots",
                    localField: "_id",
                    foreignField: "busActId",
                    as: "slots",
                    pipeline: [
                        {
                            $project: {
                                title: 1,
                                days: 1,
                                fromdate: 1,
                                todate: 1,
                                startTime: 1,
                                endTime: 1,
                                rate: 1,
                                status: 1,
                            }
                        }
                    ]
                },
            },

            {
                $addFields: {

                    activityId: { $first: "$activityId" },


                }
            }, {
                $project: {
                    activityId: 1,
                    slots: 1,
                    bussinessId: 1,
                    status: 1,
                    owner: 1,
                    createdAt: 1,
                }
            },
            { $sort: { _id: -1 } },
            { $skip: parseInt(startIndex) },
            { $limit: parseInt(limit) },
        ])
        // const category = await Activities.find({ bussinessId: bussinessId, status: 'active' })
        //     .populate({ path: "activityId", select: "image title" })
        //     .select("-type")
        //     .sort("-_id")
        //     .skip(startIndex)
        //     .limit(limit)
        //     .exec();

        if (!category) {
            throw new ApiError(500, `Something went wrong while fetching Activities list`)
        } else if (category.length == 0) {
            throw new ApiError(404, `Data Not Found ! Activitiy list is empty`)

        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, category, `Activities List Fetched successfully`)
            )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in Bussiness Activity'))
    }
})

const addActivity = asyncHandler(async (req, res) => {
    try {
        const { activityId, bussinessId } = req.body

        if (!activityId || !bussinessId) {
            throw new ApiError(400, `ActivityId BussinessId are required`)
        }
        const itemsmap = [];
        await activityId.map(async (x) => {

            let obj = {};
            obj["activityId"] = x;
            obj["bussinessId"] = bussinessId;
            obj["owner"] = req.vendor._id;

            const checkActivity = await Activities.findOne(obj).select('_id');

            if (!checkActivity) {
                const activity = await Activities.create(obj)

                if (!activity) {
                    throw new ApiError(500, `Something went wrong while Add Activities list`)
                }

                itemsmap.push(activity)
            }
        })

        return res.status(201).json(
            new ApiResponse(200, itemsmap, `Activities Added Successfully`)
        )

    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in add activities'))
    }
})

const getActivityById = asyncHandler(async (req, res) => {

    try {
        const { Id } = req.query
        const createdActivity = await Activities.findById(Id)

        if (!createdActivity) {
            if (!addBussinessHour) {
                throw new ApiError(500, `Something went wrong while fetching Activities`)
            }
        }

        return res.status(201).json(
            new ApiResponse(200, createdActivity, `Activities fetched Successfully`)
        )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in Activities'))
    }
})

const deleteBussinessActivity = asyncHandler(async (req, res) => {
    try {
        const { bussActivityId } = req.query

        if (!bussActivityId) {
            throw new ApiError(400, `Bussiness Activity is required`)
        }
        const deleteSlot = await Activities.findByIdAndDelete(bussActivityId)

        if (!deleteSlot) {
            throw new ApiError(500, `Something went wrong while delete Business Activity`)
        }

        return res.status(201).json(
            new ApiResponse(200, deleteSlot, `Business Activity Deleted Successfully`)
        )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in delete Business Activity'))
    }

})

const getActivitySlots = asyncHandler(async (req, res) => {
    try {
        const { day, bussActivityId } = req.query

        if (!bussActivityId) {
            throw new ApiError(400, `BussActivityId is required`)
        }

        const query = {}
        query['busActId'] = new mongoose.Types.ObjectId(bussActivityId)
        if (day && day != undefined) { query["days"] = day };

        const slotlist = await Slots.find(query)

        if (slotlist.length == 0) {
            throw new ApiError(404, `Data Not Found ! list is empty`)
        }


        return res.status(201).json(
            new ApiResponse(200, slotlist, `Slots List Fetch Successfully`)
        )

    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in Activity Slot'))
    }
})


const addSlot = asyncHandler(async (req, res) => {
    try {
        const { title, days, startTime, endTime, maxseat, duration, rate, fromdate, todate, bussActivityId } = req.body

        if (!days || !bussActivityId || !startTime || !endTime || !maxseat || !rate || !fromdate || !todate) {
            throw new ApiError(400, `All fileds are required`)
        }

        const existedDomain = await Activities.findOne({
            status: { $ne: "delete" },
            days,
            startTime,
            endTime,
            fromdate,
            todate,
        })

        if (existedDomain) {
            throw new ApiError(409, `Package with same title , Amount,forpeople and event already exists`)
        }

        const addSlot = await Slots.create(
            {
                title,
                days,
                fromdate,
                todate,
                startTime,
                endTime,
                maxseat,
                duration,
                rate,
                busActId: bussActivityId,
                owner: req.vendor._id,
            })

        if (!addSlot) {
            throw new ApiError(500, `Something went wrong while add slot`)
        }

        return res.status(201).json(
            new ApiResponse(200, addSlot, `Activity Slot Added Successfully`)
        )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in add Activity Slot'))
    }

})

const updateSlot = asyncHandler(async (req, res) => {
    try {
        const { Id, title, days, startTime, endTime, maxseat, duration, rate, fromdate, todate } = req.body

        if (!Id || !days || !startTime || !endTime || !maxseat || !rate || !fromdate || !todate) {
            throw new ApiError(400, `All fileds are required`)
        }

        const existedDomain = await Activities.findOne({
            _id: { $ne: Id },
            status: { $ne: "delete" },
            days,
            startTime,
            endTime,
            fromdate,
            todate,
        })

        if (existedDomain) {
            throw new ApiError(409, `Package with same title , Amount,forpeople and event already exists`)
        }

        const updateSlot = await Slots.findByIdAndUpdate(
            Id,
            {
                $set: {
                    title,
                    days,
                    fromdate,
                    todate,
                    startTime,
                    endTime,
                    maxseat,
                    duration,
                    rate,

                }

            }, { new: true })

        if (!updateSlot) {
            throw new ApiError(500, `Something went wrong while update Slot`)
        }

        return res.status(201).json(
            new ApiResponse(200, updateSlot, `Slot detail Updated Successfully`)
        )

    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in update SLot'))
    }
})

const updateSlotStatus = asyncHandler(async (req, res) => {
    try {
        const { Id, status } = req.query

        if (!Id || !status) {
            throw new ApiError(400, `All fileds are required`)
        }
        const deleteSlot = await Slots.findByIdAndUpdate(
            Id,
            {
                $set: {
                    status
                }

            }, { new: true })

        if (!deleteSlot) {
            throw new ApiError(500, `Something went wrong while delete Slot`)
        }

        return res.status(201).json(
            new ApiResponse(200, deleteSlot, `Slot Status Updated Successfully`)
        )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in delete Slot'))
    }

})

export {
    getAllActivity,
    getActiveActivity,
    addActivity,
    getActivityById,
    deleteBussinessActivity,
    getActivitySlots,
    addSlot,
    updateSlot,
    updateSlotStatus,

}
