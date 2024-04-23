import mongoose, { isValidObjectId } from "mongoose"
import { Bussiness } from "../models/bussiness.model.js"
import { Activities } from "../models/activities.model.js"
import { Booking } from "../models/booking.model.js"
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
        const monthNames = ["January", "February", "March", "April", "May","June","July", "August", "September", "October", "November","December"];

        for (let i = 1; i <= 12; i++) {
            const monthlyBussiness = await Bussiness.countDocuments({ "$expr": { "$eq": [{ "$month": "$createdAt" }, i] } }).exec();
            const monthlyEvent = await Event.countDocuments({ "$expr": { "$eq": [{ "$month": "$createdAt" }, i] } }).exec();
            const monthlyBooking = await Booking.countDocuments({ "$expr": { "$eq": [{ "$month": "$createdAt" }, i] } }).exec();

            data1.push(monthlyBussiness);
            data2.push(monthlyEvent);
            data3.push(monthlyBooking);
            label.push(monthNames[i-1]);
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
     
        for(let i=0; i< category.length ; i++) {
            const monthlyBussiness = await Bussiness.countDocuments({domain: category[i]._id}).exec();
          
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


export {
    getMonthwiseBussiness,
    categoryWiseBussiness,
    getDashboardCounts,
}
