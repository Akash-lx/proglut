import mongoose, { isValidObjectId } from "mongoose"
import { Booking } from "../models/booking.model.js"
import { EventBooking } from "../models/evenBooking.model.js"
// import {User} from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// Bussiness booking apis ////
const addBussBookingInfo = asyncHandler(async (req, res) => {
    try {
        const { activities, totalPayable, bussinessId, items, foods } = req.body

        if (!activities || !bussinessId || !totalPayable) {
            throw new ApiError(400, "All fields are required")
        }


        // console.log(items)

        const prvendor = await Booking.findOne().sort({ _id: -1 }).select('bookNo').exec();
        let bookNo = '';
        if (prvendor?.bookNo) {
            let codes = prvendor.bookNo.substring(8)
            let datef = new Date().toISOString().slice(2, 10).replace(/-/g, "");
            //    console.log(datef);
            bookNo = `PG${datef}${(parseInt(codes) + 1).toLocaleString(undefined, { useGrouping: false, minimumIntegerDigits: 4 })}`;
        } else {
            let codes = 1;
            let datef = new Date().toISOString().slice(2, 10).replace(/-/g, "");
            bookNo = `PG${datef}${(parseInt(codes)).toLocaleString(undefined, { useGrouping: false, minimumIntegerDigits: 4 })}`;
        }

        const booking = await Booking.create({
            bookNo,
            activities,
            totalPayable,
            bussinessId,
            addonItems: items,
            addonFoods: foods,
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

const getBusBookingById = asyncHandler(async (req, res) => {

    try {
        const { Id } = req.query

        const booking = await Booking.findById(Id)
            .populate('owner', 'fullName profileImage usertype status')
            .populate('bussinessId', 'title brandLogo coverImage address')
            .populate('addonItems.itemId', 'title image')
            .populate('addonFoods.itemId', 'title image')
            .populate({
                path: 'activities.busActivityId',
                populate: {
                    path: 'activityId',
                    select: 'title image'
                },

            })
            .populate('activities.slotId', 'title startTime endTime duration rate').exec();

        // const booking = await Booking.aggregate([
        //     {
        //         $match: {
        //             _id: new mongoose.Types.ObjectId(Id)
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: "vendors",
        //             localField: "owner",
        //             foreignField: "_id",
        //             as: "customer",
        //             pipeline: [{
        //                 $project: {
        //                     fullName: 1,
        //                     profileImage: 1,
        //                     usertype: 1,
        //                     status: 1,

        //                 }
        //             }
        //             ]
        //         }
        //     }, {
        //         $lookup: {
        //             from: "bussinesses",
        //             localField: "bussinessId",
        //             foreignField: "_id",
        //             as: "business",
        //             pipeline: [{
        //                 $project: {
        //                     title: 1,
        //                     brandLogo: 1,
        //                     address: 1,

        //                 }
        //             }
        //             ]
        //         },
        //     },

        //     {
        //         $lookup: {
        //             from: "activities",
        //             localField: "activities.activityId",
        //             foreignField: "_id",
        //             as: "activity",
        //             pipeline: [
        //                 {
        //                     $lookup: {
        //                         from: "domains",
        //                         localField: "activityId",
        //                         foreignField: "_id",
        //                         as: "domain",
        //                         pipeline: [{
        //                             $project: {
        //                                 title: 1,

        //                             }
        //                         }
        //                         ]
        //                     },
        //                 }, {
        //                     $project: {
        //                         domain: { $first: "$domain" },
        //                     }
        //                 }
        //             ]
        //         },
        //     },
        //     {
        //         $lookup: {
        //             from: "slots",
        //             localField: "activities.slotId",
        //             foreignField: "_id",
        //             as: "slots",
        //             pipeline: [
        //                 {
        //                     $project: {
        //                         startTime: 1,
        //                         endTime: 1,
        //                         rate: 1,
        //                         status: 1,
        //                     }
        //                 }
        //             ]
        //         },
        //     },
        //     {
        //         $lookup: {
        //             from: "items",
        //             localField: "addonItems.itemId",
        //             foreignField: "_id",
        //             as: "items",
        //             pipeline: [
        //                 {
        //                     $project: {
        //                        title: 1,
        //                     }
        //                 }
        //             ]
        //         },
        //     },
        //     {
        //         $lookup: {
        //             from: "items",
        //             localField: "addonFoods.itemId",
        //             foreignField: "_id",
        //             as: "foods",
        //             pipeline: [
        //                 {
        //                     $project: {
        //                         title: 1,
        //                     }
        //                 }
        //             ]
        //         },
        //     },


        //     {
        //         $addFields: {
        //             businessId: { $first: "$business" },
        //             customerId: { $first: "$customer" },
        //             "activities.title":"$activity.domain.title",
        //             "activities.slots": "$slots",
        //             "addonItems.title": "$items.title",
        //             "addonFoods.title": "$foods.title",
        //             //  "specs.fuel_type": "unleaded"

        //         }
        //     },
        //     {
        //         $project: {
        //             bookNo: 1,
        //             totalPayable: 1,
        //             isPaid: 1,
        //             paidAmount: 1,
        //             status: 1,
        //             addonItems: 1,
        //             addonFoods: 1,
        //             transactionId: 1,
        //             businessId: 1,
        //             activities:1,
        //             customerId: 1,
        //             createdAt: 1,

        //         }
        //     }
        // ])

        return res.status(201).json(
            new ApiResponse(200, booking, `booking fetched Successfully`)
        )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in Booking by id'))
    }
})

const updateBusBookingInfo = asyncHandler(async (req, res) => {
    try {

        const { Id, activities, totalPayable, bussinessId, items, foods } = req.body

        if (!Id || !activities || !bussinessId || !totalPayable) {
            throw new ApiError(400, "All fields are required")
        }

        const booking = await Booking.findByIdAndUpdate(
            Id,
            {
                $set: {
                    activities,
                    totalPayable,
                    bussinessId,
                    addonItems: items,
                    addonFoods: foods,

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

const updateBusBookingPayment = asyncHandler(async (req, res) => {
    try {

        const { Id, paidAmount, transactionId } = req.body

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


const updateBusStatusBooking = asyncHandler(async (req, res) => {
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

const getAllBusBooking = asyncHandler(async (req, res) => {
    try {
        const { limit = 200, startIndex = 0, domain, vendorId, status, userId, bussinessId, fromDate, toDate, activityId, state, city } = req.query
        const query = {}
        const bussinesQuery = {}
        const activi = {}
        const bookingFdata = []
        if (fromDate && toDate && fromDate != undefined && toDate != undefined) { query["activities.date"] = { $gte: fromDate, $lte: toDate } };

        if (bussinessId && bussinessId != undefined) { query["bussinessId"] = new mongoose.Types.ObjectId(bussinessId) };
        if (userId && userId != undefined) { query["owner"] = new mongoose.Types.ObjectId(userId) };
        if (status && status != undefined) { query["status"] = status } else { query["status"] = { $ne: "delete" } };
        // if (search_in && search_in != undefined) { bussinesQuery["bookNo"] = {$regex: `.*${search_in}.*`,$options:'i'} };
        if (activityId && activityId != undefined) { activi["activityId"] = activityId };

        if (domain && domain != undefined) { bussinesQuery["domain"] = domain };
        if (vendorId && vendorId != undefined) { bussinesQuery["owner"] = vendorId };
        if (state && state != undefined) { bussinesQuery["address.state"] = { $regex: `.*${state}.*`, $options: 'i' } };
        if (city && city != undefined) { bussinesQuery["address.city"] = { $regex: `.*${city}.*`, $options: 'i' } };

        const booking = await Booking.find(query).select('bookNo totalPayable isPaid paidAmount status businessId activities.busActivityId owner createdAt')
            .populate('owner', 'fullName profileImage usertype status')
            .populate({ path: 'bussinessId', select: 'brandLogo title domain owner', match: bussinesQuery })
            // .populate('activities.activityId', 'activityId')
            .populate({
                path: 'activities.busActivityId',
                select: '-_id busActivityId',
                match: activi,
                populate: {
                    path: 'activityId',
                    select: 'title'
                },

            })
            .sort({_id:-1})
            .skip(parseInt(startIndex))
            .limit(parseInt(limit)).exec();

        if (booking.length > 0) {
            booking.map((item) => {
                if (item.bussinessId != null && item.activities[0].busActivityId != null) {
                    bookingFdata.push(item);
                    // console.log(item.bussinessId);
                }
            })
        }

        if (!bookingFdata) {
            throw new ApiError(500, `Something went wrong while fetching Booking list`)
        } else if (bookingFdata.length == 0) {
            throw new ApiError(404, `NO Data Found ! Booking list is empty`)

        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, bookingFdata, `booking List Fetched successfully`)
            )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Booking`))
    }
})

const getMyBusBooking = asyncHandler(async (req, res) => {

    try {
        const { limit = 200, startIndex = 0 } = req.query
        const usertype = req.vendor.usertype
        const query = {};
        const query2 = {};
        const bookingFdata = [];
        if (usertype == 'user') {
            query['owner'] = new mongoose.Types.ObjectId(req.vendor._id);
        } else if (usertype == 'vendor') {
            query2["owner"] = new mongoose.Types.ObjectId(req.vendor._id);
        }
        const booking = await Booking.aggregate([{
            $match: query,
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
        },
        {
            $lookup: {
                from: "bussinesses",
                localField: "bussinessId",
                foreignField: "_id",
                as: "business",
                pipeline: [
                    {
                        "$match": query2
                    }, {
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
                from: "activities",
                localField: "activities.busActivityId",
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
            $addFields: {
                businessId: { $first: "$business" },
                customerId: { $first: "$customer" },
                activityId: "$activity.domain",

            }
        },
        {
            $project: {
                bookNo: 1,
                totalPayable: 1,
                isPaid: 1,
                paidAmount: 1,
                status: 1,
                businessId: 1,
                activityId: 1,
                customerId: 1,
                createdAt: 1,

            }
        }, { $sort: { _id: -1 } },
        { $skip: parseInt(startIndex) },
        { $limit: parseInt(limit) },
        ])



        if (booking.length > 0) {
            booking.map((item) => {
                if (item.businessId != null) {
                    bookingFdata.push(item);
                    // console.log(item.businessId);
                }
            })
        }

        if (!bookingFdata) {
            throw new ApiError(500, `Something went wrong while fetching Booking list`)
        } else if (bookingFdata.length == 0) {
            throw new ApiError(404, `NO Data Found ! Booking list is empty`)

        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, bookingFdata, `booking List Fetched successfully`)
            )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Booking`))
    }

})

const deleteBusBooking = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const updateBookActStatus = asyncHandler(async (req, res) => {
    try {
        const { bookingId, Id, type, status } = req.body
        if (!bookingId || !Id || !status || !type) {
            throw new ApiError(400, "All Fields are required")
        }
        let actibook = {};

        if (type == 1) {
            actibook = await Booking.updateOne(
                { _id: bookingId, activities: { $elemMatch: { _id: { $eq: new mongoose.Types.ObjectId(Id) } } } },
                {
                    $set: {
                        "activities.$.status": status
                    }

                }, { new: true })
        } else if (type == 2) {
            actibook = await Booking.updateOne(
                { _id: bookingId, addonItems: { $elemMatch: { _id: { $eq: new mongoose.Types.ObjectId(Id) } } } },
                {
                    $set: {
                        "addonItems.$.status": status
                    }

                }, { new: true })
        } else if (type == 3) {
            actibook = await Booking.updateOne(
                { _id: bookingId, addonFoods: { $elemMatch: { _id: { $eq: new mongoose.Types.ObjectId(Id) } } } },
                {
                    $set: {
                        "addonFoods.$.status": status
                    }

                }, { new: true })
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, actibook, `booking Activity Status updated successfully`)
            )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in Booking status'))
    }
})
// Bussiness booking apis ////

// Event booking apis ////
const addEvtBookingInfo = asyncHandler(async (req, res) => {
    try {
        const { price, person, fromdate, totalPayable, eventId, packageId } = req.body

        if (!fromdate || !eventId || !price || !person || !totalPayable || !packageId) {
            throw new ApiError(400, "All fields are required")
        }

        const prvendor = await EventBooking.findOne().sort({ _id: -1 }).select('bookNo').exec();
        let bookNo = '';
        if (prvendor?.bookNo) {
            let codes = prvendor.bookNo.substring(8)
            let datef = new Date().toISOString().slice(2, 10).replace(/-/g, "");
            //    console.log(datef);
            bookNo = `PG${datef}${(parseInt(codes) + 1).toLocaleString(undefined, { useGrouping: false, minimumIntegerDigits: 4 })}`;
        } else {
            let codes = 1;
            let datef = new Date().toISOString().slice(2, 10).replace(/-/g, "");
            bookNo = `PG${datef}${(parseInt(codes)).toLocaleString(undefined, { useGrouping: false, minimumIntegerDigits: 4 })}`;
        }

        const evtBooking = await EventBooking.create({
            bookNo,
            packageId,
            price,
            person,
            fromdate,
            totalPayable,
            eventId,
            owner: req.vendor._id,
        })

        const createdBooking = await EventBooking.findById(evtBooking._id)

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

const getEvtBookingById = asyncHandler(async (req, res) => {

    try {
        const { Id } = req.query

        const booking = await EventBooking.findById(Id)
            .populate('owner', 'fullName profileImage usertype status')
            .populate('eventId', 'title hostName address dateTime rules')
            .populate('packageId', 'title amount forPeople description')
            .exec();

        return res.status(201).json(
            new ApiResponse(200, booking, `booking fetched Successfully`)
        )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in Booking by id'))
    }
})

const updateEvtBookingInfo = asyncHandler(async (req, res) => {
    try {

        const { Id, price, person, fromdate, totalPayable, eventId, packageId } = req.body

        if (!fromdate || !eventId || !price || !person || !totalPayable || !packageId) {
            throw new ApiError(400, "All fields are required")
        }


        const booking = await EventBooking.findByIdAndUpdate(
            Id,
            {
                $set: {
                    price,
                    person,
                    fromdate,
                    totalPayable,
                    eventId,
                    packageId,


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

const updateEvtBookingPayment = asyncHandler(async (req, res) => {
    try {

        const { Id, paidAmount, transactionId } = req.body

        if (!Id || !paidAmount) {
            throw new ApiError(400, "Id and PaidAmount are required")
        }

        const booking = await EventBooking.findByIdAndUpdate(
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


const updateEvtStatusBooking = asyncHandler(async (req, res) => {
    try {
        const { Id, status } = req.query
        if (!Id || !status) {
            throw new ApiError(400, "Id and status are required")
        }
        const booking = await EventBooking.findByIdAndUpdate(
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

const getAllEvtBooking = asyncHandler(async (req, res) => {
    try {
        const { limit = 200, startIndex = 0, fromDate, toDate, eventId, userId, status, vendorId, state, city, hostName } = req.query
        const query = {}
        const eventQuery = {}
        const bookingFdata = []

        if (fromDate && toDate && fromDate != undefined && toDate != undefined) { query["fromdate"] = { $gte: fromDate, $lte: toDate } };

        if (eventId && eventId != undefined) { query["eventId"] = new mongoose.Types.ObjectId(eventId) };
        if (userId && userId != undefined) { query["owner"] = new mongoose.Types.ObjectId(userId) };
        if (status && status != undefined) { query["status"] = status } else { query["status"] = { $ne: "delete" } };;
        // if (search_in && search_in != undefined) { bussinesQuery["bookNo"] = {$regex: `.*${search_in}.*`,$options:'i'} };

        if (vendorId && vendorId != undefined) { eventQuery["owner"] = new mongoose.Types.ObjectId(vendorId) };
        if (state && state != undefined) { eventQuery["address.state"] = { $regex: `.*${state}.*`, $options: 'i' } };
        if (city && city != undefined) { eventQuery["address.city"] = { $regex: `.*${city}.*`, $options: 'i' } };
        if (hostName && hostName != undefined) { eventQuery["hostName"] = { $regex: `.*${hostName}.*`, $options: 'i' } };


        // console.log(query);
        const booking = await EventBooking.aggregate([
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
            },
            {
                $lookup: {
                    from: "events",
                    localField: "eventId",
                    foreignField: "_id",
                    as: "event",
                    pipeline: [
                        {
                            "$match": eventQuery
                        }, {
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
                    eventId: { $first: "$event" },
                    customerId: { $first: "$customer" },
                    packagesId: { $first: "$packages" },

                }
            },
            {
                $project: {
                    bookNo: 1,
                    person: 1,
                    fromdate: 1,
                    totalPayable: 1,
                    isPaid: 1,
                    paidAmount: 1,
                    status: 1,
                    eventId: 1,
                    customerId: 1,
                    createdAt: 1,
                    packagesId: 1,
                }
            }, { $sort: { _id: -1 } },
            { $skip: parseInt(startIndex) },
            { $limit: parseInt(limit) },
        ])

        if (booking.length > 0) {
            booking.map((item) => {
                if (item.eventId != null) {
                    bookingFdata.push(item);
                    // console.log(item.businessId);
                }
            })
        }

        if (!bookingFdata) {
            throw new ApiError(500, `Something went wrong while fetching Booking list`)
        } else if (bookingFdata.length == 0) {
            throw new ApiError(404, `NO Data Found ! Booking list is empty`)

        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, bookingFdata, `booking List Fetched successfully`)
            )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Booking`))
    }
})

const getMyEvtBooking = asyncHandler(async (req, res) => {

    try {
        const { limit = 200, startIndex = 0, status } = req.query

        const usertype = req.vendor.usertype
        const query = {};
        const query2 = {};
        const bookingFdata = [];
        if (usertype == 'user') {
            query['owner'] = new mongoose.Types.ObjectId(req.vendor._id);
        } else if (usertype == 'vendor') {
            query2["owner"] = new mongoose.Types.ObjectId(req.vendor._id);
        }

        const booking = await EventBooking.aggregate([{
            $match: query,
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
        },
        {
            $lookup: {
                from: "events",
                localField: "eventId",
                foreignField: "_id",
                as: "event",
                pipeline: [
                    {
                        "$match": query2
                    }, {
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
                localField: "packageId",
                foreignField: "_id",
                as: "packages",
                pipeline: [
                    {
                        $project: {
                            title: 1,
                            amount: 1,
                            forPeople: 1,
                        }
                    }
                ]
            },
        },

        {
            $addFields: {
                eventId: { $first: "$event" },
                customerId: { $first: "$customer" },
                packagesId: { $first: "$packages" },

            }
        },
        {
            $project: {
                bookNo: 1,
                person: 1,
                fromdate: 1,
                totalPayable: 1,
                isPaid: 1,
                paidAmount: 1,
                status: 1,
                eventId: 1,
                customerId: 1,
                createdAt: 1,
                packagesId: 1,
            }
        }, { $sort: { _id: -1 } },
        { $skip: parseInt(startIndex) },
        { $limit: parseInt(limit) },
        ])

        if (booking.length > 0) {
            booking.map((item) => {
                if (item.eventId != null) {
                    bookingFdata.push(item);
                    // console.log(item.businessId);
                }
            })
        }

        if (!bookingFdata) {
            throw new ApiError(500, `Something went wrong while fetching Booking list`)
        } else if (bookingFdata.length == 0) {
            throw new ApiError(404, `NO Data Found ! Booking list is empty`)

        }
        return res
            .status(200)
            .json(
                new ApiResponse(200, bookingFdata, `booking List Fetched successfully`)
            )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Booking`))
    }

})

const deleteEvtBooking = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

// Bussiness booking apis ////

export {
    addBussBookingInfo,
    getBusBookingById,
    updateBusBookingInfo,
    updateBusBookingPayment,
    updateBusStatusBooking,
    getAllBusBooking,
    getMyBusBooking,
    deleteBusBooking,
    updateBookActStatus,

    addEvtBookingInfo,
    getEvtBookingById,
    updateEvtBookingInfo,
    updateEvtBookingPayment,
    updateEvtStatusBooking,
    getAllEvtBooking,
    getMyEvtBooking,
    deleteEvtBooking,
}
