import mongoose, { isValidObjectId } from "mongoose"
import { Bussiness } from "../models/bussiness.model.js"
import { Activities } from "../models/activities.model.js"
import { Booking } from "../models/booking.model.js"
import { EventBooking } from "../models/evenBooking.model.js"
import { Event } from "../models/event.model.js"
import { Vendor } from "../models/vendor.model.js"
import { Review } from "../models/reviews.model.js"
import { Domain } from "../models/domain.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import fs from "fs"
import { count } from "console"


// const getAllBussiness = asyncHandler(async (req, res) => {
//     const { limit = 20, pageNumber = 0 } = req.query
//     const result = {};
//     const totalPosts = await Bussiness.countDocuments().exec();
//     let startIndex = pageNumber * limit;
//     const endIndex = (pageNumber + 1) * limit;
//     result.totalPosts = totalPosts;
//     if (startIndex > 0) {
//         result.previous = {
//             pageNumber: pageNumber - 1,
//             limit: limit,
//         };
//     }
//     if (endIndex < (totalPosts)) {
//         result.next = {
//             pageNumber: pageNumber + 1,
//             limit: limit,
//         };
//     }
//     result.data = await Bussiness.find()
//         .sort("-_id")
//         .skip(startIndex)
//         .limit(limit)
//         .exec();
//     result.rowsPerPage = limit;
//     return res
//         .status(200)
//         .json(
//             new ApiResponse(200, result, `bussiness List Fetched successfully`)
//         )
// })

const getUserBookingCounts = asyncHandler(async (req, res) => {
    try {
        const { userId } = req.query

        const curretnMonth = new Date().getMonth() + 1;
        const currentDate = new Date().toISOString().split('T')[0];

        const totalBooking = await Booking.countDocuments({ owner: userId }).exec();
        const monthlyBooking = await Booking.countDocuments({ owner: userId, "$expr": { "$eq": [{ "$month": "$createdAt" }, curretnMonth] } }).exec();

        const todaysBooking = await Booking.aggregate()
            .addFields({ start_date: { $dateToString: { date: "$createdAt", format: "%Y-%m-%d" } } })
            .match({ owner: new mongoose.Types.ObjectId(userId), start_date: { $eq: currentDate } })
            .count("count");

        const totalEventBooking = await EventBooking.countDocuments({ owner: userId }).exec();
        const monthlyEventBooking = await EventBooking.countDocuments({ owner: userId, "$expr": { "$eq": [{ "$month": "$createdAt" }, curretnMonth] } }).exec();
        const todaysEventBooking = await EventBooking.aggregate([
            { $addFields: { start_date: { $dateToString: { date: "$createdAt", format: "%Y-%m-%d" } } } },
            {
                $match: { owner: new mongoose.Types.ObjectId(userId), start_date: { $eq: currentDate } }
            }, {
                $count: "count"
            }

        ])

        const dashCounts = {
            "totalBussinessBooking": totalBooking,
            "monthlyBussinessBooking": monthlyBooking,
            "todaysBussinessBooking": todaysBooking[0]?.count ? todaysBooking[0]?.count : 0,
            // "todaysBussinessBooking": todaysBooking,
            "totalEventBooking": totalEventBooking,
            "monthlyEventBooking": monthlyEventBooking,
            "todaysEventBooking": todaysEventBooking[0]?.count ? todaysEventBooking[0]?.count : 0,

        }
        return res
            .status(200)
            .json(
                new ApiResponse(200, dashCounts, `User Booking Counts Fetched successfully`)
            )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Reports`))
    }
})

const getVendorBookingCounts = asyncHandler(async (req, res) => {
    try {
        const { vendorId } = req.query

        const curretnMonth = new Date().getMonth() + 1;
        const currentDate = new Date().toISOString().split('T')[0];

        const totalBussiness = await Bussiness.countDocuments({ owner: vendorId }).exec();
        const totalEvent = await Event.countDocuments({ owner: vendorId }).exec();

        const totalBooking = await Booking.aggregate()
            .lookup({ from: "bussinesses", localField: "bussinessId", foreignField: "_id", as: "business" })
            .match({ "business.owner": new mongoose.Types.ObjectId(vendorId) })
            .group({_id: null,counts: { $sum: 1 },Earning: { $sum: "$totalPayable" }});

        const monthlyBooking = await Booking.aggregate()
            .lookup({ from: "bussinesses", localField: "bussinessId", foreignField: "_id", as: "business" })
            .match({ "business.owner": new mongoose.Types.ObjectId(vendorId), "$expr": { "$eq": [{ "$month": "$createdAt" }, curretnMonth] } })
            .group({_id: null,counts: { $sum: 1 },Earning: { $sum: "$totalPayable" }});

        const todaysBooking = await Booking.aggregate()
            .lookup({ from: "bussinesses", localField: "bussinessId", foreignField: "_id", as: "business" })
            .addFields({ start_date: { $dateToString: { date: "$createdAt", format: "%Y-%m-%d" } } })
            .match({ "business.owner": new mongoose.Types.ObjectId(vendorId), start_date: { $eq: currentDate } })
            .group({_id: null,counts: { $sum: 1 },Earning: { $sum: "$totalPayable" }});
            

        const totalEventBooking = await EventBooking.aggregate()
            .lookup({ from: "events", localField: "eventId", foreignField: "_id", as: "event" })
            .match({ "event.owner": new mongoose.Types.ObjectId(vendorId) })
             .group({_id: null,count: { $sum: 1 },Earning: { $sum: "$totalPayable" }});

        const monthlyEventBooking = await EventBooking.aggregate()
            .lookup({ from: "events", localField: "eventId", foreignField: "_id", as: "event" })
            .match({ "event.owner": new mongoose.Types.ObjectId(vendorId), "$expr": { "$eq": [{ "$month": "$createdAt" }, curretnMonth] } })
             .group({_id: null,count: { $sum: 1 },Earning: { $sum: "$totalPayable" }});

        const todaysEventBooking = await EventBooking.aggregate()
            .lookup({ from: "events", localField: "eventId", foreignField: "_id", as: "event" })
            .addFields({ start_date: { $dateToString: { date: "$createdAt", format: "%Y-%m-%d" } } })
            .match({ "event.owner": new mongoose.Types.ObjectId(vendorId), start_date: { $eq: currentDate } })
             .group({_id: null,count: { $sum: 1 },Earning: { $sum: "$totalPayable" }});



        const dashCounts = {
            "totalBussiness": totalBussiness,
            "totalEvent": totalEvent,
            "totalBussinessBooking": totalBooking[0]?.counts ? totalBooking[0]?.counts : 0,
            "monthlyBussinessBooking": monthlyBooking[0]?.counts ? monthlyBooking[0]?.counts : 0,
            "todaysBussinessBooking": todaysBooking[0]?.counts ? todaysBooking[0]?.counts : 0,

            "totalEventBooking": totalEventBooking[0]?.count ? totalEventBooking[0]?.count : 0,
            "monthlyEventBooking": monthlyEventBooking[0]?.count ? monthlyEventBooking[0]?.count : 0,
            "todaysEventBooking": todaysEventBooking[0]?.count ? todaysEventBooking[0]?.count : 0,

            "totalBussinessEarning": totalBooking[0]?.Earning ? totalBooking[0]?.Earning : 0,
            "monthlyBussinessEarning": monthlyBooking[0]?.Earning ? monthlyBooking[0]?.Earning : 0,
            "todaysBussinessEarning": todaysBooking[0]?.Earning ? todaysBooking[0]?.Earning : 0,

            "totalEventEarning": totalEventBooking[0]?.Earning ? totalEventBooking[0]?.Earning : 0,
            "monthlyEventEarning": monthlyEventBooking[0]?.Earning ? monthlyEventBooking[0]?.Earning : 0,
            "todaysEventEarning": todaysEventBooking[0]?.Earning ? todaysEventBooking[0]?.Earning : 0,

            "totalEarning": ((totalEventBooking[0]?.Earning ? totalEventBooking[0]?.Earning : 0) + (totalBooking[0]?.Earning ? totalBooking[0]?.Earning : 0)),
            "monthlyEarning": ((monthlyEventBooking[0]?.Earning ? monthlyEventBooking[0]?.Earning : 0) +  (monthlyBooking[0]?.Earning ? monthlyBooking[0]?.Earning : 0)),
            "todaysEarning": ((todaysEventBooking[0]?.Earning ? todaysEventBooking[0]?.Earning : 0) + (todaysBooking[0]?.Earning ? todaysBooking[0]?.Earning : 0)),

        }
        return res
            .status(200)
            .json(
                new ApiResponse(200, dashCounts, `Dashboard Counts Fetched successfully`)
            )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Bussiness`))
    }
})

const getDashboardCounts = asyncHandler(async (req, res) => {
    try {

        const curretnMonth = new Date().getMonth() + 1;

        const totalBussiness = await Bussiness.countDocuments().exec();
        const monthlyBussiness = await Bussiness.countDocuments({ "$expr": { "$eq": [{ "$month": "$createdAt" }, curretnMonth] } }).exec();
        const totalEvent = await Event.countDocuments().exec();
        const totalVendor = await Vendor.countDocuments({ usertype: "vendor" }).exec();
        const totalCustomer = await Vendor.countDocuments({ usertype: "user" }).exec();

        const dashCounts = {
            "totalBussiness": totalBussiness,
            "totalCustomer": totalCustomer,
            "totalVendor": totalVendor,
            "totalEvent": totalEvent,
            "monthlyBussiness": monthlyBussiness,
        }
        return res
            .status(200)
            .json(
                new ApiResponse(200, dashCounts, `Dashboard Counts Fetched successfully`)
            )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Bussiness`))
    }
})

const getMonthwiseBussiness = asyncHandler(async (req, res) => {
    try {

        // const bussiness = await Bussiness.aggregate([
        //     { $group: { _id: {$dateToString: { format: "%B", date: "$createdAt" }}, count: { $sum: 1 }} },
        //  ] );

        // const events = await Event.aggregate([
        //     { $group: { _id: {$dateToString: { format: "%B", date: "$createdAt" }}, count: { $sum: 1 }} },
        //  ] )

        // const booking = await Booking.aggregate([
        //     { $group: { _id: {$dateToString: { format: "%B", date: "$createdAt" }}, count: { $sum: 1 }} },
        //  ] )

        let data1 = [];
        let data2 = [];
        let data3 = [];
        let label = [];
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        for (let i = 1; i <= 12; i++) {
            const monthlyBussiness = await Bussiness.countDocuments({ "$expr": { "$eq": [{ "$month": "$createdAt" }, i] } }).exec();
            const monthlyEvent = await Event.countDocuments({ "$expr": { "$eq": [{ "$month": "$createdAt" }, i] } }).exec();
            const monthlyBooking = await Booking.countDocuments({ "$expr": { "$eq": [{ "$month": "$createdAt" }, i] } }).exec();

            data1.push(monthlyBussiness);
            data2.push(monthlyEvent);
            data3.push(monthlyBooking);
            label.push(monthNames[i - 1]);
        }

        const mainData = {
            "data1": data1,
            "data2": data2,
            "data3": data3,
            "label": label,
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, mainData, `Fetched successfully`)
            )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Bussiness`))
    }
})


const categoryWiseBussiness = asyncHandler(async (req, res) => {
    try {
        const category = await Domain.find({ type: "category", status: 'active' }).select("title").exec();

        let data = [];
        let label = [];

        for (let i = 0; i < category.length; i++) {
            const monthlyBussiness = await Bussiness.countDocuments({ domain: category[i]._id }).exec();

            data.push(monthlyBussiness);
            label.push(category[i].title);
        }

        const mainData = {
            "data": data,
            "label": label,
        }


        return res.status(201).json(
            new ApiResponse(200, mainData, `Fetch Successfully`)
        )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in Bussinesshour'))
    }

})

const activityWiseBooking = asyncHandler(async (req, res) => {
    try {
        const { limit = 200, startIndex = 0, search_in, domain, vendorId, status, userId, bussinessId, fromDate, toDate, activityId, state, city } = req.query
        const query = {}

        if (fromDate && toDate && fromDate != undefined && toDate != undefined) { query["activities.date"] = { "$gte": new Date(fromDate), "$lte": new Date(toDate) } };
        if (bussinessId && bussinessId != undefined) { query["bussinessId"] = new mongoose.Types.ObjectId(bussinessId) };
        if (userId && userId != undefined) { query["owner"] = new mongoose.Types.ObjectId(userId) };
        if (status && status != undefined) { query["activities.status"] = status };
        // if (search_in && search_in != undefined) { bussinesQuery["bookNo"] = {$regex: `.*${search_in}.*`,$options:'i'} };
        if (activityId && activityId != undefined) { query["activity.activityId"] = new mongoose.Types.ObjectId(activityId) };

        if (domain && domain != undefined) { query["business.domain"] = domain };
        if (vendorId && vendorId != undefined) { query["business.owner"] = vendorId };
        if (state && state != undefined) { query["business.address.state"] = { $regex: `.*${state}.*`, $options: 'i' } };
        if (city && city != undefined) { query["business.address.city"] = { $regex: `.*${city}.*`, $options: 'i' } };

        const booking = await Booking.aggregate([
            {
                $lookup: {
                    from: "vendors",
                    localField: "owner",
                    foreignField: "_id",
                    as: "customer",
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
            },
            {
                $lookup: {
                    from: "bussinesses",
                    localField: "bussinessId",
                    foreignField: "_id",
                    as: "business",
                    pipeline: [
                        {
                            $project: {
                                title: 1,
                                brandLogo: 1,
                                address: 1,
                            }
                        }
                    ]
                },
            },
            {
                $lookup: {
                    from: "slots",
                    localField: "activities.slotId",
                    foreignField: "_id",
                    as: "slots",
                    pipeline: [
                        {
                            $project: {
                                _id: 0,
                                startTime: 1,
                                endTime: 1,
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
                                activityId: 1,
                                domain: { $first: "$domain" },
                            }
                        }
                    ]
                },
            },

            {
                $unwind: "$activities",
            },
            {
                $match: query,
            },
            {
                $addFields: {
                    businessId: { $first: "$business" },
                    customerId: { $first: "$customer" },
                    "activities.activityName": { $first: "$activity.domain.title" },
                    "activities.slots": { $first: "$slots" },

                }
            },
            {
                $project: {
                    bookNo: 1,
                    isPaid: 1,
                    activities: 1,
                    businessId: 1,
                    activityName: 1,
                    customerId: 1,
                    createdAt: 1,

                }
            },
            { $sort: { _id: -1 } },
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

const getMonthwiseVendorEarning = asyncHandler(async (req, res) => {
    try {
        const { vendorId } = req.query
      
        let data1 = [];
        let data2 = [];
        let data3 = [];
        let label = [];
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
 
        for (let i = 1; i <= 12; i++) {
            // const monthlyBussinessEarning = await Bussiness.countDocuments({ "$expr": { "$eq": [{ "$month": "$createdAt" }, i] } }).exec();
            // const monthlyEventEarning = await Event.countDocuments({ "$expr": { "$eq": [{ "$month": "$createdAt" }, i] } }).exec();
            
          
            const monthlyBussinessEarning = await Booking.aggregate()
            .lookup({ from: "bussinesses", localField: "bussinessId", foreignField: "_id", as: "business" })
            .match({ "business.owner": new mongoose.Types.ObjectId(vendorId), "$expr": { "$eq": [{ "$month": "$createdAt" }, i] } })
            .group({_id: null,Earning: { $sum: "$totalPayable" }});

            const monthlyEventEarning = await EventBooking.aggregate()
            .lookup({ from: "events", localField: "eventId", foreignField: "_id", as: "event" })
            .match({ "event.owner": new mongoose.Types.ObjectId(vendorId), "$expr": { "$eq": [{ "$month": "$createdAt" }, i] } })
             .group({_id: null,Earning: { $sum: "$totalPayable" }});


            const monthlyTotalEarning = ((monthlyBussinessEarning[0]?.Earning ? monthlyBussinessEarning[0]?.Earning : 0)+(monthlyEventEarning[0]?.Earning ? monthlyEventEarning[0]?.Earning : 0))

            data1.push(monthlyBussinessEarning[0]?.Earning ? monthlyBussinessEarning[0]?.Earning : 0);
            data2.push(monthlyEventEarning[0]?.Earning ? monthlyEventEarning[0]?.Earning : 0);
            data3.push(monthlyTotalEarning);
            label.push(monthNames[i - 1]);
        }

        const mainData = {
            "data1": data1,
            "data2": data2,
            "data3": data3,
            "label": label,
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, mainData, `Fetched successfully`)
            )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Bussiness`))
    }
})

export {
    getMonthwiseBussiness,
    categoryWiseBussiness,
    getDashboardCounts,
    activityWiseBooking,
    getUserBookingCounts,
    getVendorBookingCounts,
    getMonthwiseVendorEarning,
}

