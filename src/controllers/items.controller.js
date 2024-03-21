// import mongoose, {isValidObjectId} from "mongoose"
import { Item } from "../models/items.model.js"
// import {User} from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import fs from "fs"

const getAllItem = asyncHandler(async (req, res) => {
    const { limit = 20, pageNumber = 0, bussinessId } = req.body

    if (!bussinessId) {
        return res
            .status(400)
            .json(new ApiError(400, "BussinessId is required"))
    }

    const type = req.path.split("/")[1];
    const result = {};
    const totalPosts = await Item.countDocuments({ bussinessId: bussinessId, type: type }).exec();
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
    result.data = await Item.find({ bussinessId: bussinessId, type: type })
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

const getActiveItem = asyncHandler(async (req, res) => {

    const { limit = 200, startIndex = 0, bussinessId } = req.body

    if (!bussinessId) {
        return res
            .status(400)
            .json(new ApiError(400, "BussinessId is required"))
    }
    const type = req.path.split("/")[1];
    const category = await Item.find({ bussinessId: bussinessId, type: type, status: 'active' })
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

const addItem = asyncHandler(async (req, res) => {
    const { bussinessId, title, description, rate, stock } = req.body
    const type = req.path.split("/")[1];
    const imageLocalPath = req.file?.filename

    if (!title && !rate) {
        return res
            .status(400)
            .json(new ApiError(400, "Title and Rate are required"))
    }

    if (!imageLocalPath) {
        return res
            .status(400)
            .json(new ApiError(400, "image is missing"))
    }

    const item = await Item.create({
        title,
        description,
        image: imageLocalPath,
        type: type,
        bussinessId,
        rate,
        stock,
        owner: req.vendor._id,
    })

    const createdItem = await Item.findById(item._id)

    if (!createdItem) {
        return res
            .status(500)
            .json(new ApiError(500, `Something went wrong while adding the ${type}`, error))

    }

    return res.status(201).json(
        new ApiResponse(200, createdItem, `${type} Added Successfully`)
    )

})

const getItemById = asyncHandler(async (req, res) => {

    const { Id } = req.query
    const type = req.path.split("/")[1];
    const createdItem = await Item.findById(Id)

    if (!createdItem) {
        return res
            .status(500)
            .json(new ApiError(500, `Something went wrong while fetching ${type}`, error))
    }

    return res.status(201).json(
        new ApiResponse(200, createdItem, `${type} fetched Successfully`)
    )
})

const updateItem = asyncHandler(async (req, res) => {
    const { Id, title, description, rate, stock } = req.body
    const imageLocalPath = req.file?.filename
    const type = req.path.split("/")[1];


    if (!title && !rate) {
        return res
            .status(400)
            .json(new ApiError(400, "Title and Rate are required"))
    }

    if (!imageLocalPath) {
        return res
            .status(400)
            .json(new ApiError(400, "image is missing"))
    }

    const itemImage = await Item.findById(Id).select("image");

    if (itemImage.image && itemImage.image != '') {
        fs.unlinkSync(`public/itemImages/${itemImage.image}`);
    }




    const item = await Item.findByIdAndUpdate(
        Id,
        {
            $set: {
                title,
                description,
                image: imageLocalPath,
                type,
                rate,
                stock,
               
            }
        },
        { new: true }
    ).select("-type")

    return res
        .status(200)
        .json(
            new ApiResponse(200, item, `${type} updated successfully`)
        )

})

const updateStatusItem = asyncHandler(async (req, res) => {
    const { Id, status } = req.query
    const type = req.path.split("/")[1];
    if (!Id && !status) {
        return res
            .status(400)
            .json(new ApiError(400, "Id And Status are required"))
    }

    const item = await Item.findByIdAndUpdate(
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
            new ApiResponse(200, item, `${type} Status updated successfully`)
        )
})

const deleteItem = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})


export {
    getAllItem,
    getActiveItem,
    addItem,
    getItemById,
    updateItem,
    updateStatusItem,
    deleteItem,

}
