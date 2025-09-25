const express = require('express')
const { signUp, login } = require('../controller/authController.js')

let router = express.Router()

router.get('/signup', (req, res) => {
  res.render("signup", { title: "TrackOn | Signup", user: null, form: "nav-bg" })
})

router.get('/login', (req, res) => {
  res.render("login", { title: "TrackOn | Login", user: null, form: "nav-bg" })
})

router.post("/signup", signUp);
router.post("/login", login)

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});


module.exports = router