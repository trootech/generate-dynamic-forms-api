const authJwt = require("../middleware/authJwt");
const controller = require("../controller/user.controller");
const express = require("express");
const router = express.Router();

router.get("/auth/all", controller.allAccess);

router.get("/auth/user", [authJwt.verifyToken], controller.userBoard);

router.get(
  "/auth/mod",
  [authJwt.verifyToken, authJwt.isModerator],
  controller.moderatorBoard
);

router.get(
  "/auth/admin",
  [authJwt.verifyToken, authJwt.isAdmin],
  controller.adminBoard
);

module.exports = router;
