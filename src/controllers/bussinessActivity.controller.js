import mongoose, { isValidObjectId } from "mongoose"
import { Activities } from "../models/activities.model.js"
// import { Bussiness } from "../models/bussiness.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import fs from "fs"

const getAllActivity = asyncHandler(async (req, res) => {
    try {
        const { limit = 200, startIndex = 0, bussinessId ,status} = req.query

        if (!bussinessId) {
            throw new ApiError(400, `BussinessId is required`)
        }

        const query = {}
         query["bussinessId"] = new mongoose.Types.ObjectId(bussinessId);
        if (status && status != undefined) { query["status"] = status }else { query["status"] = {$ne:"delete"}};

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
        const category = await Activities.find({ bussinessId: bussinessId, status: 'active' })
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

const addActivity = asyncHandler(async (req, res) => {
    try {
        const { activityId, bussinessId } = req.body

        if (!activityId || !bussinessId) {
            throw new ApiError(400, `ActivityId BussinessId are required`)
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

        if (!activity) {
            throw new ApiError(500, `Something went wrong while Add Activities list`)
        }

        return res.status(201).json(
            new ApiResponse(200, activity, `Activities Added Successfully`)
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


const getActivitySlots = asyncHandler(async (req, res) => {
    try {
        const { day, bussActivityId } = req.query

        if (!bussActivityId) {
            throw new ApiError(400, `BussActivityId is required`)
        }

        const query = {}
        query['_id'] = new mongoose.Types.ObjectId(bussActivityId)
        if (day && day != undefined) { query["slots.days"] = day };

        const slotlist = await Activities.aggregate([
            {
                $unwind: "$slots"
            },
            {
                $match: query
            },
            {
                $group: {
                    _id: "$slots",
                }
            }
        ])

        const slotdata = []
        slotlist.forEach((element) => {
            slotdata.push(element._id);
        })

        if (slotdata.length == 0) {
            throw new ApiError(404, `Data Not Found ! list is empty`)
        }


        return res.status(201).json(
            new ApiResponse(200, slotdata, `Slots List Fetch Successfully`)
        )

    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in Activity Slot'))
    }
})


const addSlot = asyncHandler(async (req, res) => {
   try {
     const { title, days, startTime, endTime, maxseat, duration, rate, bussActivityId } = req.body
 
     if (!days || !bussActivityId || !startTime || !endTime || !maxseat || !rate) {
        throw new ApiError(400, `All fileds are required`)
     }
 
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
        const { Id, title, days, startTime, endTime, maxseat, duration, rate, bussActivityId } = req.body
    
        if (!Id || !days || !bussActivityId || !startTime || !endTime || !maxseat || !rate) {
            throw new ApiError(400, `All fileds are required`)
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

const deleteSlot = asyncHandler(async (req, res) => {
    try {
        const { Id, bussActivityId } = req.body
    
        if (!Id || !bussActivityId) {
            throw new ApiError(400, `All fileds are required`)
        }
        const deleteSlot = await Activities.updateOne(
            { _id: bussActivityId },
            {
                $pull: {
                    slots: { _id: Id }
                }
    
            }, { new: true })
    
            if (!deleteSlot) {
                throw new ApiError(500, `Something went wrong while delete Slot`)
            }

        return res.status(201).json(
            new ApiResponse(200, deleteSlot, `Slot Deleted Successfully`)
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

    getActivitySlots,
    addSlot,
    updateSlot,
    deleteSlot,

}
