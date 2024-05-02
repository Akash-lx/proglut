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
    getApplicationSetting,
    addImageMaster,
    updateImageMaster,
    getComplaints,
    addComplaint,
    updateStatusComplaint,
    getNotifications,
    addNotification,
    updateStatusNotification,
    deleteNotification
} from "../controllers/master.controller.js"
import { verifyVendorJWT } from "../middlewares/auth.middleware.js"
import { adminUpload } from '../middlewares/multer.middleware.js';
import { domainUpload } from '../middlewares/multer.middleware.js';

const router = Router();
router.use(verifyVendorJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/unit/").get(getAllMaster)
    .post(addMaster)
    .patch(updateMaster);

router
    .route("/unit/detail")
    .get(getMasterById)
    .patch(updateStatusMaster);
// .delete(deleteMaster)

router.route("/unit/active").get(getActiveMaster);

router.route("/banner/").get(getAllMaster)
    .post(domainUpload.single("image"), addImageMaster)
    .patch(domainUpload.single("image"), updateImageMaster);

router
    .route("/banner/detail")
    .get(getMasterById)
    .patch(updateStatusMaster);
// .delete(deleteMaster)

router.route("/banner/active").get(getActiveMaster);

router.route("/advertise/").get(getAllMaster)
    .post(domainUpload.single("image"), addImageMaster)
    .patch(domainUpload.single("image"), updateImageMaster);

router
    .route("/advertise/detail")
    .get(getMasterById)
    .patch(updateStatusMaster);
// .delete(deleteMaster)

router.route("/advertise/active").get(getActiveMaster);

router.route("/complaint")
    .get(getComplaints)
    .post(addComplaint)
    .patch(updateStatusComplaint);

router.route("/notification")
    .get(getNotifications)
    .post(addNotification)
    .patch(updateStatusNotification)
    .delete(deleteNotification);



router.route("/application-setting").get(getApplicationSetting)
    .patch(updateApplicationSetting);
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
]), uploadfileSetting);


export default router