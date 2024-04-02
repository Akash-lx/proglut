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
    adminLogin,
    // getVendorChannelProfile, 
    // getWatchHistory
} from "../controllers/vendor.controller.js";
import { vendorUpload, userUpload } from "../middlewares/multer.middleware.js"
import { verifyVendorJWT } from "../middlewares/auth.middleware.js";

// const vendorUpload = require("../middlewares/multer.middleware.js")

const router = Router()

router.route("/vendor/register").post(registerVendor)

router.route("/vendor/login").post(loginVendor)
router.route("/vendor/sendOTP").post(sendOTP)
router.route("/vendor/verifyOTP").post(verifyOTP)

//secured routes
router.route("/vendor/logout").post(verifyVendorJWT, logoutVendor)
router.route("/vendor/refresh-token").post(refreshAccessToken)
router.route("/vendor/current-vendor").get(verifyVendorJWT, getCurrentVendor)
router.route("/vendor/update-account").patch(verifyVendorJWT, updateVendorProfile)
router.route("/vendor/update-image").patch(verifyVendorJWT, vendorUpload.single("profileImage"), updateVendorImage)
router.route("/vendor/update-status").patch(updateVendorStatus)
router.route("/vendor/all").get(getVendorsList)
router.route("/vendor/page-vendor").get(getPaginateVendors)

router.route("/user/register").post(registerVendor)

router.route("/user/login").post(loginVendor)
router.route("/user/sendOTP").post(sendOTP)
router.route("/user/verifyOTP").post(verifyOTP)

//secured routes
router.route("/user/logout").post(verifyVendorJWT, logoutVendor)
router.route("/user/refresh-token").post(refreshAccessToken)
router.route("/user/current-user").get(verifyVendorJWT, getCurrentVendor)
router.route("/user/update-account").patch(verifyVendorJWT, updateVendorProfile)
router.route("/user/update-image").patch(verifyVendorJWT, userUpload.single("profileImage"), updateVendorImage)
router.route("/user/update-status").patch(updateVendorStatus)
router.route("/user/all").get(getVendorsList)
router.route("/user/page-user").get(getPaginateVendors)

router.route("/admin/login").post(adminLogin)
router.route("/admin/logout").post(verifyVendorJWT, logoutVendor)
router.route("/admin/detail").get(verifyVendorJWT, getCurrentVendor)
    .patch(verifyVendorJWT, updateVendorProfile)
    
router.route("/admin/update-image").patch(verifyVendorJWT, userUpload.single("profileImage"), updateVendorImage)
   
// router.route("/c/:username").get(verifyVendorJWT, getVendorChannelProfile)
// router.route("/history").get(verifyVendorJWT, getWatchHistory)

export default router