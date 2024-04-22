import { Router } from 'express';
import {
    getDashboardCounts

} from "../controllers/report.controller.js"
// import { verifyVendorJWT } from "../middlewares/auth.middleware.js"
// import { itemUpload } from "../middlewares/multer.middleware.js"

const router = Router();
// router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/dashboardCounts/").get(getDashboardCounts);



export default router