import { Router } from 'express';
import {
    getAllEvent,
addEventInfo,
getEventById,
updateEventInfo,
updateStatusEvent,
deleteEvent,
getActiveEvent,
updateEventlogo,
addAminities
} from "../controllers/event.controller.js"
import {verifyVendorJWT} from "../middlewares/auth.middleware.js"
import {bussinessUpload} from "../middlewares/multer.middleware.js"

const router = Router();
// router.use(verifyVendorJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/").get(getAllEvent)
    .post(verifyVendorJWT,addEventInfo)
    .patch(verifyVendorJWT,updateEventInfo);

router.route("/logo").patch( bussinessUpload.fields([
    {
        name: "brandLogo",
        maxCount: 1
    }, 
    {
        name: "coverImage",
        maxCount: 1
    }
]),updateEventlogo);

router
    .route("/detail")
    .get(getEventById)
    .patch(updateStatusEvent);
    // .delete(deleteEvent)

router.route("/active").get(getActiveEvent);

router.route("/aminities/")
// .get(verifyVendorJWT, getAllActivity)
    .post(verifyVendorJWT, addAminities);
    // .delete(verifyVendorJWT, deleteActivity);
    // .patch(itemUpload.single("image"), updateActivity);


export default router