import mongoose, {isValidObjectId} from "mongoose"
import { Event } from "../models/event.model.js"
// import {User} from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import fs from "fs"



const addEventInfo = asyncHandler(async (req, res) => {
    const { title, city, state, street, area, pincode, latitude, longitude, fullAddress, startDate, endDate, startTime, endTime, entryFee, description } = req.body

    if (!title) {
        return res
            .status(400)
            .json(new ApiError(400, "title is required"))
    }

    if (!startDate || !endDate || !startTime || !endTime) {
        return res
            .status(400)
            .json(new ApiError(400, "Date and Time fileds are required"))
    }

    // const existedEvent = await Event.findOne({
    //     domain: category,
    //     title: title,
    //     owner: req.vendor._id,
    // })

    // if (existedEvent) {
    //     return res
    //         .status(409)
    //         .json(new ApiError(409, `Event with same title of same category already exists`))
    // }

    const event = await Event.create({
        title,
        address: {
            city, state, street, area, pincode, latitude, longitude, fullAddress
        },
        dateTime: {
            startDate, endDate, startTime, endTime
        },
        entryFee,
        description,
        owner: req.vendor._id,
    })

    const createdEvent = await Event.findById(event._id)

    if (!createdEvent) {
        return res
            .status(500)
            .json(new ApiError(500, `Something went wrong while adding the event`, error))

    }

    return res.status(201).json(
        new ApiResponse(200, createdEvent, `Event Created Successfully`)
    )

})

const getEventById = asyncHandler(async (req, res) => {

    const { Id } = req.query
    const createdEvent = await Event.findById(Id)

    if (!createdEvent) {
        return res
            .status(500)
            .json(new ApiError(500, `Something went wrong while fetching event`, error))
    }

    return res.status(201).json(
        new ApiResponse(200, createdEvent, `event fetched Successfully`)
    )
})

const updateEventInfo = asyncHandler(async (req, res) => {
    const { Id, title, city, state, street, area, pincode, latitude, longitude, fullAddress, startDate, endDate, startTime, endTime, entryFee, description } = req.body

    if (!title) {
        return res
            .status(400)
            .json(new ApiError(400, "title is required"))
    }

    if (!startDate || !endDate || !startTime || !endTime) {
        return res
            .status(400)
            .json(new ApiError(400, "Date and Time fileds are required"))
    }

    const event = await Event.findByIdAndUpdate(
        Id,
        {
            $set: {
                title,
                address: {
                    city, state, street, area, pincode, latitude, longitude, fullAddress
                },
                dateTime: {
                    startDate, endDate, startTime, endTime
                },
                entryFee,
                description,
            }
        },
        { new: true }
    ).select()

    return res
        .status(200)
        .json(
            new ApiResponse(200, event, `Event detail updated successfully`)
        )

})

const updateEventlogo = asyncHandler(async (req, res) => {
    const { Id } = req.body

    if (!Id) {
        return res
            .status(400)
            .json(new ApiError(400, "Id is required"))
    }

    const imagearr = [];
   req.files.map((item,index) =>{
        // console.log(item.filename);
        imagearr.push(item.filename);
    });
    if(imagearr.length == 0){
        return res
        .status(400)
        .json(new ApiError(400, "images are required"))
    }
    // console.log(imagearr);

    const eventImages = await Event.findById(Id).select("coverImages");

    if (eventImages.coverImages && eventImages.coverImages.length > 0) {
        eventImages.coverImages.map((item,index) => {
            fs.unlinkSync(`public/bussinessImages/${item}`);
        })
      
    }

    const event = await Event.findByIdAndUpdate(
        Id,
        {
            $set: {
                coverImages: imagearr
            }
        },
        { new: true }
    ).select()

    return res
        .status(200)
        .json(
            new ApiResponse(200, event, `Event images updated successfully`)
        )

})

// const updateStatusEvent = asyncHandler(async (req, res) => {
//     const { Id } = req.query
//     if (!Id) {
//         return res
//             .status(400)
//             .json(new ApiError(400, "Id is required"))
//     }

//     const event = await Event.findByIdAndUpdate(
//         Id,
//         {
//             $set: {
//                 isPublished: !isPublished
//             }
//         },
//         { new: true }
//     ).select()

//     return res
//         .status(200)
//         .json(
//             new ApiResponse(200, event, `event Status updated successfully`)
//         )
// })


const getAllEvent = asyncHandler(async (req, res) => {
    const { limit = 20, pageNumber = 0 } = req.body
    const result = {};
    const totalPosts = await Event.countDocuments().exec();
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
    result.data = await Event.find()
        .sort("-_id")
        .skip(startIndex)
        .limit(limit)
        .exec();
    result.rowsPerPage = limit;
    return res
        .status(200)
        .json(
            new ApiResponse(200, result, `event List Fetched successfully`)
        )
})

const getActiveEvent = asyncHandler(async (req, res) => {

    const { limit = 200, startIndex = 0 } = req.body

    const event = await Event.find()
        .sort("-_id")
        .skip(startIndex)
        .limit(limit)
        .exec();

    return res
        .status(200)
        .json(
            new ApiResponse(200, event, `event List Fetched successfully`)
        )
})

const getMyEvent = asyncHandler(async (req, res) => {


    const event = await Event.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.vendor._id)
            }
        },
        {
            $lookup: {
                from: "reviews",
                localField: "_id",
                foreignField: "eventId",
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
                entryFee:1,
                dateTime:1,
                coverImages: 1,
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
            new ApiResponse(200, event, `bussiness List Fetched successfully`)
        )
})

// const addAminities = asyncHandler(async (req, res) => {
//     const { aminityId, eventId } = req.body

//     if (!aminityId || !eventId) {
//         return res
//             .status(400)
//             .json(new ApiError(400, "Aminity ID and Event Id are required"))
//     }

//     const activity = await Event.findByIdAndUpdate(
//         eventId,
//         {
//             // $addToSet: { amenities: aminityId }
//             $set: { amenities: aminityId }
//         }, { new: true })

//     return res.status(201).json(
//         new ApiResponse(200, activity, `Aminities Added Successfully`)
//     )

// })


const deleteEvent = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})


export {
    getAllEvent,
    getActiveEvent,
    addEventInfo,
    getEventById,
    updateEventInfo,
    // updateStatusEvent,
    deleteEvent,
    updateEventlogo,
    getMyEvent,
    // addAminities,
}
