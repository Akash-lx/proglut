import { Router } from 'express';
import {
    getAllGallery,
addGallery,
getGalleryById,
updateGallery,
updateStatusGallery,
deleteGallery,
getActiveGallery
} from "../controllers/gallery.controller.js"
import {verifyVendorJWT} from "../middlewares/auth.middleware.js"
import {galleryUpload} from "../middlewares/multer.middleware.js"

const router = Router();
// router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/gallery/").get(verifyVendorJWT,getAllGallery)
    .post(verifyVendorJWT,galleryUpload.single("image"),addGallery)
    .patch(galleryUpload.single("image"), updateGallery);

router
    .route("/gallery/detail")
    .get(getGalleryById)
    .patch(updateStatusGallery);
    // .delete(deleteGallery)

router.route("/gallery/active").get(verifyVendorJWT,getActiveGallery);

router.route("/rules/").get(getAllGallery)
    .post(verifyVendorJWT,addGallery)
    .patch(updateGallery);

router
    .route("/rules/detail")
    .get(getGalleryById)
    .patch(updateStatusGallery);
    // .delete(deleteGallery)

router.route("/rules/active").get(verifyVendorJWT,getActiveGallery);

export default router