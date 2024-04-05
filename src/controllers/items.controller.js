// import mongoose, {isValidObjectId} from "mongoose"
import { Item } from "../models/items.model.js"
// import {User} from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import fs from "fs"

const getAllItem = asyncHandler(async (req, res) => {
    const { limit = 20, pageNumber = 0, bussinessId } = req.query

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
    try {
        const { limit = 200, startIndex = 0, bussinessId } = req.query

        if (!bussinessId) {
            throw new ApiError(400, `BussinessId is required`)
        }
        const type = req.path.split("/")[1];
        const category = await Item.find({ bussinessId: bussinessId, type: type, status: 'active' })
            .select("-type")
            .sort("-_id")
            .skip(startIndex)
            .limit(limit)
            .exec();
        if (!category) {
            throw new ApiError(500, `Something went wrong while fetching ${type}`)
        }
        return res
            .status(200)
            .json(
                new ApiResponse(200, category, `${type} List Fetched successfully`)
            )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Items`))
    }
})

const addItem = asyncHandler(async (req, res) => {
    try {
        const { bussinessId, title, description, rate, stock, unitId } = req.body
        const type = req.path.split("/")[1];
        const imageLocalPath = req.file?.filename

        if (!bussinessId) {
            throw new ApiError(400, `BussinessId is required`)
        }

        if (!title || !rate) {
            throw new ApiError(400, `Title and Rate are required`)
        }

        if (!imageLocalPath) {
            throw new ApiError(400, `image is required`)
        }

        const item = await Item.create({
            title,
            description,
            image: imageLocalPath,
            type: type,
            bussinessId,
            rate,
            stock,
            unit: unitId,
            owner: req.vendor._id,
        })

        const createdItem = await Item.findById(item._id)

        if (!createdItem) {
            throw new ApiError(500, `Something went wrong while Adding ${type}`)
        }

        return res.status(201).json(
            new ApiResponse(200, createdItem, `${type} Added Successfully`)
        )

    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Items`))
    }
})

const getItemById = asyncHandler(async (req, res) => {
    try {

        const { Id } = req.query
        const type = req.path.split("/")[1];
        const createdItem = await Item.findById(Id)

        if (!createdItem) {
            throw new ApiError(500, `Something went wrong while fetching ${type}`)
        }

        return res.status(201).json(
            new ApiResponse(200, createdItem, `${type} fetched Successfully`)
        )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Items`))
    }
})

const updateItem = asyncHandler(async (req, res) => {
    try {
        const { Id, title, description, rate, stock, unitId } = req.body
        const image = req.file?.filename
        const type = req.path.split("/")[1];
    
        if(!Id){
            image !='' && image != undefined ? fs.unlinkSync(`public/itemImages/${image}`) : null;
            throw new ApiError(400, `Id is required`)
        }
       
        if (!title || !rate) {
            image !='' && image != undefined ? fs.unlinkSync(`public/itemImages/${image}`) : null;
            throw new ApiError(400, `Title and rate are required`)
        }
    
        const itemImage = await Item.findById(Id).select("image");
    
        if (image !='' && image != undefined && itemImage.image || itemImage.image != '') {
            fs.unlinkSync(`public/itemImages/${itemImage.image}`);
        }
        
        const item = await Item.findByIdAndUpdate(
            Id,
            {
                $set: {
                    title,
                    description,
                    image,
                    type,
                    rate,
                    stock,
                    unit: unitId
                }
            },
            { new: true }
        ).select("-type")
    
        if (!item) {
            throw new ApiError(500, `Something went wrong while update ${type}`)
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, item, `${type} updated successfully`)
            )
    
    } catch (error) {
        return res
        .status(error.statusCode || 500)
        .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Items`))
    }
})

const updateStatusItem = asyncHandler(async (req, res) => {
   try {
     const { Id, status } = req.query
     const type = req.path.split("/")[1];
     if (!Id || !status) {
        throw new ApiError(400, `Id and status are required`)
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
 
     if (!item) {
        throw new ApiError(500, `Something went wrong while update status ${type}`)
    }

     return res
         .status(200)
         .json(
             new ApiResponse(200, item, `${type} Status updated successfully`)
         )
   } catch (error) {
    return res
    .status(error.statusCode || 500)
    .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Items`))
   }
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
