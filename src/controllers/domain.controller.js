// import mongoose, {isValidObjectId} from "mongoose"
import { Domain } from "../models/domain.model.js"
import { Coupon } from "../models/coupon.model.js"
import { Booking } from "../models/booking.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import fs from "fs"

const getAllCategory = asyncHandler(async (req, res) => {
    try {
        const { limit = 200, startIndex = 0, status } = req.query
        const type = req.path.split("/")[1];

        const query = {}
        query["type"] = type;
        if (status && status != undefined) { query["status"] = status } else { query["status"] = { $ne: "delete" } };

        const category = await Domain.find(query)
            .select("-type")
            .sort("-_id")
            .skip(startIndex)
            .limit(limit)
            .exec();

        if (!category) {
            throw new ApiError(500, `Something went wrong while fetching ${type}`)
        } else if (category.length == 0) {
            throw new ApiError(404, `NO Data Found ! ${type} list is empty`)
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, category, `${type} List Fetched successfully`)
            )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Domain`))
    }
})

const getActiveCategory = asyncHandler(async (req, res) => {
    try {
        const { limit = 200, startIndex = 0 } = req.query
        const type = req.path.split("/")[1];
        const category = await Domain.find({ type: type, status: 'active' })
            .select("-type")
            .sort("-_id")
            .skip(startIndex)
            .limit(limit)
            .exec();

        if (!category) {
            throw new ApiError(500, `Something went wrong while fetching ${type}`)
        } else if (category.length == 0) {
            throw new ApiError(404, `NO Data Found ! ${type} list is empty`)
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, category, `${type} List Fetched successfully`)
            )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Domain`))
    }
})

const addCategory = asyncHandler(async (req, res) => {
    try {
        const { title, description } = req.body
        const type = req.path.split("/")[1];
        const imageLocalPath = req.file?.filename
        // console.log(req.body)
        // console.log(req)
        if (!title) {
            throw new ApiError(400, `title is required`)
        }
        if (!imageLocalPath) {
            return res
                .status(400)
                .json(new ApiError(400, "image is missing"))
        }

        const existedDomain = await Domain.findOne({
            status: { $ne: "delete" },
            type: type,
            title: title
        })

        if (existedDomain) {
            throw new ApiError(409, `${type} with same title already exists`)
        }

        const domain = await Domain.create({
            title,
            description,
            image: imageLocalPath,
            type: type
        })

        const createdDomain = await Domain.findById(domain._id)

        if (!createdDomain) {
            throw new ApiError(500, `Something went wrong while Add ${type}`)
        }

        return res.status(201).json(
            new ApiResponse(200, createdDomain, `${type} Added Successfully`)
        )

    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Domain`))
    }
})

const getCategoryById = asyncHandler(async (req, res) => {

    try {
        const { Id } = req.query
        const type = req.path.split("/")[1];
        const createdDomain = await Domain.findById(Id)

        if (!createdDomain) {
            throw new ApiError(500, `Something went wrong while fetching ${type}`)
        }

        return res.status(201).json(
            new ApiResponse(200, createdDomain, `${type} fetched Successfully`)
        )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Domain`))
    }
})

const updateCategory = asyncHandler(async (req, res) => {
    try {
        const { domainId, title, description } = req.body
        const image = req.file?.filename
        const type = req.path.split("/")[1];

        if (!title) {
            image != '' && image != undefined ? fs.unlinkSync(`public/domainImages/${image}`) : null;
            throw new ApiError(400, `title is required`)
        }


        const existedDomain = await Domain.findOne({
            _id: { $ne: domainId },
            status: { $ne: "delete" },
            type: type,
            title: title
        })

        if (existedDomain) {
            image != '' && image != undefined ? fs.unlinkSync(`public/domainImages/${image}`) : null;
            throw new ApiError(409, `${type} with same title already exists`)
        }

        const domainImage = await Domain.findById(domainId).select("image");

        if (!domainImage) {

            throw new ApiError(400, `Invaild Id for ${type} details`)
        }

        if (image != '' && image != undefined && domainImage.image && domainImage.image != '') {
            if (fs.existsSync(`public/domainImages/${domainImage.image}`)) {
                fs.unlinkSync(`public/domainImages/${domainImage.image}`);
            }
        }
        const domain = await Domain.findByIdAndUpdate(
            domainId,
            {
                $set: {
                    title,
                    description,
                    image,
                    type
                }
            },
            { new: true }
        ).select("-type")

        if (!domain) {
            throw new ApiError(500, `Something went wrong while update ${type}`)
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, domain, `${type} updated successfully`)
            )

    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Domain`))
    }
})

const updateStatusCategory = asyncHandler(async (req, res) => {
    try {
        const { Id, status } = req.query
        const type = req.path.split("/")[1];
        if (!Id || !status) {
            throw new ApiError(400, `All fileds are required`)
        }

        const domain = await Domain.findByIdAndUpdate(
            Id,
            {
                $set: {
                    status: status
                }
            },
            { new: true }
        ).select("-type")

        if (!domain) {
            throw new ApiError(500, `Something went wrong while status update ${type}`)
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, domain, `${type} Status updated successfully`)
            )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Domain`))
    }
})

const deleteCategory = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})


const getAllCoupon = asyncHandler(async (req, res) => {
    try {
        const { limit = 200, startIndex = 0, status } = req.query
        const query = {}
        if (status && status != undefined) { query["status"] = status } else { query["status"] = { $ne: "delete" } };

        const coupon = await Coupon.find(query)
            .select()
            .sort("-_id")
            .skip(startIndex)
            .limit(limit)
            .exec();

        if (!coupon) {
            throw new ApiError(500, `Something went wrong while fetching Coupon`)
        } else if (coupon.length == 0) {
            throw new ApiError(404, `NO Data Found ! Coupon list is empty`)
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, coupon, `Coupon List Fetched successfully`)
            )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Coupon`))
    }
})

const getActiveCoupon = asyncHandler(async (req, res) => {
    try {
        const { limit = 200, startIndex = 0 } = req.query
        const coupon = await Coupon.find({ status: 'active', startDate: { $lte: new Date() }, endDate: { $gte: new Date() }, isVisible: true })
            .sort("-_id")
            .skip(startIndex)
            .limit(limit)
            .exec();

        if (!coupon) {
            throw new ApiError(500, `Something went wrong while fetching Coupon`)
        } else if (coupon.length == 0) {
            throw new ApiError(404, `NO Data Found ! Coupon list is empty`)
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, coupon, `Coupon List Fetched successfully`)
            )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Coupon`))
    }
})

const addCoupon = asyncHandler(async (req, res) => {
    try {
        const { title, code, startdate, enddate, disType, discount, minAmt, isVisible, desc, eventId, businessId } = req.body


        if (!title || !code || !startdate || !enddate || !disType || !discount || !minAmt) {
            throw new ApiError(400, `all fields are required`)
        }

        // const existedCoupon = await Coupon.findOne({
        //     status: { $ne: "delete" },
        //     type: type,
        //     title: title
        // })

        // if (existedCoupon) {
        //     throw new ApiError(409, `${type} with same title already exists`)
        // }

        const addcoupon = await Coupon.create({
            title,
            code,
            startdate,
            enddate,
            disType,
            discount,
            minAmt,
            isVisible,
            desc,
            eventId,
            businessId,
            owner: req.vendor?._id
        })

        if (!addcoupon) {
            throw new ApiError(500, `Something went wrong while Add Coupon`)
        }

        return res.status(201).json(
            new ApiResponse(200, addcoupon, `Coupon Added Successfully`)
        )

    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Coupon`))
    }
})

const getCouponByCode = asyncHandler(async (req, res) => {

    try {
        const { code, totalAmt } = req.query

        if (req.vendor?.usertype != 'user') {
            throw new ApiError(401, `Invaild userType! Only customer can use this`)
        }

        if (!code || !totalAmt ) {
            throw new ApiError(400, `Coupon code and totalAmt are required`)
        }

        const iscoupoVaild = await Coupon.findOne({code});

        if (!iscoupoVaild) {
            throw new ApiError(400, `Invaild Coupon Code! Please enter Vaild Code`)
        }

        const iscouponAct = await Coupon.findOne({ code: code, status: 'active', startDate: { $lte: new Date() }, endDate: { $gte: new Date() } });

        if (!iscouponAct) {
            throw new ApiError(503, `Coupon not Active! Please enter Vaild Code`)
        } else if (iscouponAct.minAmt > totalAmt) {
            throw new ApiError(503, `Minimum Order Value is ${iscouponAct.minAmt} For this coupon!`)
        }

        const isUsed = await Booking.findOne({couponId: iscouponAct._id,owner:req.vendor?._id});

        if (isUsed) {
            throw new ApiError(409, `This Coupon Already Used`)
        }
        
        const couponDtl = await Coupon.findOne({ code: code, status: 'active', startDate: { $lte: new Date() }, endDate: { $gte: new Date() } })

        if (!couponDtl) {
            throw new ApiError(500, `Something went wrong while fetching Coupon`)
        }

        return res.status(201).json(
            new ApiResponse(200, couponDtl, `Coupon fetched Successfully`)
        )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Coupon`))
    }
})

const updateCoupon = asyncHandler(async (req, res) => {
    try {
        const { Id, title, code, startdate, enddate, disType, discount, minAmt, isVisible, desc, eventId, businessId, status } = req.body

        if (!title || !code || !startdate || !enddate || !disType || !discount || !minAmt) {
            throw new ApiError(400, `all fields are required`)
        }

        // const existedCoupon = await Coupon.findOne({
        //     _id: { $ne: domainId },
        //     status: { $ne: "delete" },
        //     type: type,
        //     title: title
        // })

        // if (existedCoupon) {
        //     image != '' && image != undefined ? fs.unlinkSync(`public/domainImages/${image}`) : null;
        //     throw new ApiError(409, `${type} with same title already exists`)
        // }


        const updateCoupon = await Coupon.findByIdAndUpdate(
            Id,
            {
                $set: {
                    title,
                    code,
                    startdate,
                    enddate,
                    disType,
                    discount,
                    minAmt,
                    isVisible,
                    desc,
                    eventId,
                    businessId,
                    status
                }
            },
            { new: true }
        )

        if (!updateCoupon) {
            throw new ApiError(500, `Something went wrong while update Coupon`)
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, updateCoupon, `Coupon updated successfully`)
            )

    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Coupon`))
    }
})

const updateStatusCoupon = asyncHandler(async (req, res) => {
    try {
        const { Id, status } = req.query
        if (!Id || !status) {
            throw new ApiError(400, `Id and Status are required`)
        }

        const domain = await Coupon.findByIdAndUpdate(
            Id,
            {
                $set: {
                    status: status
                }
            },
            { new: true }
        )

        if (!domain) {
            throw new ApiError(500, `Something went wrong while status update Coupon`)
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, domain, `Coupon Status updated successfully`)
            )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Coupon`))
    }
})

export {
    getAllCategory,
    getActiveCategory,
    addCategory,
    getCategoryById,
    updateCategory,
    updateStatusCategory,
    deleteCategory,
    getAllCoupon,
    getActiveCoupon,
    addCoupon,
    getCouponByCode,
    updateCoupon,
    updateStatusCoupon,

}
