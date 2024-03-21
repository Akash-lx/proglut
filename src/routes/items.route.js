import { Router } from 'express';
import {
    getAllItem,
    addItem,
    getItemById,
    updateItem,
    updateStatusItem,
    deleteItem,
    getActiveItem
} from "../controllers/items.controller.js"
import { verifyVendorJWT } from "../middlewares/auth.middleware.js"
import { itemUpload } from "../middlewares/multer.middleware.js"

const router = Router();
// router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/item/").get(verifyVendorJWT, getAllItem)
    .post(verifyVendorJWT, itemUpload.single("image"), addItem)
    .patch(itemUpload.single("image"), updateItem);

router
    .route("/item/detail")
    .get(getItemById)
    .patch(updateStatusItem);
// .delete(deleteItem)

router.route("/item/active").get(verifyVendorJWT, getActiveItem);

router.route("/food/").get(getAllItem)
    .post(verifyVendorJWT, itemUpload.single("image"), addItem)
    .patch(itemUpload.single("image"), updateItem);

router
    .route("/food/detail")
    .get(getItemById)
    .patch(updateStatusItem);
// .delete(deleteItem)

router.route("/food/active").get(verifyVendorJWT, getActiveItem);

export default router