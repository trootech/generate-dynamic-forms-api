const verifySignUp = require("../middleware/verifySignUp");
const controller = require("../controller/auth.controller");
const validate =   require('../middleware/validate');
const { check } = require('express-validator');
const uploadprofile = require("../middleware/profile");
const authJwt = require('../middleware/authJwt')

const express = require("express");
const router = express.Router();

const app = express();

app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

router.post("/auth/signup", uploadprofile.single("profile_image") ,[verifySignUp.checkDuplicateUsernameOrEmail, verifySignUp.checkRolesExisted] ,
  controller.signup);
router.post("/auth/signin", controller.signin);
router.post("/auth/logout", controller.logout);
router.post("/auth/refreshtoken", controller.refreshToken);
router.post("/auth/changepassword", controller.changePassword);
router.put("/auth/updateprofileimage", [authJwt.verifyToken] , uploadprofile.single("profile_image"), controller.UpdateProfileImage);
router.get("/auth/getprofile", [authJwt.verifyToken], controller.getProfileinfo);
// router.post("/auth/forgot_password", [
//   check('email').isEmail().withMessage('Enter a valid email address'),
// ], validate, controller.forgetpassword);
// router.get('/auth/reset/:token', controller.reset);
// router.post('/auth/reset/:token', controller.resetPassword);

module.exports = router;