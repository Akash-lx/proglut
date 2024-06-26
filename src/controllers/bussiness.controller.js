import mongoose, { isValidObjectId } from "mongoose"
import { Bussiness } from "../models/bussiness.model.js"
// import {User} from "../models/user.model.js"
import { Review } from "../models/reviews.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import fs from "fs"
import SendSms from "../utils/SendSms.js"
import Sendmail from "../utils/Sendmail.js"

const addBussinessInfo = asyncHandler(async (req, res) => {
    try {
        const { title, city, state, street, area, pincode, latitude, longitude, fullAddress, category } = req.body

        if (!title || !category) {
            throw new ApiError(400, "title and category are required")
        }

        const existedBussiness = await Bussiness.findOne({
            domain: category,
            title: title,
            owner: req.vendor._id,
        })

        if (existedBussiness) {
            throw new ApiError(409, `Bussiness with same title of same category already exists`)
        }

        const prvendor = await Bussiness.findOne().sort({ _id: -1 }).select('uniqCode').exec();
        let uniqCode = '';
        if (prvendor?.uniqCode) {
            let codes = prvendor.uniqCode.substring(9)
            let datef = new Date().toISOString().slice(2, 10).replace(/-/g, "");
            //    console.log(codes);
            uniqCode = `PGB${datef}${(parseInt(codes) + 1).toLocaleString(undefined, { useGrouping: false, minimumIntegerDigits: 4 })}`;
        } else {
            let codes = 1;
            let datef = new Date().toISOString().slice(2, 10).replace(/-/g, "");
            uniqCode = `PGB${datef}${(parseInt(codes)).toLocaleString(undefined, { useGrouping: false, minimumIntegerDigits: 4 })}`;
        }
        // console.log(uniqCode);
        const bussiness = await Bussiness.create({
            uniqCode,
            title,
            address: {
                city, state, street, area, pincode, latitude, longitude, fullAddress
            },
            domain: category,
            owner: req.vendor._id,
        })

        const createdBussiness = await Bussiness.findById(bussiness._id)

        if (!createdBussiness) {
            throw new ApiError(500, `Something went wrong while adding`)

        }

        let msg = `Hi ${req.vendor.fullName},\n\nYour registration for ${createdBussiness.title} on PROGLUT is currently pending review. We're working diligently to process your request. Rest assured, we'll notify you once your business is live and ready for customers.\n\nThank you for your patience! If you have any questions or need assistance, don't hesitate to contact us on +917999845114\n\nBest regards,\nPROGLUT Team`;
        let msgId = "1707171507663477884";

        const msgSend = await SendSms(msg, msgId, req.vendor.mobile);

        if (msgSend) {
            if (msgSend.return == false) {
                throw new ApiError(500, msgSend.message[0])
            }
        }

        let subject = "Bussiness Registered Successfully";
        let body = `<body>
<section>
    <div class="row">
        <p>
        Hi ${req.vendor.fullName},<br><br>Your registration for ${createdBussiness.title} on PROGLUT is currently pending review. We're working diligently to process your request. Rest assured, we'll notify you once your business is live and ready for customers.<br><br>Thank you for your patience! If you have any questions or need assistance, don't hesitate to contact us on +917999845114<br><br>Best regards,<br>PROGLUT Team
        </p>
    </div>
    
    
</section>
</body>`;
        const mailsend = await Sendmail(req.vendor.email, subject, body)

        // console.log(msgSend);

        return res.status(201).json(
            new ApiResponse(200, createdBussiness, `bussiness Added Successfully`)
        )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in AddBussiness'))
    }

})

const getBussinessById = asyncHandler(async (req, res) => {

    try {
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
                    uniqCode: 1,
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
                    bussinessHour: 1,
                    amenities_list: 1,
                    owner: 1,
                }
            }
        ])

        return res.status(201).json(
            new ApiResponse(200, bussiness, `bussiness fetched Successfully`)
        )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in Bussiness by id'))
    }
})

const updateBussinessInfo = asyncHandler(async (req, res) => {
    try {

        const { Id, title, city, state, street, area, pincode, latitude, longitude, fullAddress, category, description } = req.body

        if (!title || !category) {
            throw new ApiError(400, "title and category are required")
        }

        const existedBussiness = await Bussiness.findOne({
            _id: { $ne: Id },
            domain: category,
            owner: req.vendor._id,
            title: title
        })

        if (existedBussiness) {
            throw new ApiError(409, `Bussiness with same title of same category already exists`)
        }


        const bussiness = await Bussiness.findByIdAndUpdate(
            Id,
            {
                $set: {
                    title,
                    address: {
                        city, state, street, area, pincode, latitude, longitude, fullAddress
                    },
                    // domain: category,
                    description,
                }
            },
            { new: true }
        ).select()

        if (!bussiness) {
            throw new ApiError(500, `Something went wrong while update bussiness info`)
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, bussiness, `bussiness updated successfully`)
            )

    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in Bussiness update'))
    }
})

const updateBussinesslogo = asyncHandler(async (req, res) => {
    try {
        const { Id, description } = req.body

        if (!Id) {
            throw new ApiError(400, "Id is required")
        }

        const bussinessImages = await Bussiness.findById(Id).select("brandLogo coverImage");
        const setquey = {}

        if (!bussinessImages) {
            throw new ApiError(400, "Invaild Id for Bussiness Detail")
        }

        setquey['description'] = description;
        if (req.files.brandLogo) {
            //  let brandLogoFile = req.files?.brandLogo[0]?.filename;
            if (bussinessImages.brandLogo && bussinessImages.brandLogo != '') {
                if (fs.existsSync(`public/bussinessImages/${bussinessImages.brandLogo}`)) {
                    fs.unlinkSync(`public/bussinessImages/${bussinessImages.brandLogo}`);
                }
            }
            setquey['brandLogo'] = req.files?.brandLogo[0]?.filename;
        }

        if (req.files?.coverImage) {
            //  let brandLogoFile = req.files?.brandLogo[0]?.filename;
            if (bussinessImages.coverImage && bussinessImages.coverImage != '') {

                if (fs.existsSync(`public/bussinessImages/${bussinessImages.coverImage}`)) {
                    fs.unlinkSync(`public/bussinessImages/${bussinessImages.coverImage}`);
                }
            }
            setquey['coverImage'] = req.files?.coverImage[0]?.filename;
        }


        const bussiness = await Bussiness.findByIdAndUpdate(
            Id,
            {
                $set: setquey
            },
            { new: true }
        )

        if (!bussiness) {
            throw new ApiError(500, `Something went wrong while update bussiness info`)
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, bussiness, `bussiness logo updated successfully`)
            )

    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in Bussiness logo update'))
    }
})

const updateStatusBussiness = asyncHandler(async (req, res) => {
    try {
        const { Id, status } = req.query
        if (!Id || !status) {
            throw new ApiError(400, "Id and status are required")
        }

        const prevBussi = status == 'active' ? await Bussiness.findById(Id).populate('owner', 'fullName mobile email').exec() : "";


        const bussiness = await Bussiness.findByIdAndUpdate(
            Id,
            {
                $set: {
                    status: status
                }
            },
            { new: true }
        ).select()

        if (!bussiness) {
            throw new ApiError(500, `Something went wrong while adding`)
        }

        if (status == 'active') {
            if (prevBussi.status == 'pending') {
                let msg = `Hi ${prevBussi.owner.fullName},\n\nWelcome on board ! Your business, ${prevBussi.title}, has been successfully verified on PROGLUT. Your services are now accessible to our users. You may now showcase your offerings to attract more customers. Call us for more details on +917999845114\n\nBest regards,\nPROGLUT Team`;
                let msgId = "1707171507653266568";

                const msgSend = await SendSms(msg, msgId, prevBussi.owner.mobile);
                // console.log(msg)
                if (msgSend) {
                    if (msgSend.return == false) {
                        throw new ApiError(500, msgSend.message[0])
                    }
                }

                let subject = "Bussiness Verified Successfully";
                let body = `<body>
    <section>
    <div class="row">
    <p>
    Hi ${prevBussi.owner.fullName},<br><br>Welcome on board ! Your business, ${prevBussi.title}, has been successfully verified on PROGLUT. Your services are now accessible to our users. You may now showcase your offerings to attract more customers. Call us for more details on +917999845114<br><br>Best regards,<br>PROGLUT Team
    </p>
    </div>
    
    
    </section>
    </body>`;
                // console.log(body)
                const mailsend = await Sendmail(prevBussi.owner.email, subject, body)

            }
        }



        return res
            .status(200)
            .json(
                new ApiResponse(200, bussiness, `bussiness Status updated successfully`)
            )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in Bussiness status'))
    }
})


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

const getAllBussinessList = asyncHandler(async (req, res) => {
    try {
        const { domain, vendorId, status, activityId } = req.query

        const query = {}
        if (domain && domain != undefined) { query["domain"] = new mongoose.Types.ObjectId(domain) };
        if (vendorId && vendorId != undefined) { query["owner"] = new mongoose.Types.ObjectId(vendorId) };
        if (status && status != undefined) { query["status"] = status } else { query["status"] = { $ne: "delete" } };
        if (activityId && activityId != undefined) { query["bussactivity.activityId"] = new mongoose.Types.ObjectId(activityId) };

        // console.log(query);
        const bussiness = await Bussiness.aggregate([

            {
                $lookup: {
                    from: "activities",
                    localField: "_id",
                    foreignField: "bussinessId",
                    as: "bussactivity",

                }
            },
            {
                $match: query
            },
            {
                $project: {
                    uniqCode: 1,
                    title: 1,
                }
            },
        ])

        if (!bussiness) {
            throw new ApiError(500, `Something went wrong while fetching Bussiness list`)
        } else if (bussiness.length == 0) {
            throw new ApiError(404, `NO Data Found ! Bussiness list is empty`)

        }

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

const getAllBussiness = asyncHandler(async (req, res) => {
    try {
        const { limit = 200, startIndex = 0, domain, vendorId, status, activityId, state, city, fromDate, toDate } = req.query

        const query = {}
        if (domain && domain != undefined) { query["domain"] = new mongoose.Types.ObjectId(domain) };
        if (vendorId && vendorId != undefined) { query["owner"] = new mongoose.Types.ObjectId(vendorId) };
        if (status && status != undefined) { query["status"] = status } else { query["status"] = { $ne: "delete" } };
        if (state && state != undefined) { query["address.state"] = { $regex: `.*${state}.*`, $options: 'i' } };
        if (city && city != undefined) { query["address.city"] = { $regex: `.*${city}.*`, $options: 'i' } };
        if (fromDate && toDate && fromDate != undefined && toDate != undefined) { query["createdAt"] = { "$gte": new Date(fromDate), "$lte": new Date(toDate) } };
        if (activityId && activityId != undefined) { query["bussactivity.activityId"] = new mongoose.Types.ObjectId(activityId) };
        // if (activityId && activityId != undefined) { query["bussactivity.slots.rate"] = new mongoose.Types.ObjectId(activityId) };

        // console.log(query);
        const bussiness = await Bussiness.aggregate([

            {
                $lookup: {
                    from: "activities",
                    localField: "_id",
                    foreignField: "bussinessId",
                    as: "bussactivity",

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
                    uniqCode: 1,
                    coverImage: 1,
                    brandLogo: 1,
                    title: 1,
                    address: 1,
                    status: 1,
                    rating: { $toDouble: "$rating" },
                    reviewcount: 1,
                    owner: 1,
                    domain: 1,
                    createdAt: 1,
                }
            }, { $sort: { _id: -1 } },
            { $skip: parseInt(startIndex) },
            { $limit: parseInt(limit) },
        ])

        if (!bussiness) {
            throw new ApiError(500, `Something went wrong while fetching Bussiness list`)
        } else if (bussiness.length == 0) {
            throw new ApiError(404, `NO Data Found ! Bussiness list is empty`)

        }

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

const getActiveBussiness = asyncHandler(async (req, res) => {

    try {
        const { limit = 200, startIndex = 0, domain, vendorId, activityId, state, city } = req.query

        const query = {}
        if (domain && domain != undefined) { query["domain"] = new mongoose.Types.ObjectId(domain) };
        if (vendorId && vendorId != undefined) { query["owner"] = new mongoose.Types.ObjectId(vendorId) };
        if (state && state != undefined) { query["address.state"] = { $regex: `.*${state}.*`, $options: 'i' } };
        if (city && city != undefined) { query["address.city"] = { $regex: `.*${city}.*`, $options: 'i' } };
        if (activityId && activityId != undefined) { query["bussactivity.activityId"] = new mongoose.Types.ObjectId(activityId) };
        // if (activityId && activityId != undefined) { query["bussactivity.slots.rate"] = new mongoose.Types.ObjectId(activityId) };

        query["status"] = "active";
        // console.log(query);
        const bussiness = await Bussiness.aggregate([

            {
                $lookup: {
                    from: "activities",
                    localField: "_id",
                    foreignField: "bussinessId",
                    as: "bussactivity",
                    pipeline: [{
                        $lookup: {
                            from: "slots",
                            localField: "_id",
                            foreignField: "busActId",
                            as: "slots"
                        },
                    },
                    {
                        $unwind: "$slots" // Unwind the startingAt array to work with its elements
                    },
                    {
                        $group: {
                            _id: "$_id",
                            minRate: { $min: "$slots.rate" } // Get the minimum rate from the startingAt array
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            minRate: 1
                        }
                    }

                    ]
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
                    startingAt: { $first: "$bussactivity.minRate" },
                }
            },
            {
                $match: query
            },
            {
                $project: {
                    uniqCode: 1,
                    coverImage: 1,
                    brandLogo: 1,
                    title: 1,
                    address: 1,
                    status: 1,
                    rating: { $toDouble: "$rating" },
                    reviewcount: 1,
                    startingAt: 1,
                }
            }, { $sort: { _id: -1 } },
            { $skip: parseInt(startIndex) },
            { $limit: parseInt(limit) },
        ])

        if (!bussiness) {
            throw new ApiError(500, `Something went wrong while fetching Bussiness list`)
        } else if (bussiness.length == 0) {
            throw new ApiError(404, `NO Data Found ! Bussiness list is empty`)

        }

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

const getMyBussiness = asyncHandler(async (req, res) => {

    try {
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
                    uniqCode: 1,
                    coverImage: 1,
                    brandLogo: 1,
                    title: 1,
                    address: 1,
                    status: 1,
                    rating: { $toDouble: "$rating" },
                    reviewcount: 1,
                }
            }
        ])

        if (!bussiness) {
            throw new ApiError(500, `Something went wrong while fetching Bussiness list`)
        } else if (bussiness.length == 0) {
            throw new ApiError(404, `No Data Found ! bussiness list is empty`)

        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, bussiness, `bussiness List Fetched successfully`)
            )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in My Bussiness'))
    }
})


const addAminities = asyncHandler(async (req, res) => {
    try {
        const { aminityId, bussinessId } = req.body

        if (!aminityId || !bussinessId) {
            throw new ApiError(400, `Aminity Id and Bussiness Id are required`)
        }

        const activity = await Bussiness.findByIdAndUpdate(
            bussinessId,
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
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in add Aminities'))
    }

})

const addRules = asyncHandler(async (req, res) => {
    try {
        const { rules, bussinessId } = req.body

        if (!rules || !bussinessId) {
            throw new ApiError(400, `rules and Bussiness Id are required`)
        }

        const rulelist = await Bussiness.findByIdAndUpdate(
            bussinessId,
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

const getGallery = asyncHandler(async (req, res) => {
    try {
        const { bussinessId } = req.query

        if (!bussinessId) {
            throw new ApiError(400, `BussinessId is required`)
        }

        const gallerylist = await Bussiness.findById(bussinessId).select("gallery")

        const gallerydata = []
        gallerylist.gallery.forEach((element) => {
            gallerydata.push(element);
        })

        if (gallerydata.length == 0) {
            throw new ApiError(404, `Data Not Found ! list is empty`)
        }


        return res.status(201).json(
            new ApiResponse(200, gallerydata, `Gallery List Fetch Successfully`)
        )

    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in Activity Gallery'))
    }
})


const addGallery = asyncHandler(async (req, res) => {
    try {
        const { title, bussinessId } = req.body

        if (!bussinessId) {
            throw new ApiError(400, `BussinessId is required`)
        }

        const imagearr = [];
        req.files.map((item, index) => {
            // console.log(item.filename);
            const galey = {};
            if (title && title[index]) { galey['title'] = title[index]; }
            galey['image'] = item.filename;
            imagearr.push(galey);
        });
        if (imagearr.length == 0) {
            throw new ApiError(400, `Images are required`)
        }

        const addGallery = await Bussiness.findByIdAndUpdate(
            bussinessId,
            {
                $push: {
                    gallery: imagearr
                }

            }, { new: true })

        if (!addGallery) {
            throw new ApiError(500, `Something went wrong while add package`)
        }

        return res.status(201).json(
            new ApiResponse(200, addGallery, `Gallery Added Successfully`)
        )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in add Gallery'))
    }

})


const deleteGallery = asyncHandler(async (req, res) => {
    try {
        const { Id, bussinessId } = req.query

        if (!Id || !bussinessId) {
            throw new ApiError(400, `BussinessId and Id are required`)
        }


        const galleryImages = await Bussiness.aggregate([
            {
                $unwind: "$gallery"
            },
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(bussinessId),
                    "gallery._id": new mongoose.Types.ObjectId(Id)
                }
            },
            {
                $group: {
                    _id: "$gallery.image",
                }
            }
        ])

        if (galleryImages && galleryImages[0]._id) {
            if (fs.existsSync(`public/galleryImages/${galleryImages[0]._id}`)) {
                fs.unlinkSync(`public/galleryImages/${galleryImages[0]._id}`);
            }

        }

        const deleteGallery = await Bussiness.updateOne(
            { _id: bussinessId },
            {
                $pull: {
                    gallery: { _id: Id }
                }

            }, { new: true })

        if (!deleteGallery) {
            throw new ApiError(500, `Something went wrong while delete Gallery`)
        }

        return res.status(201).json(
            new ApiResponse(200, deleteGallery, `Gallery Deleted Successfully`)
        )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in delete Gallery'))
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

const addBussinessHour = asyncHandler(async (req, res) => {
    try {
        const { title, days, startTime, endTime, bussinessId } = req.body

        if (!days || !bussinessId || !startTime || !endTime) {
            throw new ApiError(400, `All fileds are required`)
        }

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

        if (!addBussinessHour) {
            throw new ApiError(500, `Something went wrong while fetching Bussiness hours list`)
        }

        return res.status(201).json(
            new ApiResponse(200, addBussinessHour, `Bussiness Hour Added Successfully`)
        )

    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in add Bussinesshour'))
    }
})

const updateBussinessHour = asyncHandler(async (req, res) => {
    try {
        const { Id, title, days, startTime, endTime, bussinessId } = req.body

        if (!Id || !days || !bussinessId || !startTime || !endTime) {
            throw new ApiError(400, `All fileds are required`)
        }
        const updateBussinessHour = await Bussiness.updateOne(
            { _id: bussinessId, 'bussinessHour._id': { $eq: Id } },
            {
                $set: {
                    "bussinessHour.$": {
                        _id: Id,
                        title,
                        days,
                        startTime,
                        endTime,
                    }
                }

            }, { new: true })

        if (!updateBussinessHour) {
            throw new ApiError(500, `Something went wrong while update Bussiness hours list`)
        }

        return res.status(201).json(
            new ApiResponse(200, updateBussinessHour, `Bussiness Hour Added Successfully`)
        )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in update Bussinesshour'))
    }

})

const deleteBussinessHour = asyncHandler(async (req, res) => {
    try {
        const { Id, bussinessId } = req.query

        if (!Id || !bussinessId) {
            throw new ApiError(400, `All fileds are required`)
        }
        const deleteBussinessHour = await Bussiness.updateOne(
            { _id: bussinessId },
            {
                $pull: {
                    bussinessHour: { _id: Id }
                }

            }, { new: true })

        if (!deleteBussinessHour) {
            throw new ApiError(500, `Something went wrong while delete Bussiness hours list`)
        }

        return res.status(201).json(
            new ApiResponse(200, deleteBussinessHour, `Bussiness Hour Deleted Successfully`)
        )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in delete Bussinesshour'))
    }

})


const deleteBussiness = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const getReviews = asyncHandler(async (req, res) => {
    try {
        const { limit = 200, startIndex = 0, bussinessId, eventId } = req.query

        const query = {}
        if (bussinessId && bussinessId != undefined) { query["bussinessId"] = new mongoose.Types.ObjectId(bussinessId) };
        if (eventId && eventId != undefined) { query["eventId"] = new mongoose.Types.ObjectId(eventId) };

        const review = await Review.find(query)
        .populate("owner","fullName mobile profileImage usertype status")
        .populate("bussinessId","uniqCode brandLogo title")
        .populate("eventId","uniqCode title hostName")
        .select("-__v").sort({_id:-1}).skip(startIndex).limit(limit).exec();
          
        // const review = await Review.aggregate([
        //     {
        //         $match: query
        //     },
        //     {
        //         $lookup: {
        //             from: "vendors",
        //             localField: "owner",
        //             foreignField: "_id",
        //             as: "owner",
        //             pipeline: [{
        //                 $project: {
        //                     fullName: 1,
        //                     mobile: 1,
        //                     profileImage: 1,
        //                     usertype: 1,
        //                     status: 1,
        //                 }
        //             }
        //             ]
        //         }
        //     }, {
        //         $project: {
        //             rating: 1,
        //             content: 1,
        //             owner: 1,
        //         }
        //     },
        //     { $sort: { _id: -1 } },
        //     { $skip: parseInt(startIndex) },
        //     { $limit: parseInt(limit) },
        // ])

        if (!review) {
            throw new ApiError(500, `Something went wrong while fetching Review`)
        } else if (review.length == 0) {
            throw new ApiError(404, `NO Data Found ! Review list is empty`)
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, review, `review List Fetched successfully`)
            )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in get reviews'))
    }
})

const addReview = asyncHandler(async (req, res) => {
    try {
        const { rating, content, bussinessId, eventId } = req.body

        if (!rating) {
            throw new ApiError(400, `Rating is required`)
        }
        if (!bussinessId && !eventId) {
            throw new ApiError(400, `BussinessId Or EventId is required`)
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
            throw new ApiError(500, `Something went wrong while adding review`)
        }

        return res.status(201).json(
            new ApiResponse(200, createdReview, `Review Added Successfully`)
        )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in add review'))
    }

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
    addReview,
    addRules,
    getGallery,
    addGallery,
    deleteGallery,
    getAllBussinessList,
}
