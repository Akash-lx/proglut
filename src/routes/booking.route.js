import { Router } from 'express';
import {
    addBussBookingInfo,
    getBusBookingById,
    updateBusBookingInfo,
    updateBusBookingPayment,
    updateBusStatusBooking,
    getAllBusBooking,
    getMyBusBooking,
    deleteBusBooking,
    updateBookActStatus,
    addEvtBookingInfo,
    getEvtBookingById,
    updateEvtBookingInfo,
    updateEvtBookingPayment,
    updateEvtStatusBooking,
    getAllEvtBooking,
    getMyEvtBooking,
    deleteEvtBooking,
} from "../controllers/booking.controller.js"
import { verifyVendorJWT } from "../middlewares/auth.middleware.js"

const router = Router();
// router.use(verifyVendorJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/business/").get(getAllBusBooking)
    .post(verifyVendorJWT, addBussBookingInfo)
    .patch(verifyVendorJWT, updateBusBookingInfo);

router
    .route("/detail")
    .get(getBusBookingById)
    .patch(updateBusStatusBooking);
// .delete(deleteBooking)

router.route("/payment").patch(updateBusBookingPayment);
router.route("/business/activity").patch(updateBookActStatus);
router.route("/business/my").get(verifyVendorJWT, getMyBusBooking);


router.route("/event/").get(getAllEvtBooking)
    .post(verifyVendorJWT, addEvtBookingInfo)
    .patch(verifyVendorJWT, updateEvtBookingInfo);

router
    .route("/event/detail")
    .get(getEvtBookingById)
    .patch(updateEvtStatusBooking);
// .delete(deleteBooking)

router.route("/event/payment").patch(updateEvtBookingPayment);
router.route("/event/my").get(verifyVendorJWT, getMyEvtBooking);


export default router