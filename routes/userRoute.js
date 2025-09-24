const express = require("express");
const upload = require("../middleware/multer.js");
const uploadFile = require("../controller/upload.js");
const authMiddleware = require('../middleware/authMiddleware.js');
const {addPickup, userDashboard } = require("../controller/userController.js");

let router = express.Router();

router.get("/dashboard", authMiddleware, userDashboard);
router.post("/add-pickup/:busId/:routeId", authMiddleware, addPickup);
router.post('/upload-profile',authMiddleware, upload.single("image"),uploadFile)

module.exports = router;