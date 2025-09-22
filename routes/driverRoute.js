const express = require("express")
const jwt = require('jsonwebtoken')
const busModel = require("../model/busModel")

let router = express.Router()

function authMiddleware(req, res, next) {
    let { token, user } = req.cookies
    if (!token || user !== "driver") return res.redirect("/login")
    try {
        let decoded = jwt.verify(token, process.env.SECRET)
        if (!decoded) return res.redirect('/login')
        req.user = decoded
        next()
    } catch (error) {
        console.error("Something went wrong")
        res.json({ message: "something went wrong" })
    }
}

function convertTo12Hour(time) {
    let [hours, minutes] = time.split(":").map(Number);
    let period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

router.get("/dashboard", authMiddleware, async (req, res) => {
    let { id } = req.user
    let user = req.cookies
    let buses = await busModel.find({ driver: id });
    buses.forEach(bus => {
        bus.route.sort((a, b) => {
            let timeA = new Date("1970/01/01 " + a.time);
            let timeB = new Date("1970/01/01 " + b.time);
            return timeA - timeB;
        });
    });

    res.render("driverDashboard", {
        title: "TrackOn | Driver Dashboard",
        buses,
        user,
        form: null
    });
})

router.post('/add-bus-details', authMiddleware, async (req, res) => {
    let { id } = req.user;
    let { busNumber, stationName, time, status } = req.body;
    let formattedTime = convertTo12Hour(time);

    let route = {
        stationName,
        time: formattedTime,
        status: status || 'current'
    };

    try {
        let existingBus = await busModel.findOne({ busNumber });

        if (existingBus) {
            existingBus.route.push(route);
            await existingBus.save();
        } else {
            await busModel.create({
                driver: id,
                busNumber,
                route: [route],
            });
        }
        res.redirect("/driver/dashboard")

    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).send("Duplicate bus entry not allowed");
        }
        console.error(err);
        res.status(500).send("Error adding bus details");
    }
});

router.post('/update-status/:busId/:routeId', authMiddleware, async (req, res) => {
    try {
        let { busId, routeId } = req.params;
        let { status } = req.body;

        await busModel.updateOne(
            { _id: busId, "route._id": routeId },
            { $set: { "route.$.status": status } }
        );

        res.redirect('/driver/dashboard')
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating status");
    }
});

router.post("/update-bus-status/:id", authMiddleware, async (req, res) => {
    try {
        let { id } = req.params;
        let { busStatus, bookingStatus } = req.body;

        await busModel.findByIdAndUpdate(id, { $set: { busStatus, bookingStatus } },
            { new: true })

        res.redirect('/driver/dashboard')
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating status");
    }
})

router.post('/delete-bus/:id', authMiddleware, async (req, res) => {
    try {
        let { id } = req.params;

        await busModel.findByIdAndDelete(id)

        res.redirect('/driver/dashboard')
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating status");
    }
})

router.post('/delete-bus-station/:busId/:routeId', authMiddleware, async (req, res) => {
    try {
        let { busId, routeId } = req.params;

        await busModel.findByIdAndUpdate(
            busId,
            { $pull: { route: { _id: routeId } } },
            { new: true }
        );

        res.redirect('/driver/dashboard')
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating status");
    }
});


module.exports = router