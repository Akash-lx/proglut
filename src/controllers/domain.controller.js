// import mongoose, {isValidObjectId} from "mongoose"
import { Domain } from "../models/domain.model.js"
// import {User} from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import fs from "fs"

const getAllCategory = asyncHandler(async (req, res) => {
    try {
        const { limit = 200, startIndex = 0 ,status} = req.query
        const type = req.path.split("/")[1];

        const query = {}
        query["type"] = type;
       if (status && status != undefined) { query["status"] = status }else { query["status"] = {$ne:"delete"}};

        const category = await Domain.find(query)
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
            .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Domain`))
    }
})

const getActiveCategory = asyncHandler(async (req, res) => {
    try {
        const { limit = 200, startIndex = 0 } = req.query
        const type = req.path.split("/")[1];
        const category = await Domain.find({ type: type, status: 'active' })
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
            .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Domain`))
    }
})

const addCategory = asyncHandler(async (req, res) => {
    try {
        const { title, description } = req.body
        const type = req.path.split("/")[1];
        const imageLocalPath = req.file?.filename
        // console.log(req.body)
        // console.log(req)
        if (!title) {
            throw new ApiError(400, `title is required`)
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
            throw new ApiError(409, `${type} with same title already exists`)
        }

        const domain = await Domain.create({
            title,
            description,
            image: imageLocalPath,
            type: type
        })

        const createdDomain = await Domain.findById(domain._id)

        if (!createdDomain) {
            throw new ApiError(500, `Something went wrong while Add ${type}`)
        }

        return res.status(201).json(
            new ApiResponse(200, createdDomain, `${type} Added Successfully`)
        )

    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Domain`))
    }
})

const getCategoryById = asyncHandler(async (req, res) => {

    try {
        const { Id } = req.query
        const type = req.path.split("/")[1];
        const createdDomain = await Domain.findById(Id)

        if (!createdDomain) {
            throw new ApiError(500, `Something went wrong while fetching ${type}`)
        }

        return res.status(201).json(
            new ApiResponse(200, createdDomain, `${type} fetched Successfully`)
        )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Domain`))
    }
})

const updateCategory = asyncHandler(async (req, res) => {
   try {
     const { domainId, title, description } = req.body
     const image = req.file?.filename
     const type = req.path.split("/")[1];
    
     if (!title) {
        image !='' && image != undefined ? fs.unlinkSync(`public/domainImages/${image}`) : null;
         throw new ApiError(400, `title is required`)
     }
 
 
     const existedDomain = await Domain.findOne({
         _id: { $ne: domainId },
         type: type,
         title: title
     })
 
     if (existedDomain) {
        image !='' && image != undefined ? fs.unlinkSync(`public/domainImages/${image}`) : null;
         throw new ApiError(409,`${type} with same title already exists`)
     }
 
     const domainImage = await Domain.findById(domainId).select("image");

     if (!domainImage) {
      
         throw new ApiError(400, `Invaild Id for ${type} details`)
     }
 
     if (image !='' && image != undefined && domainImage.image && domainImage.image != '') {
        if (fs.existsSync(`public/domainImages/${domainImage.image}`)) {
            fs.unlinkSync(`public/domainImages/${domainImage.image}`);
          }
     }
     const domain = await Domain.findByIdAndUpdate(
         domainId,
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
 
     if (!domain) {
        throw new ApiError(500, `Something went wrong while update ${type}`)
      }

     return res
         .status(200)
         .json(
             new ApiResponse(200, domain, `${type} updated successfully`)
         )
 
   } catch (error) {
    return res
    .status(error.statusCode || 500)
    .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Domain`))
   }
})

const updateStatusCategory = asyncHandler(async (req, res) => {
    try {
        const { Id, status } = req.query
        const type = req.path.split("/")[1];
        if (!Id || !status) {
            throw new ApiError(400, `All fileds are required`)
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
    
        if (!domain) {
            throw new ApiError(500, `Something went wrong while status update ${type}`)
          }

        return res
            .status(200)
            .json(
                new ApiResponse(200, domain, `${type} Status updated successfully`)
            )
    } catch (error) {
        return res
        .status(error.statusCode || 500)
        .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Domain`))
    }
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
