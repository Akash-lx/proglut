import { Router } from "express";
import { 
    loginVendor, 
    logoutVendor, 
    registerVendor, 
    refreshAccessToken, 
    sendOTP,
    verifyOTP,
    getCurrentVendor, 
    updateVendorImage, 
    updateVendorProfile,
    updateVendorStatus,
    getVendorsList,
    getPaginateVendors,
    // getVendorChannelProfile, 
    // getWatchHistory
} from "../controllers/vendor.controller.js";
import {vendorUpload} from "../middlewares/multer.middleware.js"
import { verifyVendorJWT } from "../middlewares/auth.middleware.js";

// const vendorUpload = require("../middlewares/multer.middleware.js")

const router = Router()

router.route("/register").post(registerVendor)

router.route("/login").post(loginVendor)
router.route("/sendOTP").post(sendOTP)
router.route("/verifyOTP").post(verifyOTP)

//secured routes
router.route("/logout").post(verifyVendorJWT,  logoutVendor)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/current-vendor").get(verifyVendorJWT, getCurrentVendor)
router.route("/update-account").patch(verifyVendorJWT, updateVendorProfile)
router.route("/update-image").patch(verifyVendorJWT, vendorUpload.single("profileImage"), updateVendorImage)
router.route("/update-status").patch(updateVendorStatus)
router.route("/all").get(getVendorsList)
router.route("/page-vendor").get(getPaginateVendors)

// router.route("/c/:username").get(verifyVendorJWT, getVendorChannelProfile)
// router.route("/history").get(verifyVendorJWT, getWatchHistory)

export default router