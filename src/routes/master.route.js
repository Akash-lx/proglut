import { Router } from 'express';
import {
    getAllMaster,
    addMaster,
    getMasterById,
    updateMaster,
    updateStatusMaster,
    deleteMaster,
    getActiveMaster,
    updateApplicationSetting,
    uploadfileSetting,
    getApplicationSetting
} from "../controllers/master.controller.js"
import { verifyVendorJWT } from "../middlewares/auth.middleware.js"
import { adminUpload } from '../middlewares/multer.middleware.js';

const router = Router();
// router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/unit/").get(getAllMaster)
    .post(verifyVendorJWT, addMaster)
    .patch(verifyVendorJWT, updateMaster);

router
    .route("/unit/detail")
    .get(getMasterById)
    .patch(verifyVendorJWT, updateStatusMaster);
// .delete(deleteMaster)

router.route("/unit/active").get(getActiveMaster);
router.route("/application-setting").get(verifyVendorJWT, getApplicationSetting)
    .patch(verifyVendorJWT, updateApplicationSetting);
router.route("/application-setting/uploads").patch(adminUpload.fields([
    {
        name: "icon",
        maxCount: 1
    },
    {
        name: "logo",
        maxCount: 1
    },
    {
        name: "banner",
        maxCount: 1
    }
]), verifyVendorJWT, uploadfileSetting);


export default router