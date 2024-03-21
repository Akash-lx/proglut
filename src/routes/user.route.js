import { Router } from "express";
import { 
    loginUser, 
    logoutUser, 
    registerUser, 
    refreshAccessToken, 
    sendOTP,
    verifyOTP,
    getCurrentUser, 
    updateUserImage, 
    updateUserProfile,
    updateUserStatus,
    getUsersList,
    getPaginateUsers,

} from "../controllers/user.controller.js";
import {userUpload} from "../middlewares/multer.middleware.js"
import { verifyUserJWT } from "../middlewares/auth.middleware.js";

//  const userUpload = require("../middlewares/multer.middleware.js");
const router = Router()

router.route("/register").post(registerUser)

router.route("/login").post(loginUser)
router.route("/sendOTP").post(sendOTP)
router.route("/verifyOTP").post(verifyOTP)

//secured routes
router.route("/logout").post(verifyUserJWT,  logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/current-user").get(verifyUserJWT, getCurrentUser)
router.route("/update-account").patch(verifyUserJWT, updateUserProfile)
router.route("/update-image").patch(verifyUserJWT, userUpload.single("profileImage"), updateUserImage)
router.route("/update-status").patch(updateUserStatus)
router.route("/all").get(getUsersList)
router.route("/page-user").get(getPaginateUsers)

export default router