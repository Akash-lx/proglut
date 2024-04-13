import mongoose, { isValidObjectId } from "mongoose"
import { Booking } from "../models/booking.model.js"
// import {User} from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const addBookingInfo = asyncHandler(async (req, res) => {
    try {
        const { activityId, slotId, price, person, fromdate, todate, totalPayable, bussinessId, eventId, packageId, items } = req.body
        const type = req.path.split("/")[1];

        if (type == "business") {
            if (!activityId || !slotId || !fromdate || !todate || !bussinessId || !price || !person || !totalPayable) {
                throw new ApiError(400, "All fields are required")
            }
        } else if (type == "event") {
            if (!fromdate || !eventId || !price || !person || !totalPayable || !packageId) {
                throw new ApiError(400, "All fields are required")
            }
        }

        // console.log(items)

        const booking = await Booking.create({
            type,
            activityId,
            slotId,
            packageId,
            price,
            person,
            fromdate,
            todate,
            totalPayable,
            bussinessId,
            eventId,
            addonItems: items,
            owner: req.vendor._id,
        })

        const createdBooking = await Booking.findById(booking._id)

        if (!createdBooking) {
            throw new ApiError(500, `Something went wrong while adding `)

        }

        return res.status(201).json(
            new ApiResponse(200, createdBooking, `booking Added Successfully`)
        )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in Add Booking'))
    }

})

const getBookingById = asyncHandler(async (req, res) => {

    try {
        const { Id } = req.query
        const booking = await Booking.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(Id)
                }
            },
            {
                $lookup: {
                    from: "reviews",
                    localField: "_id",
                    foreignField: "bookingId",
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
                    status: 1,
                    domain: 1,
                    description: 1,
                    address: 1,
                    rules: 1,
                    bookingHour: 1,
                    amenities_list: 1,
                    owner: 1,
                }
            }
        ])

        return res.status(201).json(
            new ApiResponse(200, booking, `booking fetched Successfully`)
        )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in Booking by id'))
    }
})

const updateBookingInfo = asyncHandler(async (req, res) => {
    try {

        const { Id, activityId, slotId, price, person, fromdate, todate, totalPayable, bussinessId, eventId, packageId, items } = req.body
        const type = req.path.split("/")[1];

        if (type == "business") {
            if (!activityId || !slotId || !fromdate || !todate || !bussinessId || !price || !person || !totalPayable) {
                throw new ApiError(400, "All fields are required")
            }
        } else if (type == "event") {
            if (!fromdate || !eventId || !price || !person || !totalPayable || !packageId) {
                throw new ApiError(400, "All fields are required")
            }
        }


        const booking = await Booking.findByIdAndUpdate(
            Id,
            {
                $set: {
                    activityId,
                    slotId,
                    price,
                    person,
                    fromdate,
                    todate,
                    totalPayable,
                    bussinessId,
                    eventId,
                    packageId,
                    items

                }
            },
            { new: true }
        ).select()

        if (!booking) {
            throw new ApiError(500, `Something went wrong while update booking info`)
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, booking, `booking updated successfully`)
            )

    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in Booking update'))
    }
})


const updateStatusBooking = asyncHandler(async (req, res) => {
    try {
        const { Id, status } = req.query
        if (!Id || !status) {
            throw new ApiError(400, "Id and status are required")
        }
        const booking = await Booking.findByIdAndUpdate(
            Id,
            {
                $set: {
                    status: status
                }
            },
            { new: true }
        ).select()

        return res
            .status(200)
            .json(
                new ApiResponse(200, booking, `booking Status updated successfully`)
            )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in Booking status'))
    }
})


const getAllBooking = asyncHandler(async (req, res) => {
    try {
        const { limit = 200, startIndex = 0, domain, vendorId, status } = req.query

        const query = {}
        if (domain && domain != undefined) { query["domain"] = new mongoose.Types.ObjectId(domain) };
        if (vendorId && vendorId != undefined) { query["owner"] = new mongoose.Types.ObjectId(vendorId) };
        if (status && status != undefined) { query["status"] = status };

        // console.log(query);
        const booking = await Booking.aggregate([
            {
                $match: query
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
            }, {
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
                $lookup: {
                    from: "reviews",
                    localField: "_id",
                    foreignField: "bookingId",
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
                    status: 1,
                    rating: 1,
                    reviewcount: 1,
                    owner: 1,
                    domain: 1,
                }
            }, { $sort: { _id: -1 } },
            { $skip: parseInt(startIndex) },
            { $limit: parseInt(limit) },
        ])

        if (!booking) {
            throw new ApiError(500, `Something went wrong while fetching Booking list`)
        } else if (booking.length == 0) {
            throw new ApiError(404, `NO Data Found ! Booking list is empty`)

        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, booking, `booking List Fetched successfully`)
            )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Booking`))
    }
})



const getMyBooking = asyncHandler(async (req, res) => {

    try {
        const booking = await Booking.aggregate([
            {
                $match: {
                    owner: new mongoose.Types.ObjectId(req.vendor._id)
                }
            },
            {
                $lookup: {
                    from: "reviews",
                    localField: "_id",
                    foreignField: "bookingId",
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
                    status: 1,
                    rating: 1,
                    reviewcount: 1,
                }
            }
        ])

        if (!booking) {
            throw new ApiError(500, `Something went wrong while fetching Booking list`)
        } else if (booking.length == 0) {
            throw new ApiError(404, `No Data Found ! booking list is empty`)

        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, booking, `booking List Fetched successfully`)
            )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in My Booking'))
    }
})


const deleteBooking = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})


export {
    getAllBooking,
    addBookingInfo,
    getBookingById,
    updateBookingInfo,
    updateStatusBooking,
    deleteBooking,

    getMyBooking,

}
