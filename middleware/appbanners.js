const multer = require("multer");
const fs = require("fs");
const path = require("path");
var bannerStorage = multer.diskStorage({
    destination: async function (req, file, cb) {
        const banneruploadDir = path.join(__dirname, "..", "public", "banner");
        if (fs.existsSync(banneruploadDir)) {
            cb(null, banneruploadDir);
        } else {
            fs.mkdirSync(banneruploadDir, {recursive: true});
            cb(null, banneruploadDir);
        }
    },
    filename: async function (req, file, cb) {
        const extension = file.originalname.substring(file.originalname.lastIndexOf('.'));
        cb(null , Math.random().toString(36).substring(2, 15) + "_" + Date.now() + extension)
    },
  });
  const uploadBannerImg = multer({
    storage: bannerStorage,
    fileFilter: function (req, file, cb) {
        const fileType = /jpeg|jpg|png/;
        const extension = file.originalname.substring(
            file.originalname.lastIndexOf(".") + 1
        );
        const mimetype = fileType.test(file.mimetype);
        file.filepath = '/banner/'
        if (mimetype && extension) {
            return cb(null, true);
        } else {
            cb("Error:you can upload only Image file");
        }
    },
  });

module.exports = uploadBannerImg;