// import mongoose, {isValidObjectId} from "mongoose"
import { Gallery } from "../models/gallery.model.js"
// import {User} from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import fs from "fs"

const getAllGallery = asyncHandler(async (req, res) => {
    try {
        const { limit = 200, startIndex = 0, bussinessId,status } = req.query

        if (!bussinessId) {
            throw new ApiError(400, `BussinessId is required`)
        }
        const type = req.path.split("/")[1];

        const query = {}
        query["bussinessId"] = new mongoose.Types.ObjectId(bussinessId);
        query["type"] = type;
       if (status && status != undefined) { query["status"] = status }else { query["status"] = {$ne:"delete"}};


        const category = await Gallery.find(query)
            .select("-type")
            .sort("-_id")
            .skip(startIndex)
            .limit(limit)
            .exec();

        if (!category) {
            throw new ApiError(500, `Something went wrong while fetching ${type}`)
        } else if (category.length == 0) {
            throw new ApiError(404,  `NO Data Found ! ${type} list is empty`)
         }

        return res
            .status(200)
            .json(
                new ApiResponse(200, category, `${type} List Fetched successfully`)
            )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Gallery`))
    }
})

const getActiveGallery = asyncHandler(async (req, res) => {

    try {
        const { limit = 200, startIndex = 0, bussinessId } = req.query

        if (!bussinessId) {
            throw new ApiError(400, `BussinessId is required`)
        }
        const type = req.path.split("/")[1];
        const category = await Gallery.find({ bussinessId: bussinessId, type: type, status: 'active' })
            .select("-type")
            .sort("-_id")
            .skip(startIndex)
            .limit(limit)
            .exec();

        if (!category) {
            throw new ApiError(500, `Something went wrong while fetching ${type}`)
        } else if (category.length == 0) {
            throw new ApiError(404,  `NO Data Found ! ${type} list is empty`)
         }

        return res
            .status(200)
            .json(
                new ApiResponse(200, category, `${type} List Fetched successfully`)
            )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Gallery`))
    }
})

const addGallery = asyncHandler(async (req, res) => {
   try {
     const { bussinessId, title, description } = req.body
     const type = req.path.split("/")[1];
     const image = req.file?.filename
   
     if(!bussinessId){
        throw new ApiError(400, `BussinessId is required`)
     }

     if (type == 'rules') {
         if (!title) {
            throw new ApiError(400, `Title is required`)
         }
     } else if (type == 'gallery') {
         if (!image) {
            throw new ApiError(400, `Image is Missing`)
         }
     }
 
 
     const gallery = await Gallery.create({
         title,
         description,
         image,
         type: type,
         bussinessId,
         owner: req.vendor._id,
     })
 
     const createdGallery = await Gallery.findById(gallery._id)
 
     if (!createdGallery) {
        throw new ApiError(500, `Something went wrong while fetching ${type} list`)
 
     }
 
     return res.status(201).json(
         new ApiResponse(200, createdGallery, `${type} Added Successfully`)
     )
   } catch (error) {
    return res
    .status(error.statusCode || 500)
    .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Gallery`))
   }

})

const getGalleryById = asyncHandler(async (req, res) => {

   try {
     const { Id } = req.query
     const type = req.path.split("/")[1];
     const createdGallery = await Gallery.findById(Id)
 
     if (!createdGallery) {
        throw new ApiError(500, `Something went wrong while fetching ${type}`)
      }
 
     return res.status(201).json(
         new ApiResponse(200, createdGallery, `${type} fetched Successfully`)
     )
   } catch (error) {
    return res
    .status(error.statusCode || 500)
    .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Gallery`))
   }
})

const updateGallery = asyncHandler(async (req, res) => {
   try {
     const { Id, title, description } = req.body
     const image = req.file?.filename
     const type = req.path.split("/")[1];
 
     if (type == 'rules') {
         if (!title) {
            throw new ApiError(400, `title is required`)
         }
     } else if (type == 'gallery') {
         if (!image) {
            throw new ApiError(400, `Image is missing`)
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
                 image,
                 type
             }
         },
         { new: true }
     ).select("-type")

     if (!gallery) {
        throw new ApiError(500, `Something went wrong while update ${type}`)
      }

     return res
         .status(200)
         .json(
             new ApiResponse(200, gallery, `${type} updated successfully`)
         )
   } catch (error) {
    return res
    .status(error.statusCode || 500)
    .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Gallery`))
   }

})

const updateStatusGallery = asyncHandler(async (req, res) => {
   try {
     const { Id, status } = req.query
     const type = req.path.split("/")[1];
     if (!Id || !status) {
        throw new ApiError(400, `Id and status are required`)
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
 
     if (!gallery) {
        throw new ApiError(500, `Something went wrong while update status ${type}`)
      }

     return res
         .status(200)
         .json(
             new ApiResponse(200, gallery, `${type} Status updated successfully`)
         )
   } catch (error) {
    return res
    .status(error.statusCode || 500)
    .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Gallery`))
   }
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
