
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



const vendorUpload = multer({ storage: vendorStorage });
const userUpload = multer({ storage: userStorage });
const domainUpload = multer({ storage: domainStorage });
const itemUpload = multer({ storage: itemStorage });
const galleryUpload = multer({ storage: galleryStorage });
const bussinessUpload = multer({ storage: bussinessStorage });
const adminUpload = multer({ storage: adminStorage });
export { vendorUpload,userUpload,domainUpload,itemUpload,galleryUpload,bussinessUpload,adminUpload}
