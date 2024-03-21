// import mongoose, {isValidObjectId} from "mongoose"
import { Bussiness } from "../models/bussiness.model.js"
// import {User} from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import fs from "fs"



const addBussinessInfo = asyncHandler(async (req, res) => {
    const { title, city, state, street, area, pincode, latitude, longitude, fullAddress, category } = req.body

    if (!title && !category) {
        return res
            .status(400)
            .json(new ApiError(400, "category and title are required"))
    }

    const existedBussiness = await Bussiness.findOne({
        domain: category,
        title: title,
        owner: req.vendor._id,
    })

    if (existedBussiness) {
        return res
            .status(409)
            .json(new ApiError(409, `Bussiness with same title of same category already exists`))
    }

    const bussiness = await Bussiness.create({
        title,
        address:{
            city, state, street, area, pincode, latitude, longitude, fullAddress
        },
        domain: category,
        owner: req.vendor._id,
    })

    const createdBussiness = await Bussiness.findById(bussiness._id)

    if (!createdBussiness) {
        return res
            .status(500)
            .json(new ApiError(500, `Something went wrong while adding the bussiness`, error))

    }

    return res.status(201).json(
        new ApiResponse(200, createdBussiness, `bussiness Added Successfully`)
    )

})

const getBussinessById = asyncHandler(async (req, res) => {

    const { Id } = req.query
    const createdBussiness = await Bussiness.findById(Id)

    if (!createdBussiness) {
        return res
            .status(500)
            .json(new ApiError(500, `Something went wrong while fetching bussiness`, error))
    }

    return res.status(201).json(
        new ApiResponse(200, createdBussiness, `bussiness fetched Successfully`)
    )
})

const updateBussinessInfo = asyncHandler(async (req, res) => {
    const { Id, title, city, state, street, area, pincode, latitude, longitude, fullAddress, category } = req.body

    if (!title && !category) {
        return res
            .status(400)
            .json(new ApiError(400, "category and title are required"))
    }

    const existedBussiness = await Bussiness.findOne({
        _id: { $ne: Id },
        domain: category,
        owner: req.vendor._id,
        title: title
    })

    if (existedBussiness) {
        return res
            .status(409)
            .json(new ApiError(409, `bussiness with same title of same category already exists`))
    
    }

   
    const bussiness = await Bussiness.findByIdAndUpdate(
        Id,
        {
            $set: {
                title,
                address:{
                    city, state, street, area, pincode, latitude, longitude, fullAddress
                },
                domain: category,
               
            }
        },
        { new: true }
    ).select()

    return res
        .status(200)
        .json(
            new ApiResponse(200, bussiness, `bussiness updated successfully`)
        )

})

const updateBussinesslogo = asyncHandler(async (req, res) => {
    const { Id,description } = req.body

    if (!Id) {
        return res
            .status(400)
            .json(new ApiError(400, "Id is required"))
    }

    const brandLogoFile = req.files?.brandLogo[0]?.filename;
    const coverImageFile = req.files?.coverImage[0]?.filename;

    const bussinessImages = await Bussiness.findById(Id).select("brandLogo coverImage");

    if (bussinessImages.brandLogo && bussinessImages.brandLogo != '') {
        fs.unlinkSync(`public/bussinessImages/${bussinessImages.brandLogo}`);
    }
    if (bussinessImages.coverImage && bussinessImages.coverImage != '') {
        fs.unlinkSync(`public/bussinessImages/${bussinessImages.coverImage}`);
    }
   
    const bussiness = await Bussiness.findByIdAndUpdate(
        Id,
        {
            $set: {
                description,
                brandLogo:brandLogoFile,
                coverImage:coverImageFile
            }
        },
        { new: true }
    ).select()

    return res
        .status(200)
        .json(
            new ApiResponse(200, bussiness, `bussiness logo updated successfully`)
        )

})

const updateStatusBussiness = asyncHandler(async (req, res) => {
    const {Id} = req.query
    if (!Id) {
        return res
            .status(400)
            .json(new ApiError(400, "Id is required"))
    }

    const bussiness = await Bussiness.findByIdAndUpdate(
        Id,
        {
            $set: {
                isPublished: !isPublished
            }
        },
        { new: true }
    ).select()

    return res
        .status(200)
        .json(
            new ApiResponse(200, bussiness, `bussiness Status updated successfully`)
        )
})


const getAllBussiness = asyncHandler(async (req, res) => {
    const { limit = 20, pageNumber = 0 } = req.body
    const result = {};
    const totalPosts = await Bussiness.countDocuments().exec();
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
    result.data = await Bussiness.find()
        .sort("-_id")
        .skip(startIndex)
        .limit(limit)
        .exec();
    result.rowsPerPage = limit;
    return res
        .status(200)
        .json(
            new ApiResponse(200, result, `bussiness List Fetched successfully`)
        )
})

const getActiveBussiness = asyncHandler(async (req, res) => {

    const { limit = 200, startIndex = 0 } = req.body
   
    const bussiness = await Bussiness.find()
       .sort("-_id")
        .skip(startIndex)
        .limit(limit)
        .exec();

    return res
        .status(200)
        .json(
            new ApiResponse(200, bussiness, `bussiness List Fetched successfully`)
        )
})


const addAminities = asyncHandler(async (req, res) => {
    const { aminityId, bussinessId } = req.body

    if (!aminityId || !bussinessId) {
        return res
            .status(400)
            .json(new ApiError(400, "Aminity ID and Bussiness Id are required"))
    }
  
    const activity = await Bussiness.findByIdAndUpdate(
        bussinessId,
        {
            // $addToSet: { amenities: aminityId }
            $set: { amenities: aminityId }
    },  { new: true })

    return res.status(201).json(
        new ApiResponse(200, activity, `Aminities Added Successfully`)
    )

})


const deleteBussiness = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})


export {
    getAllBussiness,
    getActiveBussiness,
    addBussinessInfo,
    getBussinessById,
    updateBussinessInfo,
    updateStatusBussiness,
    deleteBussiness,
    updateBussinesslogo,
    addAminities,
}
