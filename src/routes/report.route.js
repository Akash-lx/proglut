import { Router } from 'express';
import {
    getDashboardCounts,
    getMonthwiseBussiness,
    categoryWiseBussiness,
    activityWiseBooking,
    getUserBookingCounts,
    getVendorBookingCounts,
    getMonthwiseVendorEarning
} from "../controllers/report.controller.js"
// import { verifyVendorJWT } from "../middlewares/auth.middleware.js"
// import { itemUpload } from "../middlewares/multer.middleware.js"

const router = Router();
// router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/dashboardCounts/").get(getDashboardCounts);
router.route("/monthwiseBussiness/").get(getMonthwiseBussiness);
router.route("/categoryWiseBussiness/").get(categoryWiseBussiness);
router.route("/activityWiseBooking/").get(activityWiseBooking);
router.route("/getUserBookingCounts/").get(getUserBookingCounts);
router.route("/getVendorBookingCounts/").get(getVendorBookingCounts);
router.route("/getMonthwiseVendorEarning/").get(getMonthwiseVendorEarning);


export default router