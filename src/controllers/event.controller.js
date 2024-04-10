import mongoose, { isValidObjectId } from "mongoose"
import { Event } from "../models/event.model.js"
// import {User} from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import fs from "fs"


const addEventInfo = asyncHandler(async (req, res) => {
    try {
        const { title, city, state, street, area, pincode, latitude, longitude, fullAddress, startDate, endDate, startTime, endTime, description, bussinessId, hostName } = req.body

        if (!title) {
            throw new ApiError(400, `title is required`)
        }

        if (!startDate || !endDate || !startTime || !endTime) {
            throw new ApiError(400, `Date and Time fileds are required`)
        }

        const existedEvent = await Event.findOne({
            title: title,
            "dateTime.startDate": startDate,
            owner: req.vendor._id,
        })

        if (existedEvent) {
            throw new ApiError(409, `Event with same title of same startDate already exists`)
        }

        const event = await Event.create({
            title,
            address: {
                city, state, street, area, pincode, latitude, longitude, fullAddress
            },
            dateTime: {
                startDate, endDate, startTime, endTime
            },
            description,
            bussinessId,
            hostName,
            owner: req.vendor._id,
        })

        const createdEvent = await Event.findById(event._id)

        if (!createdEvent) {
            throw new ApiError(500, `Something went wrong while Adding Event`)
        }

        return res.status(201).json(
            new ApiResponse(200, createdEvent, `Event Created Successfully`)
        )

    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Event`))
    }
})

const getEventById = asyncHandler(async (req, res) => {
    try {
        const { Id } = req.query

        if (!Id) {
            throw new ApiError(400, `Id is required`)
        }

        const createdEvent = await Event.findById(Id)
            .populate('owner', 'fullName profileImage usertype status')
            .populate('amenities', 'title image description')
            .populate('bussinessId', 'brandLogo title')


        if (!createdEvent) {
            throw new ApiError(500, `Something went wrong while faching Event`)
        }

        return res.status(201).json(
            new ApiResponse(200, createdEvent, `event fetched Successfully`)
        )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Event`))
    }
})

const updateEventInfo = asyncHandler(async (req, res) => {
    try {
        const { Id, title, city, state, street, area, pincode, latitude, longitude, fullAddress, startDate, endDate, startTime, endTime, description, bussinessId, hostName } = req.body

        if (!Id) {
            throw new ApiError(400, `Id is required`)
        }

        if (!title) {
            throw new ApiError(400, `title is required`)
        }

        if (!startDate || !endDate || !startTime || !endTime) {
            throw new ApiError(400, "Date and time fileds are rewquired")

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
                    description,
                    bussinessId,
                    hostName,
                }
            },
            { new: true }
        ).select()

        if (!event) {
            throw new ApiError(500, `Something went wrong while updating Event`)
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, event, `Event detail updated successfully`)
            )

    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Event`))
    }
})

const updateEventlogo = asyncHandler(async (req, res) => {
    try {
        const { Id } = req.body

        if (!Id) {
            throw new ApiError(400, `Id is required`)
        }

        const imagearr = [];
        req.files.map((item, index) => {
            // console.log(item.filename);
            imagearr.push(item.filename);
        });
        if (imagearr.length == 0) {
            throw new ApiError(400, `Images are required`)
        }
        // console.log(imagearr);

        const eventImages = await Event.findById(Id).select("coverImages");

        if (eventImages.coverImages && eventImages.coverImages.length > 0) {
            eventImages.coverImages.map((item, index) => {
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

        if (!event) {
            throw new ApiError(500, `Something went wrong while updating event cover image`)
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, event, `Event images updated successfully`)
            )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Event`))
    }

})

const updateStatusEvent = asyncHandler(async (req, res) => {
    const { Id, status } = req.query
    if (!Id || !status) {
        return res
            .status(400)
            .json(new ApiError(400, "Id and status are required"))
    }

    const event = await Event.findByIdAndUpdate(
        Id,
        {
            $set: {
                status: !status
            }
        },
        { new: true }
    ).select()

    return res
        .status(200)
        .json(
            new ApiResponse(200, event, `event Status updated successfully`)
        )
})


const getAllEvent = asyncHandler(async (req, res) => {
    try {
        const { limit = 200, startIndex = 0, bussinessId, vendorId, status } = req.query

        const query = {}
        if (bussinessId && bussinessId != undefined) { query["bussinessId"] = new mongoose.Types.ObjectId(bussinessId) };
        if (vendorId && vendorId != undefined) { query["owner"] = new mongoose.Types.ObjectId(vendorId) };
        if (status && status != undefined) { query["status"] = status };
        // console.log(query);
        const event = await Event.aggregate([
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
            },
            {
                $lookup: {
                    from: "bussinesses",
                    localField: "bussinessId",
                    foreignField: "_id",
                    as: "bussiness",
                    pipeline: [{
                        $project: {
                            brandLogo: 1,
                            title: 1,

                        }
                    }
                    ]
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
                    bussinessId: { $first: "$bussiness" },
                }
            },
            {
                $project: {
                    coverImages: 1,
                    title: 1,
                    address: 1,
                    dateTime: 1,
                    status: 1,
                    rating: 1,
                    reviewcount: 1,
                    bussinessId: 1,
                    owner: 1,
                }
            }, { $sort: { _id: -1 } },
            { $skip: parseInt(startIndex) },
            { $limit: parseInt(limit) },
        ])

        if (!event) {
            throw new ApiError(500, `Something went wrong while fetching Event list`)
        } else if (event.length == 0) {
            throw new ApiError(404, `NO Data Found ! Event list is empty`)

        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, event, `Event List Fetched successfully`)
            )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Event`))
    }
})

const getActiveEvent = asyncHandler(async (req, res) => {

    try {
        const { limit = 200, startIndex = 0, bussinessId, vendorId } = req.query

        const query = {}
        if (bussinessId && bussinessId != undefined) { query["bussinessId"] = new mongoose.Types.ObjectId(bussinessId) };
        if (vendorId && vendorId != undefined) { query["owner"] = new mongoose.Types.ObjectId(vendorId) };
        query["status"] = "active";
        // console.log(query);
        const event = await Event.aggregate([
            {
                $match: query
            },
            {
                $lookup: {
                    from: "bussinesses",
                    localField: "bussinessId",
                    foreignField: "_id",
                    as: "bussiness",
                    pipeline: [{
                        $project: {
                            brandLogo: 1,
                            title: 1,

                        }
                    }
                    ]
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
                    bussinessId: { $first: "$bussiness" },
                }
            },
            {
                $project: {
                    coverImages: 1,
                    title: 1,
                    address: 1,
                    dateTime: 1,
                    status: 1,
                    rating: 1,
                    reviewcount: 1,
                    bussinessId: 1,
                }
            }, { $sort: { _id: -1 } },
            { $skip: parseInt(startIndex) },
            { $limit: parseInt(limit) },
        ])

        if (!event) {
            throw new ApiError(500, `Something went wrong while fetching Event list`)
        } else if (event.length == 0) {
            throw new ApiError(404, `NO Data Found ! Event list is empty`)

        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, event, `Event List Fetched successfully`)
            )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Event`))
    }
})

const getMyEvent = asyncHandler(async (req, res) => {


    try {
        const event = await Event.aggregate([
            {
                $match: {
                    owner: new mongoose.Types.ObjectId(req.vendor._id)
                }
            }, {
                $lookup: {
                    from: "bussinesses",
                    localField: "bussinessId",
                    foreignField: "_id",
                    as: "bussiness",
                    pipeline: [{
                        $project: {
                            brandLogo: 1,
                            title: 1,

                        }
                    }
                    ]
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
                    bussinessId: { $first: "$bussiness" },

                }
            },
            {
                $project: {
                    coverImages: 1,
                    title: 1,
                    address: 1,
                    dateTime: 1,
                    status: 1,
                    rating: 1,
                    reviewcount: 1,
                    bussinessId: 1,
                }
            }
        ])
        if (!event) {
            throw new ApiError(500, `Something went wrong while fetching Event list`)
        } else if (event.length == 0) {
            throw new ApiError(404, `NO Data Found ! Event list is empty`)

        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, event, `Event List Fetched successfully`)
            )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Event`))
    }
})

const addAminities = asyncHandler(async (req, res) => {
    try {
        const { aminityId, eventId } = req.body

        if (!aminityId || !eventId) {
            throw new ApiError(400, `Aminity Id and Event Id are required`)
        }

        const activity = await Event.findByIdAndUpdate(
            eventId,
            {
                // $addToSet: { amenities: aminityId }
                $set: { amenities: aminityId }
            }, { new: true })

        if (!activity) {
            throw new ApiError(500, `Something went wrong while adding aminities list`)
        }

        return res.status(201).json(
            new ApiResponse(200, activity, `Aminities Added Successfully`)
        )

    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Event`))
    }
})

const addRules = asyncHandler(async (req, res) => {
    try {
        const { rules, eventId } = req.body

        if (!rules || !eventId) {
            throw new ApiError(400, `rules and Event Id are required`)
        }

        const rulelist = await Event.findByIdAndUpdate(
            eventId,
            {
                // $addToSet: { amenities: aminityId }
                $set: { rules: rules }
            }, { new: true })

        if (!rulelist) {
            throw new ApiError(500, `Something went wrong while adding Rules list`)
        }

        return res.status(201).json(
            new ApiResponse(200, rulelist, `Rules Added Successfully`)
        )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in add rules'))
    }

})

const getPackages = asyncHandler(async (req, res) => {
    try {
        const { eventId } = req.query

        if (!eventId) {
            throw new ApiError(400, `EventId is required`)
        }

        // const query = {}
        // query['_id'] = new mongoose.Types.ObjectId(eventId)
        // if (day && day != undefined) { query["slots.days"] = day };

        const slotlist = await Event.findById(eventId).select("packages")

        // const slotlist = await Event.aggregate([
        //     {
        //         $unwind: "$slots"
        //     },
        //     {
        //         $match: query
        //     },
        //     {
        //         $group: {
        //             _id: "$slots",
        //         }
        //     }
        // ])

        const slotdata = []
        slotlist.packages.forEach((element) => {
            slotdata.push(element);
        })

        if (slotdata.length == 0) {
            throw new ApiError(404, `Data Not Found ! list is empty`)
        }


        return res.status(201).json(
            new ApiResponse(200, slotdata, `Packages List Fetch Successfully`)
        )

    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in Activity Package'))
    }
})


const addPackage = asyncHandler(async (req, res) => {
    try {
        const { title, amount, forPeople, description, eventId } = req.body

        if (!title || !eventId || !amount) {
            throw new ApiError(400, `All fileds are required`)
        }

        const addPackage = await Event.findByIdAndUpdate(
            eventId,
            {
                $push: {
                    packages: {
                        title,
                        amount,
                        forPeople,
                        description,
                    }
                }

            }, { new: true })

        if (!addPackage) {
            throw new ApiError(500, `Something went wrong while add package`)
        }

        return res.status(201).json(
            new ApiResponse(200, addPackage, `Package Added Successfully`)
        )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in add Package'))
    }

})

const updatePackage = asyncHandler(async (req, res) => {
    try {
        const { Id, title, amount, forPeople, description, eventId } = req.body

        if (!Id || !eventId || !title || !amount) {
            throw new ApiError(400, `All fileds are required`)
        }
        const updatePackage = await Event.updateOne(
            { _id: eventId, 'packages._id': { $eq: Id } },
            {
                $set: {
                    "packages.$": {
                        _id:Id,
                        title,
                        amount,
                        forPeople,
                        description
                    }
                }

            }, { new: true })

        if (!updatePackage) {
            throw new ApiError(500, `Something went wrong while update Package`)
        }

        return res.status(201).json(
            new ApiResponse(200, updatePackage, `Package detail Updated Successfully`)
        )

    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in update Pakage'))
    }
})

const deletePackage = asyncHandler(async (req, res) => {
    try {
        const { Id, eventId } = req.query

        if (!Id || !eventId) {
            throw new ApiError(400, `All fileds are required`)
        }
        const deletePackage = await Event.updateOne(
            { _id: eventId },
            {
                $pull: {
                    packages: { _id: Id }
                }

            }, { new: true })

        if (!deletePackage) {
            throw new ApiError(500, `Something went wrong while delete Package`)
        }

        return res.status(201).json(
            new ApiResponse(200, deletePackage, `Package Deleted Successfully`)
        )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in delete Package'))
    }

})

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
    updateStatusEvent,
    deleteEvent,
    updateEventlogo,
    getMyEvent,
    addAminities,
    getPackages,
    addPackage,
    updatePackage,
    deletePackage,
    addRules,
}
