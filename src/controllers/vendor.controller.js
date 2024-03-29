import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { Vendor } from "../models/vendor.model.js"
// import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import fs from "fs"
import mongoose from "mongoose";


const generateAccessAndRefereshTokens = async (vendorId) => {
    try {
        const vendor = await Vendor.findById(vendorId)
        const accessToken = vendor.generateAccessToken()
        const refreshToken = vendor.generateRefreshToken()

        vendor.refreshToken = refreshToken
        await vendor.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }


    } catch (error) {
        return res
            .status(500)
            .json(new ApiError(500, "Something went wrong while generating referesh and access token", error))
        // throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerVendor = asyncHandler(async (req, res) => {
    // get vendor details from frontend
    // validation - not empty
    // check if vendor already exists: mobile, email
    // create vendor object - create entry in db
    // remove password and refresh token field from response
    // check for vendor creation
    // return res
    const usertype = req.path.split("/")[1];

    const { fullName, email, mobile, gender } = req.body

    if (
        [fullName, email, mobile, gender].some((field) => field?.trim() === "")
    ) {
        return res
            .status(400)
            .json(new ApiError(400, "All fields are required"))
        // throw new ApiError(400, "All fields are required")
    }

    const existedVendor = await Vendor.findOne({
        $or: [{ mobile }, { email }]
    })

    if (existedVendor) {
        return res
            .status(409)
            .json(new ApiError(409, `${usertype} with email or mobile already exists`))
        // throw new ApiError(409, "Vendor with email or mobile already exists")
    }

    const vendor = await Vendor.create({
        fullName,
        email,
        gender: gender,
        mobile,
        usertype
    })

    const createdVendor = await Vendor.findById(vendor._id).select(
        "-refreshToken"
    )

    if (!createdVendor) {
        return res
            .status(500)
            .json(new ApiError(500, `Something went wrong while registering the ${usertype}`, error))
        // throw new ApiError(500, "Something went wrong while registering the vendor")
    }

    return res.status(201).json(
        new ApiResponse(200, createdVendor, `${usertype} registered Successfully`)
    )

})


const loginVendor = asyncHandler(async (req, res) => {
    // req body -> data
    // mobile or email
    //find the vendor
    const usertype = req.path.split("/")[1];
    const { email, mobile } = req.body

    if (!mobile && !email) {
        return res
            .status(400)
            .json(new ApiError(400, "mobile or email is required"))
    }

    const vendor = await Vendor.findOne({
        usertype:usertype,
        $or: [{ mobile }, { email }]
    }).select("-refreshToken")

    if (!vendor) {
        return res
            .status(404)
            .json(new ApiError(404, `${usertype} does not exist`))

    } else if (vendor.status != 'active') {
        return res
            .status(403)
            .json(new ApiError(403, `${usertype} is ${vendor.status} ! please contact admin`))
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                vendor,
                `${usertype} Found Successfully`
            )
        )
})

const sendOTP = asyncHandler(async (req, res) => {
    const usertype = req.path.split("/")[1];
    const { email, mobile } = req.body

    if (!mobile && !email) {
        return res
            .status(400)
            .json(new ApiError(400, "mobile or email is required"))
    }

    const vendor = await Vendor.findOne({
        usertype:usertype,
        $or: [{ mobile }, { email }]
    })

    if (!vendor) {
        return res
            .status(404)
            .json(new ApiError(404, `${usertype} does not exist`))
    } else if (vendor.status != 'active') {
        return res
            .status(403)
            .json(new ApiError(403, `${usertype} is ${vendor.status} ! please contact admin`))
    }


    const newvendor = await Vendor.findByIdAndUpdate(
        vendor?._id,
        {
            $set: {
                otp: 123456,
            }
        },
        { new: true }

    )
    return res
        .status(200)
        .json(new ApiResponse(200, newvendor, "OTP Send successfully"))
})

const verifyOTP = asyncHandler(async (req, res) => {
    // req body -> data
    // mobile or email
    //find the vendor
    const usertype = req.path.split("/")[1];
    const { email, mobile, otp } = req.body

    if (!mobile && !email) {
        return res
            .status(400)
            .json(new ApiError(400, "mobile or email is required"))
    }
    if (!otp) {
        return res
            .status(400)
            .json(new ApiError(400, "OTP is required"))
    }

    const vendor = await Vendor.findOne({
        usertype:usertype,
        $or: [{ mobile }, { email }]
    })

    if (!vendor) {
        return res
            .status(404)
            .json(new ApiError(404, `${usertype} does not exist`))
    } else if (vendor.status != 'active') {
        return res
            .status(403)
            .json(new ApiError(403, `${usertype} is ${vendor.status} ! please contact admin`))
    }


    const isOtpValid = vendor.otp == otp ? true : false;

    //   console.log(vendor.otp)

    if (!isOtpValid) {
        return res
            .status(401)
            .json(new ApiError(401, "OTP Not Matched"))
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(vendor._id)

    const loggedInVendor = await Vendor.findById(vendor._id).select("-otp")

    const options = {
        httpOnly: true,
        secure: true
    }
    // Object.assign(loggedInVendor, {accessToken: accessToken});
    // vendor['accessToken'] = accessToken;
// console.log(loggedInVendor);
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                vendor, 
                `${usertype} logged In Successfully`,
               {"accessToken":accessToken}
            )
        )

})

const logoutVendor = asyncHandler(async (req, res) => {
    const usertype = req.path.split("/")[1];
    await Vendor.findByIdAndUpdate(
        req.vendor._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, `${usertype} logged Out`))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        return res
            .status(401)
            .json(new ApiError(401, "unauthorized request"))

    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const vendor = await Vendor.findById(decodedToken?._id)

        if (!vendor) {
            return res
                .status(401)
                .json(new ApiError(401, "Invalid refresh token"))

        }

        if (incomingRefreshToken !== vendor?.refreshToken) {
            return res
                .status(401)
                .json(new ApiError(401, "Refresh token is expired or used"))

        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefereshTokens(vendor._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        return res
            .status(401)
            .json(new ApiError(401, error?.message || "Invalid refresh token", error))

    }

})

const getCurrentVendor = asyncHandler(async (req, res) => {
    const usertype = req.path.split("/")[1];
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            req.vendor,
            `${usertype} fetched successfully`
        ))
})

const updateVendorProfile = asyncHandler(async (req, res) => {
    const { fullName, gender, city, state, street, area, pincode, latitude, longitude } = req.body
    const usertype = req.path.split("/")[1];
    if (!fullName || !gender) {
        return res
            .status(400)
            .json(new ApiError(400, "FullName And Gender are required"))
        // throw new ApiError(400, "")
    }

    const vendor = await Vendor.findByIdAndUpdate(
        req.vendor?._id,
        {
            $set: {
                fullName,
                gender,
                address: {
                    city,
                    state,
                    street,
                    area,
                    pincode,
                    latitude,
                    longitude
                }
            }
        },
        { new: true }

    ).select("-otp -refreshToken")

    return res
        .status(200)
        .json(new ApiResponse(200, vendor, `${usertype} details updated successfully`))
});

const updateVendorImage = asyncHandler(async (req, res) => {
    // console.log(req.file);
    const avatarLocalPath = req.file?.filename
    const usertype = req.path.split("/")[1];
    if (!avatarLocalPath) {
        return res
            .status(400)
            .json(new ApiError(400, "Profile Image is missing"))
    }

    const vendorProfile = await Vendor.findById(req.vendor?._id).select("profileImage");

    if (vendorProfile.profileImage && vendorProfile.profileImage != '') {
        fs.unlinkSync(`public/vendorImages/${vendorProfile.profileImage}`);
    }
    const vendor = await Vendor.findByIdAndUpdate(
        req.vendor?._id,
        {
            $set: {
                profileImage: avatarLocalPath
            }
        },
        { new: true }
    ).select("-otp -accessToken -refreshToken")

    return res
        .status(200)
        .json(
            new ApiResponse(200, vendor, "Profile image updated successfully")
        )
})

const updateVendorStatus = asyncHandler(async (req, res) => {
    const usertype = req.path.split("/")[1];
    const { Id, status } = req.body

    if (!Id || !status) {
        return res
            .status(400)
            .json(new ApiError(400, "VendorId And Status are required"))
    }

    const vendor = await Vendor.findByIdAndUpdate(
        Id,
        {
            $set: {
                status: status
            }
        },
        { new: true }
    ).select("-otp -accessToken -refreshToken")

    return res
        .status(200)
        .json(
            new ApiResponse(200, vendor, `${usertype} Status updated successfully`)
        )
})

const getVendorsList = asyncHandler(async (req, res) => {
    const usertype = req.path.split("/")[1];
    const { limit=200, startIndex= 0 } = req.body
   
    const vendor = await Vendor.find({usertype:usertype})
                         .select("-otp -accessToken -refreshToken")
                         .sort("-_id")
                         .skip(startIndex)
                         .limit(limit)
                         .exec();

    return res
        .status(200)
        .json(
            new ApiResponse(200, vendor, `${usertype} List Fetched successfully`)
        )
})

const getPaginateVendors = asyncHandler(async (req, res) => {

    const { limit=20, pageNumber= 0 } = req.body
    const usertype = req.path.split("/")[1];
    const result = {};
    const totalPosts = await Vendor.countDocuments({usertype:usertype}).exec();
    let startIndex = pageNumber * limit;
    const endIndex = (pageNumber + 1) * limit;
    result.totalPosts = totalPosts;
    if (startIndex > 0) {
      result.previous = {
        pageNumber: pageNumber - 1,
        limit: limit,
      };
    }
    if (endIndex < (await Vendor.countDocuments({usertype:usertype}).exec())) {
      result.next = {
        pageNumber: pageNumber + 1,
        limit: limit,
      };
    }
    result.data = await Vendor.find({usertype:usertype})
      .sort("-_id")
      .skip(startIndex)
      .limit(limit)
      .exec();
    result.rowsPerPage = limit;
    return res
        .status(200)
        .json(
            new ApiResponse(200, result, `${usertype} List Fetched successfully`)
        )
 
})

// const getVendorChannelProfile = asyncHandler(async(req, res) => {
//     const {mobile} = req.params

//     if (!mobile?.trim()) {
//         throw new ApiError(400, "mobile is missing")
//     }

//     const channel = await Vendor.aggregate([
//         {
//             $match: {
//                 mobile: mobile?.toLowerCase()
//             }
//         },
//         {
//             $lookup: {
//                 from: "subscriptions",
//                 localField: "_id",
//                 foreignField: "channel",
//                 as: "subscribers"
//             }
//         },
//         {
//             $lookup: {
//                 from: "subscriptions",
//                 localField: "_id",
//                 foreignField: "subscriber",
//                 as: "subscribedTo"
//             }
//         },
//         {
//             $addFields: {
//                 subscribersCount: {
//                     $size: "$subscribers"
//                 },
//                 channelsSubscribedToCount: {
//                     $size: "$subscribedTo"
//                 },
//                 isSubscribed: {
//                     $cond: {
//                         if: {$in: [req.vendor?._id, "$subscribers.subscriber"]},
//                         then: true,
//                         else: false
//                     }
//                 }
//             }
//         },
//         {
//             $project: {
//                 fullName: 1,
//                 mobile: 1,
//                 subscribersCount: 1,
//                 channelsSubscribedToCount: 1,
//                 isSubscribed: 1,
//                 avatar: 1,
//                 coverImage: 1,
//                 email: 1

//             }
//         }
//     ])

//     if (!channel?.length) {
//         throw new ApiError(404, "channel does not exists")
//     }

//     return res
//     .status(200)
//     .json(
//         new ApiResponse(200, channel[0], "Vendor channel fetched successfully")
//     )
// })

// const getWatchHistory = asyncHandler(async(req, res) => {
//     const vendor = await Vendor.aggregate([
//         {
//             $match: {
//                 _id: new mongoose.Types.ObjectId(req.vendor._id)
//             }
//         },
//         {
//             $lookup: {
//                 from: "videos",
//                 localField: "watchHistory",
//                 foreignField: "_id",
//                 as: "watchHistory",
//                 pipeline: [
//                     {
//                         $lookup: {
//                             from: "vendors",
//                             localField: "owner",
//                             foreignField: "_id",
//                             as: "owner",
//                             pipeline: [
//                                 {
//                                     $project: {
//                                         fullName: 1,
//                                         mobile: 1,
//                                         avatar: 1
//                                     }
//                                 }
//                             ]
//                         }
//                     },
//                     {
//                         $addFields:{
//                             owner:{
//                                 $first: "$owner"
//                             }
//                         }
//                     }
//                 ]
//             }
//         }
//     ])

//     return res
//     .status(200)
//     .json(
//         new ApiResponse(
//             200,
//             vendor[0].watchHistory,
//             "Watch history fetched successfully"
//         )
//     )
// })

export {
    registerVendor,
    loginVendor,
    logoutVendor,
    refreshAccessToken,
    sendOTP,
    verifyOTP,
    getCurrentVendor,
    updateVendorProfile,
    updateVendorImage,
    updateVendorStatus,
    getVendorsList,
    getPaginateVendors,
    // getVendorChannelProfile,
    // getWatchHistory
}