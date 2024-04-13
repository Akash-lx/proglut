import { Router } from 'express';
import {
    getAllBooking,
    addBookingInfo,
    getBookingById,
    updateBookingInfo,
    updateStatusBooking,
    deleteBooking,
    getMyBooking,

} from "../controllers/booking.controller.js"
import { verifyVendorJWT } from "../middlewares/auth.middleware.js"

const router = Router();
// router.use(verifyVendorJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/business/").get(getAllBooking)
    .post(verifyVendorJWT, addBookingInfo)
    .patch(verifyVendorJWT, updateBookingInfo);

router
    .route("/detail")
    .get(getBookingById)
    .patch(updateStatusBooking);
// .delete(deleteBooking)

router.route("/my").get(verifyVendorJWT, getMyBooking);

router.route("/event/").get(getAllBooking)
    .post(verifyVendorJWT, addBookingInfo)
    .patch(verifyVendorJWT, updateBookingInfo);

router
    .route("/detail")
    .get(getBookingById)
    .patch(updateStatusBooking);
// .delete(deleteBooking)

router.route("/my").get(verifyVendorJWT, getMyBooking);



export default router