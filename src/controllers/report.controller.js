import mongoose, { isValidObjectId } from "mongoose"
import { Bussiness } from "../models/bussiness.model.js"
import { Activities } from "../models/activities.model.js"
import { Booking } from "../models/booking.model.js"
import { Event } from "../models/event.model.js"
import { Vendor } from "../models/vendor.model.js"
import { Review } from "../models/reviews.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import fs from "fs"


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
        const monthlyBussiness = await Bussiness.countDocuments({ "$expr": { "$eq": [{ "$month": "$createdAt" },curretnMonth] } }).exec();
        const totalEvent = await Event.countDocuments().exec();
        const totalVendor = await Vendor.countDocuments({usertype:"vendor"}).exec();
        const totalCustomer = await Vendor.countDocuments({usertype:"user"}).exec();

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
      
        const bussiness = await Bussiness.aggregate( [
            { $group: {  _id : { "$month": "$createdAt" }, count: { $sum: 1 } } },
            { $project: { _id: 0 } }
         ] )
      
       
        return res
            .status(200)
            .json(
                new ApiResponse(200, bussiness, `bussiness List Fetched successfully`)
            )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Bussiness`))
    }
})


const getBussinessHour = asyncHandler(async (req, res) => {
    try {
        const { day, bussinessId } = req.query

        if (!bussinessId) {
            throw new ApiError(400, `BussinessId is required`)
        }

        const query = {}
        query['_id'] = new mongoose.Types.ObjectId(bussinessId)
        if (day && day != undefined) { query["bussinessHour.days"] = day };

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

        if (slotdata.length == 0) {
            throw new ApiError(404, `Data Not Found ! list is empty`)
        }

        return res.status(201).json(
            new ApiResponse(200, slotdata, `Bussiness Hour List Fetch Successfully`)
        )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in Bussinesshour'))
    }

})


export {
    getMonthwiseBussiness,
    getBussinessHour,
    getDashboardCounts,
}
