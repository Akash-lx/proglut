import { Router } from 'express';
import {
    getAllEvent,
    addEventInfo,
    getEventById,
    updateEventInfo,
    updateStatusEvent,
    // deleteEvent,
    getActiveEvent,
    updateEventlogo,
    getMyEvent,
    addAminities,
    getPackages,
    addPackage,
    updatePackage,
    updatePackageStatus,
    addRules,
    getAllEventList,
} from "../controllers/event.controller.js"
import { verifyVendorJWT } from "../middlewares/auth.middleware.js"
import { bussinessUpload } from "../middlewares/multer.middleware.js"

const router = Router();
// router.use(verifyVendorJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/").get(getAllEvent)
    .post(verifyVendorJWT, addEventInfo)
    .patch(verifyVendorJWT, updateEventInfo);

router.route("/logo").patch(bussinessUpload.array('coverImages', 5), updateEventlogo);

router
    .route("/detail")
    .get(getEventById)
    .patch(updateStatusEvent);
// .delete(deleteEvent)

router.route("/active").get(getActiveEvent);
router.route("/list").get(getAllEventList);
router.route("/my").get(verifyVendorJWT, getMyEvent);

router.route("/aminities/").post(verifyVendorJWT, addAminities);
router.route("/rules/").post(verifyVendorJWT, addRules);

router
    .route("/packages")
    .get(getPackages)
    .post(verifyVendorJWT,addPackage)
    .patch(verifyVendorJWT,updatePackage)
    .delete(verifyVendorJWT,updatePackageStatus);

export default router