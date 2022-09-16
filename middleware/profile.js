const multer = require("multer");
const fs = require("fs");
const path = require("path");
var profilestorage = multer.diskStorage({
    destination: async function (req, file, cb) {
        const profileuploadDir = path.join(__dirname, "..", "public", "user");
        if (fs.existsSync(profileuploadDir)) {
            cb(null, profileuploadDir);
        } else {
            fs.mkdirSync(profileuploadDir, {recursive: true});
            cb(null, profileuploadDir);
        }
    },
    filename: async function (req, file, cb) {
        const extension = file.originalname.substring(file.originalname.lastIndexOf('.'));
        cb(null , Math.random().toString(36).substring(2, 15) + "_" + Date.now() + extension)
    },
  });
  const uploadProfileImg = multer({
    storage: profilestorage,
    fileFilter: function (req, file, cb) {
        const fileType = /jpeg|jpg|png/;
        const extension = file.originalname.substring(
            file.originalname.lastIndexOf(".") + 1
        );
        const mimetype = fileType.test(file.mimetype);
        file.filepath = '/user/'
        if (mimetype && extension) {
            return cb(null, true);
        } else {
            cb("Error:you can upload only Image file");
        }
    },
  });

module.exports = uploadProfileImg;