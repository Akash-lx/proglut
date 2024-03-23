import { Router } from 'express';
import {
    getAllMaster,
addMaster,
getMasterById,
updateMaster,
updateStatusMaster,
deleteMaster,
getActiveMaster
} from "../controllers/master.controller.js"
// import {verifyVendorJWT} from "../middlewares/auth.middleware.js"

const router = Router();
// router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/unit/").get(getAllMaster)
    .post(addMaster)
    .patch(updateMaster);

router
    .route("/unit/detail")
    .get(getMasterById)
    .patch(updateStatusMaster);
    // .delete(deleteMaster)

router.route("/unit/active").get(getActiveMaster);


export default router