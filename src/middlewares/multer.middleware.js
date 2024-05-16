
import multer from "multer";

const vendorStorage = multer.diskStorage({
  destination: "./public/vendorImages",
  filename: function (req, file, cb) {
    const d = new Date();
    let time = d.getTime();
    cb(null, `${time}${file.originalname}`);

  },
});

const userStorage = multer.diskStorage({
  destination: "./public/userImages",
  filename: function (req, file, cb) {
    const d = new Date();
    let time = d.getTime();
    cb(null, `${time}${file.originalname}`);
  },
});

const domainStorage = multer.diskStorage({
  destination: "./public/domainImages",
  filename: function (req, file, cb) {
    const d = new Date();
    let time = d.getTime();
    cb(null, `${time}${file.originalname}`);
  },
});

const itemStorage = multer.diskStorage({
  destination: "./public/itemImages",
  filename: function (req, file, cb) {
    const d = new Date();
    let time = d.getTime();
    cb(null, `${time}${file.originalname}`);
  },
});

const galleryStorage = multer.diskStorage({
  destination: "./public/galleryImages",
  filename: function (req, file, cb) {
    const d = new Date();
    let time = d.getTime();
    cb(null, `${time}${file.originalname}`);
  },
});

const bussinessStorage = multer.diskStorage({
  destination: "./public/bussinessImages",
  filename: function (req, file, cb) {
    const d = new Date();
    let time = d.getTime();
    cb(null, `${time}${file.originalname}`);
  },
});

const adminStorage = multer.diskStorage({
  destination: "./public/adminImages",
  filename: function (req, file, cb) {
    const d = new Date();
    let time = d.getTime();
    cb(null, `${time}${file.originalname}`);
  },
});



const vendorUpload = multer({ storage: vendorStorage , limits: { fileSize: 50 * 1024 * 1024 }});
const userUpload = multer({ storage: userStorage, limits: { fileSize: 50 * 1024 * 1024 } });
const domainUpload = multer({ storage: domainStorage , limits: { fileSize: 50 * 1024 * 1024 }});
const itemUpload = multer({ storage: itemStorage , limits: { fileSize: 50 * 1024 * 1024 } });
const galleryUpload = multer({ storage: galleryStorage , limits: { fileSize: 50 * 1024 * 1024 }});
const bussinessUpload = multer({ storage: bussinessStorage, limits: { fileSize: 50 * 1024 * 1024 } });
const adminUpload = multer({ storage: adminStorage , limits: { fileSize: 50 * 1024 * 1024 }});
export { vendorUpload,userUpload,domainUpload,itemUpload,galleryUpload,bussinessUpload,adminUpload}
