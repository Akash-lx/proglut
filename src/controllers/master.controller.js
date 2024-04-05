// import mongoose, {isValidObjectId} from "mongoose"
import { Master } from "../models/master.model.js"
import { ApplicationSetting } from "../models/application.model.js"
// import {User} from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import fs from "fs"

const getAllMaster = asyncHandler(async (req, res) => {
    try {
        const { limit = 200, startIndex = 0,status } = req.query
        const type = req.path.split("/")[1];

        const query = {}
        query["type"] = type;
       if (status && status != undefined) { query["status"] = status }else { query["status"] = {$ne:"delete"}};

        const master = await Master.find(query)
            .select("-type")
            .sort("-_id")
            .skip(startIndex)
            .limit(limit)
            .exec();

            if (!master) {
                throw new ApiError(500, `Something went wrong while fetching ${type}`)
            } else if (master.length == 0) {
                throw new ApiError(404,  `NO Data Found ! ${type} list is empty`)
             }

        return res
            .status(200)
            .json(
                new ApiResponse(200, master, `${type} List Fetched successfully`)
            )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Master`))
    }
})

const getActiveMaster = asyncHandler(async (req, res) => {

    try {
        const { limit = 200, startIndex = 0 } = req.query
        const type = req.path.split("/")[1];
        const master = await Master.find({ type: type, status: 'active' })
            .select("-type")
            .sort("-_id")
            .skip(startIndex)
            .limit(limit)
            .exec();

            if (!master) {
                throw new ApiError(500, `Something went wrong while fetching ${type}`)
            } else if (master.length == 0) {
                throw new ApiError(404,  `NO Data Found ! ${type} list is empty`)
             }

        return res
            .status(200)
            .json(
                new ApiResponse(200, master, `${type} List Fetched successfully`)
            )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Master`))
    }
})

const addMaster = asyncHandler(async (req, res) => {
    try {
        const { title, description } = req.body
        const type = req.path.split("/")[1];

        if (!title) {
            throw new ApiError(400, `title is required`)
        }

        const existedMaster = await Master.findOne({
            type: type,
            title: title
        })

        if (existedMaster) {

            throw new ApiError(409, `${type} with same title already exists`)
        }

        const master = await Master.create({
            title,
            description,
            type: type
        })

        const createdMaster = await Master.findById(master._id)

        if (!createdMaster) {
            throw new ApiError(500, `Something went wrong while adding ${type}`)
        }

        return res.status(201).json(
            new ApiResponse(200, createdMaster, `${type} Added Successfully`)
        )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Master`))
    }

})

const getMasterById = asyncHandler(async (req, res) => {

    try {
        const { Id } = req.query
        const type = req.path.split("/")[1];
        const createdMaster = await Master.findById(Id)

        if (!createdMaster) {
            throw new ApiError(500, `Something went wrong while fetching ${type}`)
        }

        return res.status(201).json(
            new ApiResponse(200, createdMaster, `${type} fetched Successfully`)
        )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Master`))
    }
})

const updateMaster = asyncHandler(async (req, res) => {
    try {
        const { Id, title, description } = req.body
        const type = req.path.split("/")[1];


        if (!title || !Id) {
            throw new ApiError(400, `Id and title are required`)
        }


        const existedMaster = await Master.findOne({
            _id: { $ne: Id },
            type: type,
            title: title
        })

        if (existedMaster) {

            throw new ApiError(409, `${type} with same title already exists`)
        }

        const master = await Master.findByIdAndUpdate(
            Id,
            {
                $set: {
                    title,
                    description,
                    type
                }
            },
            { new: true }
        ).select("-type")

        if (!master) {
            throw new ApiError(500, `Something went wrong while update ${type}`)
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, master, `${type} updated successfully`)
            )

    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Master`))
    }
})

const updateStatusMaster = asyncHandler(async (req, res) => {
    try {
        const { Id, status } = req.query
        const type = req.path.split("/")[1];
        if (!Id || !status) {
            throw new ApiError(400, `Id and status are required`)
        }

        const master = await Master.findByIdAndUpdate(
            Id,
            {
                $set: {
                    status: status
                }
            },
            { new: true }
        ).select("-type")

        if (!master) {
            throw new ApiError(500, `Something went wrong while update status ${type}`)
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, master, `${type} Status updated successfully`)
            )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Master`))
    }
})

const deleteMaster = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})


const getApplicationSetting = asyncHandler(async (req, res) => {

    try {
        const applicationData = await ApplicationSetting.findOne()

        if (!applicationData) {
            throw new ApiError(500, `Something went wrong while fetching Application setting`)
        }

        return res.status(201).json(
            new ApiResponse(200, applicationData, `Application Setting fetched Successfully`)
        )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Master`))
    }
})

const updateApplicationSetting = asyncHandler(async (req, res) => {
    try {
        const { Id, name, title, email, mobile, city, state, street, area, pincode, latitude, longitude, keywords, description, socialLinks, termsConditions, privacyPolicy, helpSupport } = req.body

        if (!Id) {
            throw new ApiError(400, `Id is required`)
        }

        const application = await ApplicationSetting.findByIdAndUpdate(
            Id,
            {
                $set: {
                    name,
                    title,
                    address: {
                        city,
                        state,
                        street,
                        area,
                        pincode,
                        latitude,
                        longitude
                    },
                    mobile,
                    email,
                    keywords,
                    description,
                    socialLinks,
                    termsConditions,
                    privacyPolicy,
                    helpSupport,
                }
            },
            { new: true }

        )

        if (!application) {
            throw new ApiError(500, `Something went wrong while updating application setting`)
        }
        return res
            .status(200)
            .json(new ApiResponse(200, application, `Application details updated successfully`))
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Master`))
    }
});

const uploadfileSetting = asyncHandler(async (req, res) => {
    try {
        const { Id, } = req.body

        if (!Id) {
            throw new ApiError(400, `Id is required`)
        }

        const iconFile = req.files?.icon ? req.files?.icon[0]?.filename : "";
        const logoFile = req.files?.logo ? req.files?.logo[0]?.filename : "";
        const bannerFile = req.files?.banner ? req.files?.banner[0]?.filename : "";

        const settingImages = await ApplicationSetting.findById(Id).select("icon logo banner");
        const setquey = {}

        if (iconFile != '' && settingImages.icon && settingImages.icon != '') {
            fs.unlinkSync(`public/adminImages/${settingImages.icon}`);
        }
        if (logoFile != '' && settingImages.logo && settingImages.logo != '') {
            fs.unlinkSync(`public/adminImages/${settingImages.logo}`);
        }
        if (bannerFile != '' && settingImages.banner && settingImages.banner != '') {
            fs.unlinkSync(`public/adminImages/${settingImages.banner}`);
        }


        if (iconFile && iconFile != '' && iconFile != undefined) { setquey["icon"] = iconFile };
        if (logoFile && logoFile != '' && logoFile != undefined) { setquey["logo"] = logoFile };
        if (bannerFile && bannerFile != '' && bannerFile != undefined) { setquey["banner"] = bannerFile };


        const bussiness = await ApplicationSetting.findByIdAndUpdate(
            Id,
            {
                $set: setquey
            },
            { new: true }
        ).select()

        if (!bussiness) {
            throw new ApiError(500, `Something went wrong while updating application setting`)
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, bussiness, `Setting logo updated successfully`)
            )

    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || `Server Error in Master`))
    }
})

export {
    getAllMaster,
    getActiveMaster,
    addMaster,
    getMasterById,
    updateMaster,
    updateStatusMaster,
    deleteMaster,
    updateApplicationSetting,
    uploadfileSetting,
    getApplicationSetting,
}
