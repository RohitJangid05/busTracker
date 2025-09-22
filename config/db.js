const mongoose = require('mongoose')

let connectDB = () => {
    return mongoose.connect(`${process.env.MONGO_URI}`).then(() => {
        console.log("Databasse connected sucessfully")
    }).catch((error) => {
        console.log(error)
    })
}

module.exports = connectDB