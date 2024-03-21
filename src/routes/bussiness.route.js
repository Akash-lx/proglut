import { Router } from 'express';
import {
    getAllBussiness,
addBussinessInfo,
getBussinessById,
updateBussinessInfo,
updateStatusBussiness,
deleteBussiness,
getActiveBussiness,
updateBussinesslogo,
addAminities
} from "../controllers/bussiness.controller.js"
import {verifyVendorJWT} from "../middlewares/auth.middleware.js"
import {bussinessUpload} from "../middlewares/multer.middleware.js"

const router = Router();
// router.use(verifyVendorJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/").get(getAllBussiness)
    .post(verifyVendorJWT,addBussinessInfo)
    .patch(verifyVendorJWT,updateBussinessInfo);

router.route("/logo").patch( bussinessUpload.fields([
    {
        name: "brandLogo",
        maxCount: 1
    }, 
    {
        name: "coverImage",
        maxCount: 1
    }
]),updateBussinesslogo);

router
    .route("/detail")
    .get(getBussinessById)
    .patch(updateStatusBussiness);
    // .delete(deleteBussiness)

router.route("/active").get(getActiveBussiness);

router.route("/aminities/")
// .get(verifyVendorJWT, getAllActivity)
    .post(verifyVendorJWT, addAminities);
    // .delete(verifyVendorJWT, deleteActivity);
    // .patch(itemUpload.single("image"), updateActivity);


export default router