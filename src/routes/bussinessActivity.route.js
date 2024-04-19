import { Router } from 'express';
import {
    getAllActivity,
    addActivity,
    getActivityById,
    deleteBussinessActivity,
    getActiveActivity,
    getActivitySlots,
    addSlot,
    updateSlot,
    updateSlotStatus,

} from "../controllers/bussinessActivity.controller.js"
import { verifyVendorJWT } from "../middlewares/auth.middleware.js"
// import { itemUpload } from "../middlewares/multer.middleware.js"

const router = Router();
// router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/bussinessActivity/").get(verifyVendorJWT, getAllActivity)
    .post(verifyVendorJWT, addActivity)
    .delete(verifyVendorJWT, deleteBussinessActivity);

router.route("/bussinessActivity/detail").get(getActivityById)
router.route("/bussinessActivity/active").get(verifyVendorJWT, getActiveActivity);

router.route("/bussinessActivity/slots").get(getActivitySlots)
    .post(verifyVendorJWT, addSlot)
    .patch(verifyVendorJWT, updateSlot)
    .delete(verifyVendorJWT, updateSlotStatus);



export default router