import { Router } from 'express';
import {
    getAllActivity,
    addActivity,
    getActivityById,
    // updateActivity,
    updateStatusActivity,
    deleteActivity,
    getActiveActivity
   
} from "../controllers/bussinessActivity.controller.js"
import { verifyVendorJWT } from "../middlewares/auth.middleware.js"
// import { itemUpload } from "../middlewares/multer.middleware.js"

const router = Router();
// router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/bussinessActivity/").get(verifyVendorJWT, getAllActivity)
    .post(verifyVendorJWT, addActivity)
    .delete(verifyVendorJWT, deleteActivity);
    // .patch(itemUpload.single("image"), updateActivity);
    
    router
    .route("/bussinessActivity/detail")
    .get(getActivityById)
    .patch(updateStatusActivity);
    // .delete(deleteActivity)
    
    router.route("/bussinessActivity/active").get(verifyVendorJWT, getActiveActivity);
    
   

export default router