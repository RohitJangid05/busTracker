const express = require("express")
const upload = require("../middleware/multer")
const uploadFile = require("../controller/upload")
const authMiddleware = require('../middleware/authMiddleware')
const { driverDashboard, addBusDetails, updateBusRouteStatus, updateBusStatus, deleteBus, deleteBusStation} = require("../controller/driverController")

let router = express.Router()

router.get("/dashboard", authMiddleware, driverDashboard)
router.post('/add-bus-details', authMiddleware, addBusDetails);
router.post("/update-bus-status/:id", authMiddleware, updateBusStatus)
router.post('/update-status/:busId/:routeId', authMiddleware, updateBusRouteStatus);
router.post('/delete-bus/:id', authMiddleware, deleteBus)
router.post('/delete-bus-station/:busId/:routeId', authMiddleware, deleteBusStation);
router.post('/upload-profile', authMiddleware, upload.single("image"), uploadFile)

module.exports = router