// import mongoose, {isValidObjectId} from "mongoose"
import { Gallery } from "../models/gallery.model.js"
// import {User} from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import fs from "fs"

const getAllGallery = asyncHandler(async (req, res) => {
    const { limit = 20, pageNumber = 0 ,bussinessId} = req.body

    if (!bussinessId) {
        return res
            .status(400)
            .json(new ApiError(400, "BussinessId is required"))
    }

    const type = req.path.split("/")[1];
    const result = {};
    const totalPosts = await Gallery.countDocuments({bussinessId:bussinessId,type:type}).exec();
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
    result.data = await Gallery.find({bussinessId:bussinessId, type: type })
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

const getActiveGallery = asyncHandler(async (req, res) => {

    const { limit = 200, startIndex = 0 ,bussinessId} = req.body

    if (!bussinessId) {
        return res
            .status(400)
            .json(new ApiError(400, "BussinessId is required"))
    }
    const type = req.path.split("/")[1];
    const category = await Gallery.find({bussinessId:bussinessId, type: type, status: 'active' })
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

const addGallery = asyncHandler(async (req, res) => {
    const { bussinessId, title, description } = req.body
    const type = req.path.split("/")[1];
    const imageLocalPath = req.file?.filename
    // console.log(req.body)
    // console.log(req)
    if(type == 'rules'){
        if (!title) {
            return res
                .status(400)
                .json(new ApiError(400, "title is required"))
        }
    } else if(type == 'gallery'){
        if (!imageLocalPath) {
            return res
                .status(400)
                .json(new ApiError(400, "image is missing"))
        }
    }
    
  
    const gallery = await Gallery.create({
        title,
        description,
        image: imageLocalPath,
        type: type,
        bussinessId,
        owner: req.vendor._id,
    })

    const createdGallery = await Gallery.findById(gallery._id)

    if (!createdGallery) {
        return res
            .status(500)
            .json(new ApiError(500, `Something went wrong while adding the ${type}`, error))

    }

    return res.status(201).json(
        new ApiResponse(200, createdGallery, `${type} Added Successfully`)
    )

})

const getGalleryById = asyncHandler(async (req, res) => {

    const { Id } = req.query
    const type = req.path.split("/")[1];
    const createdGallery = await Gallery.findById(Id)

    if (!createdGallery) {
        return res
            .status(500)
            .json(new ApiError(500, `Something went wrong while fetching ${type}`, error))
    }

    return res.status(201).json(
        new ApiResponse(200, createdGallery, `${type} fetched Successfully`)
    )
})

const updateGallery = asyncHandler(async (req, res) => {
    const { Id, title, description } = req.body
    const imageLocalPath = req.file?.filename
    const type = req.path.split("/")[1];

    if(type == 'rules'){
        if (!title) {
            return res
                .status(400)
                .json(new ApiError(400, "title is required"))
        }
    } else if(type == 'gallery'){
        if (!imageLocalPath) {
            return res
                .status(400)
                .json(new ApiError(400, "image is missing"))
        }

        const galleryImage = await Gallery.findById(Id).select("image");

        if (galleryImage.image && galleryImage.image != '') {
            fs.unlinkSync(`public/galleryImages/${galleryImage.image}`);
        }

    }

   
    const gallery = await Gallery.findByIdAndUpdate(
        Id,
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
            new ApiResponse(200, gallery, `${type} updated successfully`)
        )

})

const updateStatusGallery = asyncHandler(async (req, res) => {
    const { Id, status } = req.query
    const type = req.path.split("/")[1];
    if (!Id || !status) {
        return res
            .status(400)
            .json(new ApiError(400, "Id And Status are required"))
    }

    const gallery = await Gallery.findByIdAndUpdate(
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
            new ApiResponse(200, gallery, `${type} Status updated successfully`)
        )
})

const deleteGallery = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})


export {
    getAllGallery,
    getActiveGallery,
    addGallery,
    getGalleryById,
    updateGallery,
    updateStatusGallery,
    deleteGallery,

}
