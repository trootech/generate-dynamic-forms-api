const express = require("express");
const router = express.Router();
const formCtrl = require('../controller/forms.controller');
const rules = require('../validations/forms.validation');
const uploadStorage = require("../middleware/appbanners");
const authJwt = require('../middleware/authJwt')


router.post("/forms/create", rules.Create(), [authJwt.verifyToken], formCtrl.Create);
router.post("/forms/update", rules.Update(), [authJwt.verifyToken], formCtrl.UpdateForm);
router.get("/forms/all", [authJwt.verifyToken], formCtrl.List);
router.get('/forms/by/', formCtrl.DetailsByID);
router.delete('/forms/deleteForm/', [authJwt.verifyToken], formCtrl.DeleteForm);
router.post('/forms/savedetailsnew',  uploadStorage.single("image") ,formCtrl.SaveFormDetailsNew);
router.put("/forms/UpdateEntries", rules.UpdateFormDetails(), [authJwt.verifyToken, uploadStorage.single("image")], formCtrl.UpdateEntriesNew);
router.get("/forms/GetAllFormEntriesNew", [authJwt.verifyToken], formCtrl.GetAllFormEntriesNew);
router.get("/forms/GetEntriesById", [authJwt.verifyToken], formCtrl.GetEntriesByEntryID);
router.delete("/forms/DeleteEntries", [authJwt.verifyToken], formCtrl.DeleteEntries);

module.exports = router;