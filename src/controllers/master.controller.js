// import mongoose, {isValidObjectId} from "mongoose"
import { Master } from "../models/master.model.js"
import { ApplicationSetting } from "../models/application.model.js"
// import {User} from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
// import fs from "fs"

const getAllMaster = asyncHandler(async (req, res) => {
    const { limit = 20, pageNumber = 0 } = req.body
    const type = req.path.split("/")[1];
    const result = {};
    const totalPosts = await Master.countDocuments({ type: type }).exec();
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
    result.data = await Master.find({ type: type })
        .sort("-_id")
        .skip(startIndex)
        .limit(limit)
        .exec();
    result.rowsPerPage = limit;
    return res
        .status(200)
        .json(
            new ApiResponse(200, result, `${type} List Fetched successfully`)
        )
})

const getActiveMaster = asyncHandler(async (req, res) => {

    const { limit = 200, startIndex = 0 } = req.body
    const type = req.path.split("/")[1];
    const master = await Master.find({ type: type, status: 'active' })
        .select("-type")
        .sort("-_id")
        .skip(startIndex)
        .limit(limit)
        .exec();

    return res
        .status(200)
        .json(
            new ApiResponse(200, master, `${type} List Fetched successfully`)
        )
})

const addMaster = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    const type = req.path.split("/")[1];

    if (!title) {
        return res
            .status(400)
            .json(new ApiError(400, "title is required"))
    }

    const existedMaster = await Master.findOne({
        type: type,
        title: title
    })

    if (existedMaster) {
        return res
            .status(409)
            .json(new ApiError(409, `${type} with same title already exists`))
        // throw new ApiError(409, "User with email or mobile already exists")
    }

    const master = await Master.create({
        title,
        description,
        type: type
    })

    const createdMaster = await Master.findById(master._id)

    if (!createdMaster) {
        return res
            .status(500)
            .json(new ApiError(500, `Something went wrong while adding the ${type}`, error))

    }

    return res.status(201).json(
        new ApiResponse(200, createdMaster, `${type} Added Successfully`)
    )

})

const getMasterById = asyncHandler(async (req, res) => {

    const { Id } = req.query
    const type = req.path.split("/")[1];
    const createdMaster = await Master.findById(Id)

    if (!createdMaster) {
        return res
            .status(500)
            .json(new ApiError(500, `Something went wrong while fetching ${type}`, error))
    }

    return res.status(201).json(
        new ApiResponse(200, createdMaster, `${type} fetched Successfully`)
    )
})

const updateMaster = asyncHandler(async (req, res) => {
    const { Id, title, description } = req.body
    const type = req.path.split("/")[1];


    if (!title) {
        return res
            .status(400)
            .json(new ApiError(400, "title is required"))
    }


    const existedMaster = await Master.findOne({
        _id: { $ne: Id },
        type: type,
        title: title
    })

    if (existedMaster) {
        return res
            .status(409)
            .json(new ApiError(409, `${type} with same title already exists`))
        // throw new ApiError(409, "User with email or mobile already exists")
    }

    const master = await Master.findByIdAndUpdate(
        Id,
        {
            $set: {
                title,
                description,
                type
            }
        },
        { new: true }
    ).select("-type")

    return res
        .status(200)
        .json(
            new ApiResponse(200, master, `${type} updated successfully`)
        )

})

const updateStatusMaster = asyncHandler(async (req, res) => {
    const { Id, status } = req.query
    const type = req.path.split("/")[1];
    if (!Id || !status) {
        return res
            .status(400)
            .json(new ApiError(400, "Id And Status are required"))
    }

    const master = await Master.findByIdAndUpdate(
        Id,
        {
            $set: {
                status: status
            }
        },
        { new: true }
    ).select("-type")

    return res
        .status(200)
        .json(
            new ApiResponse(200, master, `${type} Status updated successfully`)
        )
})

const deleteMaster = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})


const updateApplicationSetting = asyncHandler(async (req, res) => {
    const {Id, name, title, email, mobile, city, state, street, area, pincode, latitude, longitude } = req.body
    // const usertype = req.path.split("/")[1];
    // if (!fullName || !gender) {
    //     return res
    //         .status(400)
    //         .json(new ApiError(400, "FullName And Gender are required"))
    //     // throw new ApiError(400, "")
    // }

    const application = await ApplicationSetting.findByIdAndUpdate(
       Id,
        {
            $set: {
                name,
                title,
                address: {
                    city,
                    state,
                    street,
                    area,
                    pincode,
                    latitude,
                    longitude
                },
                mobile,
                email,
            }
        },
        { new: true }

    )
    

    return res
        .status(200)
        .json(new ApiResponse(200, application, `Application details updated successfully`))
});

export {
    getAllMaster,
    getActiveMaster,
    addMaster,
    getMasterById,
    updateMaster,
    updateStatusMaster,
    deleteMaster,
    updateApplicationSetting,
}
