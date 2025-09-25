const userModel = require('../model/userModel.js')
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")

function generateToken(user) {
    return jwt.sign(
        { id: user._id, email: user.email, role: user.role, image: user.image, pickup: user.pickup },
        process.env.SECRET,
        { expiresIn: "1h" }
    );
}

let signUp = async (req, res) => {
    try {
        let { name, email, password, confirmPassword, role } = req.body;
        let existingUser = await userModel.findOne({ email, role });

        if (existingUser) {
            req.flash("alertMessage", "User already exist");
            return res.redirect('/signup');
        }

        if (password !== confirmPassword) {
            req.flash("alertMessage", "password and confirm password didn't matched");
            return res.redirect('/signup');
        }

        let hashedPassword = await bcrypt.hash(password, 10);
        let user = await userModel.create({
            name,
            email,
            password: hashedPassword,
            role,
        });

        let token = generateToken(user);

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 60 * 60 * 1000,
        });

        return res.redirect("/login");

    } catch (error) {
        console.error("Signup error:", error);
        return res.render("signup", { title: "TrackOn | Signup", user: null, form: "nav-bg" });
    }
}

let login = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const existingUser = await userModel.findOne({ email, role });

        if (!existingUser) {
            req.flash("alertMessage", "User is not authorized");
            return res.redirect('/login');
        }

        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
            req.flash("alertMessage", "Email or password is incorrect");
            return res.redirect('/login');
        }

        const token = generateToken(existingUser);

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 60 * 60 * 1000, 
        });

        if (existingUser.role === "user" && role === "user") return res.redirect("/user/dashboard");
        if (existingUser.role === "driver" && role === "driver") return res.redirect("/driver/dashboard");

        req.flash("alertMessage", "Not authorized");
        return res.redirect("/login");

    } catch (error) {
        console.error("Login error:", error);
        return res.render("login", { title: "TrackOn | Login", user: null, form: "nav-bg" });
    }
};



module.exports = { signUp, login }