import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { Vendor } from "../models/vendor.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import fs from "fs"
import mongoose from "mongoose";

const generateWebAccessToken = async (vendorId) => {
    try {
        const vendor = await Vendor.findById(vendorId)
        const accessToken = vendor.generateAccessToken()
        const refreshToken = vendor.generateRefreshToken()
        return { accessToken, refreshToken }
    } catch (error) {
        return res
            .status(500)
            .json(new ApiError(500, "Something went wrong while web generating referesh and access token", error))
        // throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

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
    try {

        const usertype = req.path.split("/")[1];

        const { fullName, email, mobile, gender } = req.body

        if (
            [fullName, email, mobile, gender].some((field) => field?.trim() === "")
        ) {

            throw new ApiError(400, "All fields are required")
        }

        const existedVendor = await Vendor.findOne({
            $or: [{ mobile }, { email }]
        })

        if (existedVendor) {

            throw new ApiError(409, `${usertype} with email or mobile already exists`)
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
            throw new ApiError(500, `Something went wrong while registering the  ${usertype}`)
        }

        return res.status(201).json(
            new ApiResponse(200, createdVendor, `${usertype} registered Successfully`)
        )

    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in UpdateInfo'))
    }
})


const loginVendor = asyncHandler(async (req, res) => {

    try {
        const usertype = req.path.split("/")[1];
        const { email, mobile } = req.body

        if (!mobile && !email) {
            throw new ApiError(400, "mobile or email is required")
        }

        const vendor = await Vendor.findOne({
            usertype: usertype,
            $or: [{ mobile }, { email }]
        }).select("-refreshToken")

        if (!vendor) {
            throw new ApiError(404, `${usertype} does not exist`)
        } else if (vendor.status != 'active') {
            throw new ApiError(403, `${usertype} is ${vendor.status} ! please contact admin`)
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, vendor, `${usertype} Found Successfully`)
            )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in UpdateInfo'))
    }
})

const sendOTP = asyncHandler(async (req, res) => {

    try {
        const usertype = req.path.split("/")[1];
        const { email, mobile } = req.body

        if (!mobile && !email) {
            throw new ApiError(400, "mobile or email is required")
        }

        const vendor = await Vendor.findOne({
            usertype: usertype,
            $or: [{ mobile }, { email }]
        })

        if (!vendor) {
            throw new ApiError(404, `${usertype} does not exist`)
        } else if (vendor.status != 'active') {
            throw new ApiError(403, `${usertype} is ${vendor.status} ! please contact admin`)
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

        if (!newvendor) {
            throw new ApiError(500, `Something went wrong while sendOtp the ${usertype}`)
        }

        return res
            .status(200)
            .json(new ApiResponse(200, newvendor, "OTP Send successfully"))

    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in UpdateInfo'))
    }
})

const verifyOTP = asyncHandler(async (req, res) => {

    try {
        const usertype = req.path.split("/")[1];
        const { email, mobile, otp } = req.body

        if (!mobile && !email) {
            throw new ApiError(400, "mobile or email is required")
        }
        if (!otp) {
            throw new ApiError(400, "Otp is required")
        }

        const vendor = await Vendor.findOne({
            usertype: usertype,
            $or: [{ mobile }, { email }]
        })

        if (!vendor) {
            throw new ApiError(404, `${usertype} does not exist`)
        } else if (vendor.status != 'active') {
            throw new ApiError(403, `${usertype} is ${vendor.status} ! please contact admin`)
        }


        const isOtpValid = vendor.otp == otp ? true : false;

        if (!isOtpValid) {
            throw new ApiError(401, `Otp Not Matched`)
        }

        const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(vendor._id)

        const loggedInUser = await Vendor.findById(vendor._id)

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(200, loggedInUser, `${usertype} logged In Successfully`, { "accessToken": accessToken, "refreshToken": refreshToken })
            )

    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in UpdateInfo'))
    }
})


const logoutVendor = asyncHandler(async (req, res) => {

    try {
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
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in UpdateInfo'))
    }
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
            throw new ApiError(401, "Invaild Refresh Token")

        }

        if (incomingRefreshToken !== vendor?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")

        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(vendor._id)

        const data = {}
        data['accessToken'] = accessToken;
        data['refreshToken'] = refreshToken;

        // console.log(data);
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(200, data, "Access token refreshed")
            )
    } catch (error) {
        return res
            .status(401)
            .json(new ApiError(401, error?.message || "Invalid refresh token"))

    }

})

const getCurrentVendor = asyncHandler(async (req, res) => {
    try {
        const usertype = req.path.split("/")[1];
        return res
            .status(200)
            .json(new ApiResponse(
                200,
                req.vendor,
                `${usertype} fetched successfully`
            ))
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in UpdateInfo'))
    }
})

const updateVendorProfile = asyncHandler(async (req, res) => {

    try {
        const { fullName, gender, city, state, street, area, pincode, latitude, longitude, mobile, email, password } = req.body
        const usertype = req.path.split("/")[1];
        if (!fullName || !gender) {

            throw new ApiError(400, "FullName And Gender are required")
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
                    },
                    mobile,
                    email,
                    password
                }
            },
            { new: true }

        ).select("-otp -refreshToken")

        if (!vendor) {

            throw new ApiError(500, `Something went wrong while UpdateInfo the ${usertype}`)
        }

        return res
            .status(200)
            .json(new ApiResponse(200, vendor, `${usertype} details updated successfully`))

    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in UpdateInfo'))
    }
});

const updateVendorAddress = asyncHandler(async (req, res) => {

    try {
        const { city, state, street, area, pincode, latitude, longitude } = req.body
        const usertype = req.path.split("/")[1];
        if (!city || !state) {
            throw new ApiError(400, "City And State are required")
        }

        const vendor = await Vendor.findByIdAndUpdate(
            req.vendor?._id,
            {
                $set: {
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

        if (!vendor) {

            throw new ApiError(500, `Something went wrong while UpdateInfo the ${usertype}`)
        }

        return res
            .status(200)
            .json(new ApiResponse(200, vendor, `${usertype} details updated successfully`))

    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in UpdateInfo'))
    }
});

const updateVendorImage = asyncHandler(async (req, res) => {

    try {
        const avatarLocalPath = req.file?.filename
        const usertype = req.path.split("/")[1];
        if (!avatarLocalPath) {
            throw new ApiError(400, "Profile Image is missing")
        }

        const vendorProfile = await Vendor.findById(req.vendor?._id).select("profileImage");

        if (vendorProfile.profileImage && vendorProfile.profileImage != '') {
            if (fs.existsSync(`public/vendorImages/${vendorProfile.profileImage}`)) {
                fs.unlinkSync(`public/vendorImages/${vendorProfile.profileImage}`);
              }
       
        }
        const vendor = await Vendor.findByIdAndUpdate(
            req.vendor?._id,
            {
                $set: {
                    profileImage: avatarLocalPath
                }
            },
            { new: true }
        ).select("-otp -refreshToken")

        if (!vendor) {
            throw new ApiError(500, `Something went wrong while Update profile image the ${usertype}`)
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, vendor, "Profile image updated successfully")
            )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in UpdateInfo'))
    }
})

const updateVendorStatus = asyncHandler(async (req, res) => {
    try {
        const usertype = req.path.split("/")[1];
        const { Id, status } = req.body

        if (!Id || !status) {
            throw new ApiError(400, "Vendor Id and Status are required")
        }

        const vendor = await Vendor.findByIdAndUpdate(
            Id,
            {
                $set: {
                    status: status
                }
            },
            { new: true }
        ).select("-otp -refreshToken")

        if (!vendor) {
            throw new ApiError(500, `Something went wrong while status update the ${usertype}`)
        }


        return res
            .status(200)
            .json(
                new ApiResponse(200, vendor, `${usertype} Status updated successfully`)
            )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in UpdateInfo'))
    }
})

const getVendorsList = asyncHandler(async (req, res) => {
    try {
        const usertype = req.path.split("/")[1];
        const { limit = 200, startIndex = 0 } = req.query

        const vendor = await Vendor.find({ usertype: usertype })
            .select("-otp -refreshToken")
            .sort("-_id")
            .skip(startIndex)
            .limit(limit)
            .exec();

        if (!vendor) {
            throw new ApiError(500, `Something went wrong while fetching ${usertype} list`)
        } else if (vendor.length == 0) {
            throw new ApiError(404, `Data Not Found ! ${usertype} list is empty`)

        }


        return res
            .status(200)
            .json(
                new ApiResponse(200, vendor, `${usertype} List Fetched successfully`)
            )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in UpdateInfo'))
    }
})

const getVendorDetail = asyncHandler(async (req, res) => {
    try {
        const usertype = req.path.split("/")[1];
        const { Id } = req.query

        if (!Id) {
            throw new ApiError(400, `Id is required`)
        }

        const vendor = await Vendor.findOne({ _id: Id, usertype: usertype })
            .select("-otp -refreshToken -password").exec();

        if (!vendor) {
            throw new ApiError(500, `Invaild Id for ${usertype} Detail`)
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, vendor, `${usertype} List Fetched successfully`)
            )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in Vendor'))
    }
})


const getPaginateVendors = asyncHandler(async (req, res) => {

    const { limit = 20, pageNumber = 0 } = req.query
    const usertype = req.path.split("/")[1];
    const result = {};
    const totalPosts = await Vendor.countDocuments({ usertype: usertype }).exec();
    let startIndex = pageNumber * limit;
    const endIndex = (pageNumber + 1) * limit;
    result.totalPosts = totalPosts;
    if (startIndex > 0) {
        result.previous = {
            pageNumber: pageNumber - 1,
            limit: limit,
        };
    }
    if (endIndex < (await Vendor.countDocuments({ usertype: usertype }).exec())) {
        result.next = {
            pageNumber: pageNumber + 1,
            limit: limit,
        };
    }
    result.data = await Vendor.find({ usertype: usertype })
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

const adminLogin = asyncHandler(async (req, res) => {

    try {
        const usertype = req.path.split("/")[1];
        const { email, mobile, password } = req.body

        if (!mobile && !email) {
            throw new ApiError(400, "mobile or email is required")
        }
        if (!password) {
            throw new ApiError(400, "Password is required")
        }

        const vendor = await Vendor.findOne({
            usertype: usertype,
            $or: [{ mobile }, { email }]
        })

        if (!vendor) {
            throw new ApiError(404, `${usertype} does not exist`)
        } else if (vendor.status != 'active') {
            throw new ApiError(403, `${usertype} is ${vendor.status} ! please contact admin`)
        }

        const isPasswordValid = vendor.password == password ? true : false;

        if (!isPasswordValid) {
            throw new ApiError(401, `Password Not Matched`)
        }

        const { accessToken, refreshToken } = await generateWebAccessToken(vendor._id)


        const options = {
            httpOnly: true,
            secure: true
        }
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(200, vendor, `${usertype} logged In Successfully`, { "accessToken": accessToken, "refreshToken": refreshToken }
                )
            )
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in Admin Login'))
    }

})

const updateVendorDetail = asyncHandler(async (req, res) => {

    try {
        const {Id, fullName, gender, city, state, street, area, pincode, latitude, longitude, mobile, email} = req.body
        const usertype = req.path.split("/")[1];
        if (!Id) {
            throw new ApiError(400, "Id is required")
        }
        if (!fullName || !gender) {
            throw new ApiError(400, "FullName And Gender are required")
        }

        const vendor = await Vendor.findByIdAndUpdate(
           Id,
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
                    },
                    mobile,
                    email,
                   
                }
            },
            { new: true }

        ).select("-otp -refreshToken -password")

        if (!vendor) {
            throw new ApiError(500, `Something went wrong while UpdateInfo the ${usertype}`)
        }

        return res
            .status(200)
            .json(new ApiResponse(200, vendor, `${usertype} details updated successfully`))

    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || 'Server Error in UpdateInfo'))
    }
});

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
    adminLogin,
    getVendorDetail,
    updateVendorDetail,
    updateVendorAddress,
    // getVendorChannelProfile,
    // getWatchHistory
}