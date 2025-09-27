const busModel = require("../model/busModel");


function convertTo12Hour(time) {
    let [hours, minutes] = time.split(":").map(Number);
    let period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

let driverDashboard = async (req, res) => {
    let user = req.user
    let buses = await busModel.find({ driver: user.id });
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
}

let addBusDetails = async (req, res) => {
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
        req.flash("alert", { text: "Bus details added sucessfully", class: "success" });
        res.redirect("/driver/dashboard")

    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).send("Duplicate bus entry not allowed");
        }
        console.error(err);
        res.status(500).send("Error adding bus details");
    }
}

let updateBusStatus = async (req, res) => {
    try {
        let { id } = req.params;
        let { busStatus, bookingStatus } = req.body;

        await busModel.findByIdAndUpdate(id, { $set: { busStatus, bookingStatus } },
            { new: true })
        req.flash("alert", { text: "Bus details updated sucessfully", class: "success" });
        res.redirect('/driver/dashboard')
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating status");
    }
}

let updateBusRouteStatus = async (req, res) => {
    try {
        let { busId, routeId } = req.params;
        let { status } = req.body;

        await busModel.updateOne(
            { _id: busId, "route._id": routeId },
            { $set: { "route.$.status": status } }
        );

        req.flash("alert", { text: "Bus route status updated sucessfully", class: "success" });
        res.redirect('/driver/dashboard')
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating status");
    }
}

let deleteBus = async (req, res) => {
    try {
        let { id } = req.params;

        await busModel.findByIdAndDelete(id)

        req.flash("alert", { text: "Bus deleted successfully", class: "info" });
        res.redirect('/driver/dashboard')
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating status");
    }
}

let deleteBusStation = async (req, res) => {
    try {
        let { busId, routeId } = req.params;

        await busModel.findByIdAndUpdate(
            busId,
            { $pull: { route: { _id: routeId } } },
            { new: true }
        );

        req.flash("alert", { text: "Station deleted successfully", class: "info" });
        res.redirect('/driver/dashboard')
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating status");
    }
}

module.exports = { driverDashboard, addBusDetails, updateBusStatus, updateBusRouteStatus, deleteBus, deleteBusStation }