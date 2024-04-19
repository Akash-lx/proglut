import { Router } from 'express';
import {
    getAllCategory,
addCategory,
getCategoryById,
updateCategory,
updateStatusCategory,
deleteCategory,
getActiveCategory
} from "../controllers/domain.controller.js"
// import {verifyVendorJWT} from "../middlewares/auth.middleware.js"
import {domainUpload} from "../middlewares/multer.middleware.js"

const router = Router();
// router.use(verifyVendorJWT);

router.route("/category/").get(getAllCategory)
    .post(domainUpload.single("image"),addCategory)
    .patch(domainUpload.single("image"), updateCategory);

router
    .route("/category/detail")
    .get(getCategoryById)
    .patch(updateStatusCategory);
    // .delete(deleteCategory)

router.route("/category/active").get(getActiveCategory);

router.route("/activity/").get(getAllCategory)
    .post(domainUpload.single("image"),addCategory)
    .patch(domainUpload.single("image"), updateCategory);

router
    .route("/activity/detail")
    .get(getCategoryById)
    .patch(updateStatusCategory);
    // .delete(deleteCategory)

router.route("/activity/active").get(getActiveCategory);

router.route("/aminities/").get(getAllCategory)
    .post(domainUpload.single("image"),addCategory)
    .patch(domainUpload.single("image"), updateCategory);

router
    .route("/aminities/detail")
    .get(getCategoryById)
    .patch(updateStatusCategory);
    // .delete(deleteCategory)

router.route("/aminities/active").get(getActiveCategory);

export default router