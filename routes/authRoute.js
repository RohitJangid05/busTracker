const express = require('express')
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

let router = express.Router()

router.get('/signup', (req, res) => {
  res.render("signup", { title: "TrackOn | Signup", user: null, form: "nav-bg" })
})

router.get('/login', (req, res) => {
  res.render("login", { title: "TrackOn | Login", user: null, form: "nav-bg" })
})

router.post("/signup", async (req, res) => {
  try {
    let { name, email, password, confirmPassword, role } = req.body;
    let existingUser = await userModel.findOne({ email, role });

    if (existingUser) {
      return res.render("signup", { title: "TrackOn | Signup", user: null, form: "nav-bg" });
    }

    if (password !== confirmPassword) {
      return res.render("signup", { title: "TrackOn | Signup", user: null, form: "nav-bg" });
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
});

router.post("/login", async (req, res) => {
  try {

    let { email, password, role } = req.body

    let existingUser = await userModel.findOne({ email, role })

    if (!existingUser) return res.status(400).json({ messge: "user or password is incorrect" })

    let compare = await bcrypt.compare(password, existingUser.password)

    if (!compare) return res.status(400).json({ messge: "user or password is incorrect" })

    let token = generateToken(existingUser);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 60 * 60 * 1000,
    });

    if (existingUser.role == "user" && role == "user") return res.redirect("/user/dashboard")
    if (existingUser.role == "driver" && role == "driver") return res.redirect("/driver/dashboard")

    res.json({ messge: "Not authorized" })

  } catch (error) {
    console.error("Signup error:", error);
    return res.render("login", { title: "TrackOn | Login", user: null, form: "nav-bg" });
  }
})

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});


module.exports = router