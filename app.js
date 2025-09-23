require('dotenv').config();
const express = require("express")
const path = require("path");
const connectDB = require("./config/db")
const authRoute = require('./routes/authRoute.js');
const userRoute = require('./routes/userRoute.js')
const driverRoute = require('./routes/driverRoute.js')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const session = require("express-session");
const flash = require("connect-flash");

connectDB()
let app = express()

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true
}));

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({extended:true}))
app.use(cookieParser())
app.use(flash());

app.use((req, res, next) => {
  res.locals.alertMessage = req.flash("alertMessage");
  next();
});

app.use('/', authRoute)
app.use("/user",userRoute)
app.use("/driver",driverRoute)

app.get('/', (req, res) => {
    let user;
    if(req.cookies){
        user = req.cookies.user
    }else{
        user = null
    }
    res.render("index", {title:"Trackon", user, form:"nav-bg"})
})

app.get('/about',(req,res)=>{
    let user;
    if(req.cookies){
        user = req.cookies.user
    }else{
        user = null
    }
    res.render("about", {title:"Trackon | About Us", user, form:"nav-bg"})
})


let port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Your server is running at http://localhost:${port}`)
})