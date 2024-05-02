import mongoose, { isValidObjectId } from "mongoose"
import { Master } from "../models/master.model.js"
import { ApplicationSetting } from "../models/application.model.js"
import { Complaint } from "../models/complaint.model.js"
import { Notification } from "../models/notification.model.js"
// import {User} from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import fs from "fs"

const getAllMaster = asyncHandler(async (req, res) => {
    try {
        const { limit = 200, startIndex = 0, status } = req.query
        const type = req.path.split("/")[1];

        const query = {}
        query["type"] = type;
        if (status && status != undefined) { query["status"] = status } else { query["status"] = { $ne: "delete" } };

        const master = await Master.find(query)
            .select("-type")
            .sort("-_id")
            .skip(startIndex)
            .limit(limit)
            .exec();

        if (!master) {
            throw new ApiError(500, `Something went wrong while fetching ${type}`)
        } else if (master.length == 0) {
            throw new ApiError(404, `NO Data Found ! ${type} list is empty`)
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
            throw new ApiError(404, `NO Data Found ! ${type} list is empty`)
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
            status: { $ne: "delete" },
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
            status: { $ne: "delete" },
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

const addImageMaster = asyncHandler(async (req, res) => {
    try {
        const { title = "", description } = req.body
        const image = req.file?.filename
        const type = req.path.split("/")[1];

        if (!image) {
            throw new ApiError(400, `Image is required`)
        }

        const master = await Master.create({
            title,
            description,
            image,
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

const updateImageMaster = asyncHandler(async (req, res) => {
    try {
        const { Id, title, description } = req.body
        const image = req.file?.filename
        const type = req.path.split("/")[1];

        if (!image) {
            throw new ApiError(400, `Image is required`)
        }


        if (!Id) {
            image != '' && image != undefined ? fs.unlinkSync(`public/domainImages/${image}`) : null;
            throw new ApiError(400, `Id is required`)
        }

        const masterImage = await Master.findById(Id).select("image");

        if (!masterImage) {

            throw new ApiError(400, `Invaild Id for ${type} details`)
        }

        if (image != '' && image != undefined && masterImage.image && masterImage.image != '') {
            if (fs.existsSync(`public/domainImages/${masterImage.image}`)) {
                fs.unlinkSync(`public/domainImages/${masterImage.image}`);
            }
        }

        const master = await Master.findByIdAndUpdate(
            Id,
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

const getComplaints = asyncHandler(async (req, res) => {
    try {
        const { limit = 200, startIndex = 0, bussinessId, eventId, status } = req.query

        const query = {}
        if (bussinessId && bussinessId != undefined) { query["bussinessId"] = new mongoose.Types.ObjectId(bussinessId) };
        if (eventId && eventId != undefined) { query["eventId"] = new mongoose.Types.ObjectId(eventId) };
        if (status && status != undefined) { query["status"] = status };


        const complaint = await Complaint.find(query).populate("owner", "fullName mobile profileImage usertype status")
            .populate({ path: "bussinessId", select: "uniqCode title", populate: { path: "owner", select: "fullName mobile" } })
            .populate({ path: "eventId", select: "uniqCode title", populate: { path: "owner", select: "fullName mobile" } })
            .sort({ _id: -1 }).limit(limit).skip(startIndex).exec();

        // const complaint = await Complaint.aggregate([
        //     {
        //         $match: {
        //             status,
        //             $or: [{ bussinessId: new mongoose.Types.ObjectId(bussinessId) }, { eventId: new mongoose.Types.ObjectId(eventId) }]
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: "vendors",
        //             localField: "owner",
        //             foreignField: "_id",
        //             as: "Customer",
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

        //             content: 1,
        //             Customer: 1,
        //         }
        //     },
        //     { $sort: { _id: -1 } },
        //     { $skip: parseInt(startIndex) },
        //     { $limit: parseInt(limit) },
        // ])

        if (!complaint) {
            throw new ApiError(500, `Something went wrong while fetching Complaint`)
        } else if (complaint.length == 0) {
            throw new ApiError(404, `NO Data Found ! Complaint list is empty`)
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, complaint, `complaint List Fetched successfully`)
            )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in get complaints'))
    }
})

const addComplaint = asyncHandler(async (req, res) => {
    try {
        const { description, bussinessId, eventId } = req.body

        if (!bussinessId && !eventId) {
            throw new ApiError(400, `BussinessId Or EventId is required`)
        }

        const prvendor = await Complaint.findOne().sort({ _id: -1 }).select('complaintNo').exec();
        let complaintNo = '';
        if (prvendor?.complaintNo) {
            let codes = prvendor.complaintNo.substring(9)
            let datef = new Date().toISOString().slice(2, 10).replace(/-/g, "");
            //    console.log(codes);
            complaintNo = `PGT${datef}${(parseInt(codes) + 1).toLocaleString(undefined, { useGrouping: false, minimumIntegerDigits: 4 })}`;
        } else {
            let codes = 1;
            let datef = new Date().toISOString().slice(2, 10).replace(/-/g, "");
            complaintNo = `PGT${datef}${(parseInt(codes)).toLocaleString(undefined, { useGrouping: false, minimumIntegerDigits: 4 })}`;
        }

        const complaint = await Complaint.create({
            complaintNo,
            description,
            bussinessId,
            eventId,
            owner: req.vendor._id
        })

        const createdComplaint = await Complaint.findById(complaint._id)

        if (!createdComplaint) {
            throw new ApiError(500, `Something went wrong while adding complaint`)
        }

        return res.status(201).json(
            new ApiResponse(200, createdComplaint, `Complaint Added Successfully`)
        )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in add complaint'))
    }

})

const updateStatusComplaint = asyncHandler(async (req, res) => {
    try {
        const { Id, status } = req.query
        if (!Id || !status) {
            return res
                .status(400)
                .json(new ApiError(400, "Id and status are required"))
        }

        const event = await Complaint.findByIdAndUpdate(
            Id,
            {
                $set: {
                    status
                }
            },
            { new: true }
        ).select()

        if (!event) {
            throw new ApiError(500, `Something went wrong while updating complaint`)
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, event, `Complaint Status updated successfully`)
            )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in update status complaint'))
    }
})

const getNotifications = asyncHandler(async (req, res) => {
    try {
        const { limit = 200, startIndex = 0, bussinessId, eventId, userId, status } = req.query

        const query = {}
        if (bussinessId && bussinessId != undefined) { query["bussinessId"] = new mongoose.Types.ObjectId(bussinessId) };
        if (eventId && eventId != undefined) { query["eventId"] = new mongoose.Types.ObjectId(eventId) };
        if (userId && userId != undefined) { query["to"] = new mongoose.Types.ObjectId(userId) };
        if (status && status != undefined) { query["status"] = status };


        const notification = await Notification.find(query)
            .populate("to", "fullName mobile profileImage usertype status")
            .populate("from", "fullName mobile profileImage usertype status")
            .populate({ path: "bussinessId", select: "uniqCode title", populate: { path: "owner", select: "fullName mobile" } })
            .populate({ path: "eventId", select: "uniqCode title", populate: { path: "owner", select: "fullName mobile" } })
            .sort({ _id: -1 }).limit(limit).skip(startIndex).exec();

        if (!notification) {
            throw new ApiError(500, `Something went wrong while fetching Notification`)
        } else if (notification.length == 0) {
            throw new ApiError(404, `NO Data Found ! Notification list is empty`)
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, notification, `Notification List Fetched successfully`)
            )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in get Notification'))
    }
})

const addNotification = asyncHandler(async (req, res) => {
    try {
        const { title, description, bussinessId, eventId, from, to } = req.body

        if (!from || !to) {
            throw new ApiError(400, `from and to are required`)
        }
        if (!title || !description) {
            throw new ApiError(400, `title and description are required`)
        }

        const notification = await Notification.create({
            title,
            description,
            bussinessId,
            eventId,
            from,
            to,

        })

        const createdNotification = await Notification.findById(notification._id)

        if (!createdNotification) {
            throw new ApiError(500, `Something went wrong while adding notification`)
        }

        return res.status(201).json(
            new ApiResponse(200, createdNotification, `Notification Added Successfully`)
        )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in add notification'))
    }

})

const updateStatusNotification = asyncHandler(async (req, res) => {
    try {
        const { Id, status } = req.query
        if (!Id || !status) {
            return res
                .status(400)
                .json(new ApiError(400, "Id and status are required"))
        }

        const notification = await Notification.findByIdAndUpdate(
            Id,
            {
                $set: {
                    status
                }
            },
            { new: true }
        ).select()

        if (!notification) {
            throw new ApiError(500, `Something went wrong while updating Notification`)
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, notification, `Notification Status updated successfully`)
            )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in update status Notification'))
    }
})

const deleteNotification = asyncHandler(async (req, res) => {
    try {
        const { userID } = req.query
        if (!userID) {
            return res
                .status(400)
                .json(new ApiError(400, "userID is required"))
        }

        const notification = await Notification.deleteMany({ to:new mongoose.Types.ObjectId(userID)}).exec()

        if (!notification) {
            throw new ApiError(500, `Something went wrong while deleting Notification`)
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, notification, `Notification Deleted successfully`)
            )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in update status Notification'))
    }
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
        if (!settingImages) {
            throw new ApiError(400, `Invaild Id for application setting details`)
        }

        if (iconFile != '' && settingImages.icon && settingImages.icon != '') {
            if (fs.existsSync(`public/adminImages/${settingImages.icon}`)) {
                fs.unlinkSync(`public/adminImages/${settingImages.icon}`);
            }

        }
        if (logoFile != '' && settingImages.logo && settingImages.logo != '') {
            if (fs.existsSync(`public/adminImages/${settingImages.logo}`)) {
                fs.unlinkSync(`public/adminImages/${settingImages.logo}`);
            }
        }
        if (bannerFile != '' && settingImages.banner && settingImages.banner != '') {
            if (fs.existsSync(`public/adminImages/${settingImages.banner}`)) {
                fs.unlinkSync(`public/adminImages/${settingImages.banner}`);
            }
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
    addImageMaster,
    updateImageMaster,
    getComplaints,
    addComplaint,
    updateStatusComplaint,
    getNotifications,
    addNotification,
    updateStatusNotification,
    deleteNotification,
}
