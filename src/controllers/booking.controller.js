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
                    from: "vendors",
                    localField: "owner",
                    foreignField: "_id",
                    as: "customer",
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
                    from: "bussinesses",
                    localField: "bussinessId",
                    foreignField: "_id",
                    as: "business",
                    pipeline: [{
                        $project: {
                            title: 1,
                            brandLogo: 1,
                            address:1,
                            rules:1,
                        }
                    }
                    ]
                },
            },
            {
                $lookup: {
                    from: "events",
                    localField: "eventId",
                    foreignField: "_id",
                    as: "event",
                    pipeline: [{
                        $project: {
                            title: 1,
                            address:1,
                            hostName: 1,
                            dateTime: 1,
                            rules:1,
                        }
                    }
                    ]
                },
            },
            {
                $lookup: {
                    from: "activities",
                    localField: "activityId",
                    foreignField: "_id",
                    as: "activity",
                    pipeline: [
                        {
                            $lookup: {
                                from: "domains",
                                localField: "activityId",
                                foreignField: "_id",
                                as: "domain",
                                pipeline: [{
                                    $project: {
                                        title: 1,

                                    }
                                }
                                ]
                            },
                        }, {
                            $project: {
                                domain: { $first: "$domain" },
                            }
                        }
                    ]
                },
            },
            {
                $lookup: {
                    from: "slots",
                    localField: "slotId",
                    foreignField: "_id",
                    as: "slots",
                    pipeline: [
                        {
                            $project: {
                                title: 1,
                                days: 1,
                                fromdate: 1,
                                todate: 1,
                                startTime: 1,
                                endTime: 1,
                                rate: 1,
                                status: 1,
                            }
                        }
                    ]
                },
            },
            {
                $lookup: {
                    from: "activities",
                    localField: "packageId",
                    foreignField: "_id",
                    as: "packages",
                    pipeline: [
                        {
                            $project: {
                                title: 1,
                                days: 1,
                                fromdate: 1,
                                todate: 1,
                                startTime: 1,
                                endTime: 1,
                                rate: 1,
                                status: 1,
                            }
                        }
                    ]
                },
            },

            {
                $addFields: {
                    businessId: { $first: "$business" },
                    eventId: { $first: "$event" },
                    customerId: { $first: "$customer" },
                    activityId: "$activity.domain",
                    packagesId: { $first: "$packages" },

                }
            },
            {
                $project: {
                    bookNo: 1,
                    type: 1,
                    person: 1,
                    fromdate: 1,
                    todate: 1,
                    totalPayable: 1,
                    isPaid: 1,
                    paidAmount: 1,
                    status: 1,
                    addonItems:1,
                    transactionId:1,
                    businessId: 1,
                    eventId: 1,
                    activityId: 1,
                    slots: 1,
                    customerId: 1,
                    createdAt: 1,
                    packagesId: 1,
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

const updateBookingPayment = asyncHandler(async (req, res) => {
    try {

        const { Id, paidAmount, transactionId } = req.body
        const type = req.path.split("/")[1];

        if (!Id || !paidAmount) {
            throw new ApiError(400, "Id and PaidAmount are required")
        }

        const booking = await Booking.findByIdAndUpdate(
            Id,
            {
                $set: {
                    isPaid: true,
                    paidAmount,
                    transactionId,

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
        const { limit = 200, startIndex = 0, domain, vendorId, status, userId, bussinessId } = req.query
        const type = req.path.split("/")[1];
        const query = {}
        // if (domain && domain != undefined) { query["domain"] = new mongoose.Types.ObjectId(domain) };
        // if (vendorId && vendorId != undefined) { query["owner"] = new mongoose.Types.ObjectId(vendorId) };
        // if (status && status != undefined) { query["status"] = status };
        if (bussinessId && bussinessId != undefined) { query["bussinessId"] = new mongoose.Types.ObjectId(bussinessId) };
        if (userId && userId != undefined) { query["owner"] = new mongoose.Types.ObjectId(userId) };
        if (status && status != undefined) { query["status"] = status };
        if (type && type != undefined) { query["type"] = type };

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
                    as: "customer",
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
                    from: "bussinesses",
                    localField: "bussinessId",
                    foreignField: "_id",
                    as: "business",
                    pipeline: [{
                        $project: {
                            title: 1,
                            brandLogo: 1,
                        }
                    }
                    ]
                },
            },
            {
                $lookup: {
                    from: "events",
                    localField: "eventId",
                    foreignField: "_id",
                    as: "event",
                    pipeline: [{
                        $project: {
                            title: 1,
                            hostName: 1,
                            dateTime: 1,
                        }
                    }
                    ]
                },
            },
            {
                $lookup: {
                    from: "activities",
                    localField: "activityId",
                    foreignField: "_id",
                    as: "activity",
                    pipeline: [
                        {
                            $lookup: {
                                from: "domains",
                                localField: "activityId",
                                foreignField: "_id",
                                as: "domain",
                                pipeline: [{
                                    $project: {
                                        title: 1,

                                    }
                                }
                                ]
                            },
                        }, {
                            $project: {
                                domain: { $first: "$domain" },
                            }
                        }
                    ]
                },
            },
            {
                $lookup: {
                    from: "slots",
                    localField: "slotId",
                    foreignField: "_id",
                    as: "slots",
                    pipeline: [
                        {
                            $project: {
                                title: 1,
                                days: 1,
                                fromdate: 1,
                                todate: 1,
                                startTime: 1,
                                endTime: 1,
                                rate: 1,
                                status: 1,
                            }
                        }
                    ]
                },
            },
            {
                $lookup: {
                    from: "activities",
                    localField: "packageId",
                    foreignField: "_id",
                    as: "packages",
                    pipeline: [
                        {
                            $project: {
                                title: 1,
                                days: 1,
                                fromdate: 1,
                                todate: 1,
                                startTime: 1,
                                endTime: 1,
                                rate: 1,
                                status: 1,
                            }
                        }
                    ]
                },
            },

            {
                $addFields: {
                    businessId: { $first: "$business" },
                    eventId: { $first: "$event" },
                    customerId: { $first: "$customer" },
                    activityId: "$activity.domain",
                    packagesId: { $first: "$packages" },

                }
            },
            {
                $project: {
                    bookNo: 1,
                    type: 1,
                    person: 1,
                    fromdate: 1,
                    todate: 1,
                    totalPayable: 1,
                    isPaid: 1,
                    paidAmount: 1,
                    status: 1,
                    businessId: 1,
                    eventId: 1,
                    activityId: 1,
                    slots: 1,
                    customerId: 1,
                    createdAt: 1,
                    packagesId: 1,
                }
            }, { $sort: { _id: -1 } },
            { $skip: parseInt(startIndex) },
            { $limit: parseInt(limit) },
        ])

        // const booking = await Booking.find(query)
        // .populate('owner', 'fullName profileImage usertype status')
        // .populate('bussinessId', 'brandLogo title')
        // .populate('activityId', 'activityId')
        // .populate('slotId', 'title startTime endTime duration rate')
        // .populate('eventId', 'title owner hostName dateTime')


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
        const { limit = 200, startIndex = 0, domain, vendorId, status, userId, bussinessId } = req.query
        const type = req.path.split("/")[1];
        // console.log(query);
        const booking = await Booking.aggregate([{
            $match: {
                type,
                owner: new mongoose.Types.ObjectId(req.vendor._id)
            },
        }, {
            $lookup: {
                from: "bussinesses",
                localField: "bussinessId",
                foreignField: "_id",
                as: "business",
                pipeline: [{
                    $project: {
                        title: 1,
                        brandLogo: 1,
                    }
                }
                ]
            },
        },
        {
            $lookup: {
                from: "events",
                localField: "eventId",
                foreignField: "_id",
                as: "event",
                pipeline: [{
                    $project: {
                        title: 1,
                        hostName: 1,
                        dateTime: 1,
                    }
                }
                ]
            },
        },
        {
            $lookup: {
                from: "activities",
                localField: "activityId",
                foreignField: "_id",
                as: "activity",
                pipeline: [
                    {
                        $lookup: {
                            from: "domains",
                            localField: "activityId",
                            foreignField: "_id",
                            as: "domain",
                            pipeline: [{
                                $project: {
                                    title: 1,

                                }
                            }
                            ]
                        },
                    }, {
                        $project: {
                            domain: { $first: "$domain" },
                        }
                    }
                ]
            },
        },
        {
            $lookup: {
                from: "slots",
                localField: "slotId",
                foreignField: "_id",
                as: "slots",
                pipeline: [
                    {
                        $project: {
                            title: 1,
                            days: 1,
                            fromdate: 1,
                            todate: 1,
                            startTime: 1,
                            endTime: 1,
                            rate: 1,
                            status: 1,
                        }
                    }
                ]
            },
        },
        {
            $lookup: {
                from: "activities",
                localField: "packageId",
                foreignField: "_id",
                as: "packages",
                pipeline: [
                    {
                        $project: {
                            title: 1,
                            days: 1,
                            fromdate: 1,
                            todate: 1,
                            startTime: 1,
                            endTime: 1,
                            rate: 1,
                            status: 1,
                        }
                    }
                ]
            },
        },

        {
            $addFields: {
                businessId: { $first: "$business" },
                eventId: { $first: "$event" },
                customerId: { $first: "$customer" },
                activityId: "$activity.domain",
                packagesId: { $first: "$packages" },

            }
        },
        {
            $project: {
                bookNo: 1,
                type: 1,
                person: 1,
                fromdate: 1,
                todate: 1,
                totalPayable: 1,
                isPaid: 1,
                paidAmount: 1,
                status: 1,
                businessId: 1,
                eventId: 1,
                activityId: 1,
                slots: 1,
                customerId: 1,
                createdAt: 1,
                packagesId: 1,
            }
        }, { $sort: { _id: -1 } },
        { $skip: parseInt(startIndex) },
        { $limit: parseInt(limit) },
        ])

        // const booking = await Booking.find(query)
        // .populate('owner', 'fullName profileImage usertype status')
        // .populate('bussinessId', 'brandLogo title')
        // .populate('activityId', 'activityId')
        // .populate('slotId', 'title startTime endTime duration rate')
        // .populate('eventId', 'title owner hostName dateTime')


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
    updateBookingPayment,
    getMyBooking,

}
