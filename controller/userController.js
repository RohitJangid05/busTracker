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

    buses.sort((a, b) => {
        let isBusABlocked = a.busStatus === "canceled" || !a.bookingStatus;
        let isBusBBlocked = b.busStatus === "canceled" || !b.bookingStatus;

        if (isBusABlocked === isBusBBlocked) return 0;
        return isBusABlocked ? 1 : -1;
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
            req.flash("alert", { text: "Pickup point removed.", class: "info" });
            return res.redirect('/user/dashboard')
        }

        if (bus.busStatus == "cancelled") {
            req.flash("alert", { text: "Sorry for the inconvenience, the bus has been canceled.", class: "error" });
        } else if (!bus.bookingStatus) {
            req.flash("alert", { text: "No more booking is accepted", class: "warning" });
        } else if (route.stationName === bus.route.at(-1).stationName) {
            req.flash("alert", { text: "Last Stop, Bus ends here, cannot mark this as pickup", class: "warning" });
        } else if (route.status !== "next") {
            req.flash("alert", { text: "Please mark your pickup point on the next station", class: "info" });
        } else {
            req.flash("alert", { text: "Pickup point marked", class: "success" });
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