import { Router } from 'express';
import {
    getAllMaster,
addMaster,
getMasterById,
updateMaster,
updateStatusMaster,
deleteMaster,
getActiveMaster,
updateApplicationSetting
} from "../controllers/master.controller.js"
import {verifyVendorJWT} from "../middlewares/auth.middleware.js"

const router = Router();
// router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/unit/").get(getAllMaster)
    .post(verifyVendorJWT,addMaster)
    .patch(verifyVendorJWT,updateMaster);

router
    .route("/unit/detail")
    .get(getMasterById)
    .patch(verifyVendorJWT,updateStatusMaster);
    // .delete(deleteMaster)

router.route("/unit/active").get(getActiveMaster);
router.route("/application-setting").patch(verifyVendorJWT,updateApplicationSetting);


export default router