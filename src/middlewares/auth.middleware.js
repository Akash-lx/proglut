import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { Vendor } from "../models/vendor.model.js";
import { User } from "../models/user.model.js";

 const verifyVendorJWT = asyncHandler(async(req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
        // console.log(token);
        if (!token) {
            return res
            .status(401)
            .json(new ApiError(401,"Unauthorized request"))
            // throw new ApiError(401, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const vendor = await Vendor.findById(decodedToken?._id).select("-otp -refreshToken")
    
        if (!vendor) {
            return res
            .status(401)
            .json(new ApiError(401,"Invalid Access Token"))
            // throw new ApiError(401, "Invalid Access Token")
        }
    
        req.vendor = vendor;
        next()
    } catch (error) {
        return res
        .status(401)
        .json(new ApiError(401,error?.message || "Invalid Access Token"))
        // throw new ApiError(401, error?.message || "Invalid access token")
    }
    
})

 const verifyUserJWT = asyncHandler(async(req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
        // console.log(token);
        if (!token) {
            return res
            .status(401)
            .json(new ApiError(401,"Unauthorized request"))
            // throw new ApiError(401, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-otp -refreshToken")
    
        if (!user) {
            return res
            .status(401)
            .json(new ApiError(401,"Invalid Access Token"))
        }
    
        req.user = user;
        next()
    } catch (error) {
        return res
        .status(401)
        .json(new ApiError(401,error?.message || "Invalid Access Token"))
    }
    
})

export {verifyVendorJWT , verifyUserJWT}