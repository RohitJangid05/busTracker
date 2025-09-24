const busModel = require("../model/busModel");
let userModel = require("../model/userModel.js");

let userDashboard = async (req, res) => {
    let buses = await busModel.find({});
    let user = req.user
    buses.forEach(bus => {
        bus.route.sort((a, b) => {
            let timeA = new Date("1970/01/01 " + a.time);
            let timeB = new Date("1970/01/01 " + b.time);
            return timeA - timeB;
        });
    });

    res.render("userDashboard", {
        title: "TrackOn | User Dashboard",
        buses,
        pickup: user.pickup,
        user,
        form: null,
    });
}

let addPickup = async (req, res) => {
    let { busId, routeId } = req.params;
    let { id } = req.user;

    try {
        let bus = await busModel.findById(busId);
        let user = await userModel.findById(id)

        bus.route.sort((a, b) => {
            let timeA = new Date("1970/01/01 " + a.time);
            let timeB = new Date("1970/01/01 " + b.time);
            return timeA - timeB;
        });

        if (!bus) return res.redirect("/user/dashboard");
        if (!user) return res.redirect("/user/dashboard");

        let route = bus.route.id(routeId);
        if (!route) return res.redirect("/user/dashboard");

        if (user.pickup.pickupStation == route.stationName && user.pickup.busNumber == bus.busNumber) {
            await userModel.findByIdAndUpdate(
                id,
                { $unset: { pickup: "" } },
                { new: true }
            );
            req.flash("alertMessage", "Pickup point removed");
            return res.redirect('/user/dashboard')
        }

        if (route.stationName === bus.route.at(-1).stationName) {
            req.flash("alertMessage", "Last Stop, Bus ends here, cannot mark this as pickup");
        } else if (route.status !== "next") {
            req.flash("alertMessage", "Please mark your pickup point on the next station");
        } else if (!bus.bookingStatus) {
            req.flash("alertMessage", "No more booking is accepted");
        } else if (bus.busStatus == "cancelled") {
            req.flash("alertMessage", "Sorry, you cannot book as this bus is cancelled");
        } else {
            req.flash("alertMessage", "Pickup point marked");
        }

        if (route.status === "next" && bus.bookingStatus && route.stationName != bus.route.at(-1).stationName && bus.busStatus !== "cancelled") {
            await userModel.findByIdAndUpdate(
                id,
                { pickup: { pickupStation: route.stationName, busNumber: bus.busNumber } },
                { new: true }
            );
        }

        return res.redirect("/user/dashboard");
    } catch (error) {
        console.error(error);
        return res.redirect("/user/dashboard");
    }
}

module.exports = { userDashboard, addPickup }