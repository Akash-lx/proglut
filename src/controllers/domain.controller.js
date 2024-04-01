// import mongoose, {isValidObjectId} from "mongoose"
import { Domain } from "../models/domain.model.js"
// import {User} from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import fs from "fs"

const getAllCategory = asyncHandler(async (req, res) => {
    const { limit = 20, pageNumber = 0 } = req.query
    const type = req.path.split("/")[1];
    const result = {};
    const totalPosts = await Domain.countDocuments({type:type}).exec();
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
    result.data = await Domain.find({ type: type })
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

const getActiveCategory = asyncHandler(async (req, res) => {

    const { limit = 200, startIndex = 0 } = req.query
    const type = req.path.split("/")[1];
    const category = await Domain.find({ type: type, status: 'active' })
        .select("-type")
        .sort("-_id")
        .skip(startIndex)
        .limit(limit)
        .exec();

    return res
        .status(200)
        .json(
            new ApiResponse(200, category, `${type} List Fetched successfully`)
        )
})

const addCategory = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    const type = req.path.split("/")[1];
    const imageLocalPath = req.file?.filename
    // console.log(req.body)
    // console.log(req)
    if (!title) {
        return res
            .status(400)
            .json(new ApiError(400, "title is required"))
    }
    if (!imageLocalPath) {
        return res
            .status(400)
            .json(new ApiError(400, "image is missing"))
    }

    const existedDomain = await Domain.findOne({
        type: type,
        title: title
    })

    if (existedDomain) {
        return res
            .status(409)
            .json(new ApiError(409, `${type} with same title already exists`))
        // throw new ApiError(409, "User with email or mobile already exists")
    }

    const domain = await Domain.create({
        title,
        description,
        image: imageLocalPath,
        type: type
    })

    const createdDomain = await Domain.findById(domain._id)

    if (!createdDomain) {
        return res
            .status(500)
            .json(new ApiError(500, `Something went wrong while adding the ${type}`, error))

    }

    return res.status(201).json(
        new ApiResponse(200, createdDomain, `${type} Added Successfully`)
    )

})

const getCategoryById = asyncHandler(async (req, res) => {

    const { Id } = req.query
    const type = req.path.split("/")[1];
    const createdDomain = await Domain.findById(Id)

    if (!createdDomain) {
        return res
            .status(500)
            .json(new ApiError(500, `Something went wrong while fetching ${type}`, error))
    }

    return res.status(201).json(
        new ApiResponse(200, createdDomain, `${type} fetched Successfully`)
    )
})

const updateCategory = asyncHandler(async (req, res) => {
    const { domainId, title, description } = req.body
    const imageLocalPath = req.file?.filename
    const type = req.path.split("/")[1];
    if (!imageLocalPath) {
        return res
            .status(400)
            .json(new ApiError(400, "image is missing"))
    }

    if (!title) {
        fs.unlinkSync(`public/domainImages/${imageLocalPath}`);
        return res
            .status(400)
            .json(new ApiError(400, "title is required"))
    }


    const existedDomain = await Domain.findOne({
        _id: { $ne: domainId },
        type: type,
        title: title
    })

    if (existedDomain) {
        fs.unlinkSync(`public/domainImages/${imageLocalPath}`);
        return res
            .status(409)
            .json(new ApiError(409, `${type} with same title already exists`))
        // throw new ApiError(409, "User with email or mobile already exists")
    }

    const domainImage = await Domain.findById(domainId).select("image");

    if (domainImage.image && domainImage.image != '') {
        fs.unlinkSync(`public/domainImages/${domainImage.image}`);
    }
    const domain = await Domain.findByIdAndUpdate(
        domainId,
        {
            $set: {
                title,
                description,
                image: imageLocalPath,
                type
            }
        },
        { new: true }
    ).select("-type")

    return res
        .status(200)
        .json(
            new ApiResponse(200, domain, `${type} updated successfully`)
        )

})

const updateStatusCategory = asyncHandler(async (req, res) => {
    const { Id, status } = req.query
    const type = req.path.split("/")[1];
    if (!Id || !status) {
        return res
            .status(400)
            .json(new ApiError(400, "Id And Status are required"))
    }

    const domain = await Domain.findByIdAndUpdate(
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
            new ApiResponse(200, domain, `${type} Status updated successfully`)
        )
})

const deleteCategory = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})


export {
    getAllCategory,
    getActiveCategory,
    addCategory,
    getCategoryById,
    updateCategory,
    updateStatusCategory,
    deleteCategory,

}
