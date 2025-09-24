const jwt = require("jsonwebtoken");
const userModel = require("../model/userModel");

async function authMiddleware(req, res, next) {
  let { token} = req.cookies;
  if (!token) return res.redirect("/login");

  try {
    let decoded = jwt.verify(token, process.env.SECRET);
    if (!decoded) return res.redirect("/login");

    let user = await userModel.findById(decoded.id);
    if (!user) return res.redirect("/login");
    
    req.user = user;
  
    next();
  } catch (error) {
    console.error("Auth error", error);
    return res.redirect("/login");
  }
}

module.exports = authMiddleware