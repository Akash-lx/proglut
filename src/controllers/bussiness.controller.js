import mongoose, { isValidObjectId } from "mongoose"
import { Bussiness } from "../models/bussiness.model.js"
// import {User} from "../models/user.model.js"
import { Review } from "../models/reviews.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import fs from "fs"



const addBussinessInfo = asyncHandler(async (req, res) => {
    const { title, city, state, street, area, pincode, latitude, longitude, fullAddress, category } = req.body

    if (!title || !category) {
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
        address: {
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
    const bussiness = await Bussiness.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(Id)
            }
        },
        {
            $lookup: {
                from: "reviews",
                localField: "_id",
                foreignField: "bussinessId",
                as: "reviews"
            }
        }
        , {
            $lookup: {
                from: "domains",
                localField: "amenities",
                foreignField: "_id",
                as: "amenities_list",
                pipeline: [{
                    $project: {
                        title: 1,
                        image: 1,
                        description: 1,
                    }
                }
                ]
            }
        },
        {
            $lookup: {
                from: "vendors",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [{
                    $project: {
                        fullName: 1,
                        profileImage: 1,
                        usertype: 1,
                        status: 1,
                    }
                }
                ]
            }
        },
        {
            $lookup: {
                from: "domains",
                localField: "domain",
                foreignField: "_id",
                as: "domain",
                pipeline: [{
                    $project: {
                        title: 1,

                    }
                }
                ]
            },
        },
        {
            $addFields: {
                reviewcount: {
                    $size: "$reviews"
                },
                rating: {
                    $avg: "$reviews.rating"
                },


            }
        },
        {
            $project: {
                coverImage: 1,
                brandLogo: 1,
                title: 1,
                rating: 1,
                reviewcount: 1,
                isPublished: 1,
                domain: 1,
                description: 1,
                address: 1,
                bussinessHour: 1,
                amenities_list: 1,
                owner: 1,
            }
        }
    ])

    return res.status(201).json(
        new ApiResponse(200, bussiness, `bussiness fetched Successfully`)
    )
})

const updateBussinessInfo = asyncHandler(async (req, res) => {
    const { Id, title, city, state, street, area, pincode, latitude, longitude, fullAddress, category } = req.body

    if (!title || !category) {
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
                address: {
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
    const { Id, description } = req.body

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
                brandLogo: brandLogoFile,
                coverImage: coverImageFile
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
    const { Id } = req.query
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
    const { limit = 20, pageNumber = 0 } = req.query
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

    const { limit = 200, startIndex = 0, domain, vendorId } = req.query

   const query={}
  if(domain && domain != undefined ){ query["domain"] = new mongoose.Types.ObjectId(domain) };
  if(vendorId && vendorId != undefined){ query["owner"] = new mongoose.Types.ObjectId(vendorId)};
  
// console.log(query);
    const bussiness = await Bussiness.aggregate([
        {
            $match: query
        },
        {
            $lookup: {
                from: "reviews",
                localField: "_id",
                foreignField: "bussinessId",
                as: "reviews"
            }
        },
        {
            $addFields: {
                reviewcount: {
                    $size: "$reviews"
                },
                rating: {
                    $avg: "$reviews.rating"
                },

            }
        },
        {
            $project: {
                coverImage: 1,
                brandLogo: 1,
                title: 1,
                address: 1,
                isPublished: 1,
                rating: 1,
                reviewcount: 1,
            }
        }, { $sort: { _id: -1 } },
        { $skip: parseInt(startIndex) },
        { $limit: parseInt(limit) },
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(200, bussiness, `bussiness List Fetched successfully`)
        )
})

const getMyBussiness = asyncHandler(async (req, res) => {


    const bussiness = await Bussiness.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.vendor._id)
            }
        },
        {
            $lookup: {
                from: "reviews",
                localField: "_id",
                foreignField: "bussinessId",
                as: "reviews"
            }
        },
        {
            $addFields: {
                reviewcount: {
                    $size: "$reviews"
                },
                rating: {
                    $avg: "$reviews.rating"
                },

            }
        },
        {
            $project: {
                coverImage: 1,
                brandLogo: 1,
                title: 1,
                address: 1,
                isPublished: 1,
                rating: 1,
                reviewcount: 1,
            }
        }
    ])

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
        }, { new: true })

    return res.status(201).json(
        new ApiResponse(200, activity, `Aminities Added Successfully`)
    )

})

const getBussinessHour = asyncHandler(async (req, res) => {
    const { day, bussinessId } = req.query

    if (!bussinessId) {
        return res
            .status(400)
            .json(new ApiError(400, "Bussiness Id is required"))
    }

    const query={}
    query['_id'] = new mongoose.Types.ObjectId(bussinessId)
    if(day && day != undefined ){ query["bussinessHour.days"] = day };

    const bussiness = await Bussiness.aggregate([
        {
            $unwind: "$bussinessHour"
        },
        {
            $match: query
        },
        {
            $group: {
              _id: "$bussinessHour",
            }
          }
    ])

    const slotdata = []
    bussiness.forEach((element) => {
        slotdata.push(element._id);
    })

    return res.status(201).json(
        new ApiResponse(200, slotdata, `Bussiness Hour List Fetch Successfully`)
    )

})

const addBussinessHour = asyncHandler(async (req, res) => {
    const { title, days, startTime, endTime, bussinessId } = req.body

    if (!days || !bussinessId || !startTime || !endTime) {
        return res
            .status(400)
            .json(new ApiError(400, "All fields are required"))
    }

    // const nowdate = new Date;

    const addBussinessHour = await Bussiness.findByIdAndUpdate(
        bussinessId,
        {
            $push: {
                bussinessHour: {
                    title,
                    days,
                    startTime,
                    endTime,
                }
            }

        }, { new: true })

    return res.status(201).json(
        new ApiResponse(200, addBussinessHour, `Bussiness Hour Added Successfully`)
    )

})

const updateBussinessHour = asyncHandler(async (req, res) => {
    const { Id, title, days, startTime, endTime, bussinessId } = req.body

    if (!days || !bussinessId || !startTime || !endTime) {
        return res
            .status(400)
            .json(new ApiError(400, "All fields are required"))
    }
    const updateBussinessHour = await Bussiness.updateOne(
        { _id: bussinessId, 'bussinessHour._id': { $eq: Id } },
        {
            $set: {
                "bussinessHour.$": {
                    title,
                    days,
                    startTime,
                    endTime,
                }
            }

        }, { new: true })

    return res.status(201).json(
        new ApiResponse(200, updateBussinessHour, `Bussiness Hour Added Successfully`)
    )

})

const deleteBussinessHour = asyncHandler(async (req, res) => {
    const { Id, bussinessId } = req.body

    if (!Id || !bussinessId) {
        return res
            .status(400)
            .json(new ApiError(400, "All fields are required"))
    }
    const deleteBussinessHour = await Bussiness.updateOne(
        { _id: bussinessId },
        {
            $pull: {
                bussinessHour: { _id: Id }
            }

        }, { new: true })

    return res.status(201).json(
        new ApiResponse(200, deleteBussinessHour, `Bussiness Hour Deleted Successfully`)
    )

})


const deleteBussiness = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const getReviews = asyncHandler(async (req, res) => {
    const { limit = 200, startIndex = 0, bussinessId, eventId } = req.query

    if (!bussinessId && !eventId) {
        return res
            .status(400)
            .json(new ApiError(400, "bussiness Id or event Id is required"))
    }

    const review = await Review.aggregate([
        {
            $match: {
                $or: [{ bussinessId: new mongoose.Types.ObjectId(bussinessId) }, { eventId: new mongoose.Types.ObjectId(eventId) }]
            }
        },
        {
            $lookup: {
                from: "vendors",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [{
                    $project: {
                        fullName: 1,
                        mobile: 1,
                        profileImage: 1,
                        usertype: 1,
                        status: 1,
                    }
                }
                ]
            }
        }, {
            $project: {
                rating: 1,
                content: 1,
                owner: 1,
            }
        },
        { $sort: { _id: -1 } },
        { $skip: parseInt(startIndex) },
        { $limit: parseInt(limit) },
    ])

    // const master = await Review.find({ bussinessId, eventId })
    //     .select("rating content")
    //     .sort("-_id")
    //     .skip(startIndex)
    //     .limit(limit)
    //     .exec();

    if (!review) {
        return res
            .status(500)
            .json(new ApiError(500, `Something went wrong while fetching review`, error))
    }


    return res
        .status(200)
        .json(
            new ApiResponse(200, review, `review List Fetched successfully`)
        )
})

const addReview = asyncHandler(async (req, res) => {
    const { rating, content, bussinessId, eventId } = req.body

    if (!rating) {
        return res
            .status(400)
            .json(new ApiError(400, "rating is required"))
    }
    if (!bussinessId && !eventId) {
        return res
            .status(400)
            .json(new ApiError(400, "bussiness Id or event Id is required"))
    }

    // const existedReview = await Review.findOne({
    //     owner: req.vendor._id,
    //     $or: [{ bussinessId }, { eventId }]
    // })

    // if (existedReview) {
    //     return res
    //         .status(409)
    //         .json(new ApiError(409, `${type} with same title already exists`))
    //     // throw new ApiError(409, "User with email or mobile already exists")
    // }

    const review = await Review.create({
        rating,
        content,
        bussinessId,
        eventId,
        owner: req.vendor._id
    })

    const createdReview = await Review.findById(review._id)

    if (!createdReview) {
        return res
            .status(500)
            .json(new ApiError(500, `Something went wrong while adding the Review`, error))

    }

    return res.status(201).json(
        new ApiResponse(200, createdReview, `Review Added Successfully`)
    )

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
    getBussinessHour,
    addBussinessHour,
    updateBussinessHour,
    deleteBussinessHour,
    getMyBussiness,
    getReviews,
    addReview
}
