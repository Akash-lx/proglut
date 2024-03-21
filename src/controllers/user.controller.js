import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
// import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import fs from "fs"
import mongoose from "mongoose";


const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }


    } catch (error) {
        return res
            .status(500)
            .json(new ApiError(500, "Something went wrong while generating referesh and access token", error))
        // throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: mobile, email
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const { fullName, email, mobile, gender } = req.body

    if (
        [fullName, email, mobile, gender].some((field) => field?.trim() === "")
    ) {
        return res
            .status(400)
            .json(new ApiError(400, "All fields are required"))
        // throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ mobile }, { email }]
    })

    if (existedUser) {
        return res
            .status(409)
            .json(new ApiError(409, "User with email or mobile already exists"))
        // throw new ApiError(409, "User with email or mobile already exists")
    }

    const user = await User.create({
        fullName,
        email,
        gender: gender,
        mobile
    })

    const createdUser = await User.findById(user._id).select(
        "-refreshToken"
    )

    if (!createdUser) {
        return res
            .status(500)
            .json(new ApiError(500, "Something went wrong while registering the user", error))
        // throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

})


const loginUser = asyncHandler(async (req, res) => {
    // req body -> data
    // mobile or email
    //find the user

    const { email, mobile } = req.body

    if (!mobile && !email) {
        return res
            .status(400)
            .json(new ApiError(400, "mobile or email is required"))
    }

    const user = await User.findOne({
        $or: [{ mobile }, { email }]
    })

    if (!user) {
        return res
            .status(404)
            .json(new ApiError(404, "User does not exist"))

    } else if (user.status != 'active') {
        return res
            .status(401)
            .json(new ApiError(404, `User is ${user.status} ! please contact admin`))
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    user
                },
                "User Found Successfully"
            )
        )
})

const sendOTP = asyncHandler(async (req, res) => {

    const { email, mobile } = req.body

    if (!mobile && !email) {
        return res
            .status(400)
            .json(new ApiError(400, "mobile or email is required"))
    }

    const user = await User.findOne({
        $or: [{ mobile }, { email }]
    })

    if (!user) {
        return res
            .status(404)
            .json(new ApiError(404, "User does not exist"))
    } else if (user.status != 'active') {
        return res
            .status(401)
            .json(new ApiError(404, `User is ${user.status} ! please contact admin`))
    }


    const newuser = await User.findByIdAndUpdate(
        user?._id,
        {
            $set: {
                otp: 123456,
            }
        },
        { new: true }

    )
    return res
        .status(200)
        .json(new ApiResponse(200, newuser, "OTP Send successfully"))
})

const verifyOTP = asyncHandler(async (req, res) => {
    // req body -> data
    // mobile or email
    //find the user

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

    const user = await User.findOne({
        $or: [{ mobile }, { email }]
    })

    if (!user) {
        return res
            .status(404)
            .json(new ApiError(404, "User does not exist"))
    } else if (user.status != 'active') {
        return res
            .status(401)
            .json(new ApiError(404, `User is ${user.status} ! please contact admin`))
    }


    const isOtpValid = user.otp == otp ? true : false;

    //   console.log(user.otp)

    if (!isOtpValid) {
        return res
            .status(401)
            .json(new ApiError(401, "OTP Not Matched"))
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-otp -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged In Successfully"
            )
        )

})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
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
        .json(new ApiResponse(200, {}, "User logged Out"))
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

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            return res
                .status(401)
                .json(new ApiError(401, "Invalid refresh token"))

        }

        if (incomingRefreshToken !== user?.refreshToken) {
            return res
                .status(401)
                .json(new ApiError(401, "Refresh token is expired or used"))

        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefereshTokens(user._id)

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

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            req.user,
            "User fetched successfully"
        ))
})

const updateUserProfile = asyncHandler(async (req, res) => {
    const { fullName, gender, city, state, street, area, pincode, latitude, longitude } = req.body

    if (!fullName || !gender) {
        return res
            .status(400)
            .json(new ApiError(400, "FullName And Gender are required"))
        // throw new ApiError(400, "")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
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
        .json(new ApiResponse(200, user, "User details updated successfully"))
});

const updateUserImage = asyncHandler(async (req, res) => {
    // console.log(req.file);
    const avatarLocalPath = req.file?.filename

    if (!avatarLocalPath) {
        return res
            .status(400)
            .json(new ApiError(400, "Profile Image is missing"))
    }

    const userProfile = await User.findById(req.user?._id).select("profileImage");

    if (userProfile.profileImage && userProfile.profileImage != '') {
        fs.unlinkSync(`public/userImages/${userProfile.profileImage}`);
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
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
            new ApiResponse(200, user, "Profile image updated successfully")
        )
})

const updateUserStatus = asyncHandler(async (req, res) => {

    const { userId, status } = req.body

    if (!userId && !status) {
        return res
            .status(400)
            .json(new ApiError(400, "UserId And Status are required"))
    }

    const user = await User.findByIdAndUpdate(
        userId,
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
            new ApiResponse(200, user, "User Status updated successfully")
        )
})

const getUsersList = asyncHandler(async (req, res) => {

    const { limit=200, startIndex= 0 } = req.body
   
    const user = await User.find()
                         .select("-otp -accessToken -refreshToken")
                         .sort("-_id")
                         .skip(startIndex)
                         .limit(limit)
                         .exec();

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "User List Fetched successfully")
        )
})

const getPaginateUsers = asyncHandler(async (req, res) => {

    const { limit=20, pageNumber= 0 } = req.body
 
    const result = {};
    const totalPosts = await User.countDocuments().exec();
    let startIndex = pageNumber * limit;
    const endIndex = (pageNumber + 1) * limit;
    result.totalPosts = totalPosts;
    if (startIndex > 0) {
      result.previous = {
        pageNumber: pageNumber - 1,
        limit: limit,
      };
    }
    if (endIndex < (await User.countDocuments().exec())) {
      result.next = {
        pageNumber: pageNumber + 1,
        limit: limit,
      };
    }
    result.data = await User.find()
      .sort("-_id")
      .skip(startIndex)
      .limit(limit)
      .exec();
    result.rowsPerPage = limit;
    return res
        .status(200)
        .json(
            new ApiResponse(200, result, "User List Fetched successfully")
        )
 
})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    sendOTP,
    verifyOTP,
    getCurrentUser,
    updateUserProfile,
    updateUserImage,
    updateUserStatus,
    getUsersList,
    getPaginateUsers,
  
}