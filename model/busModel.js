const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
    busNumber: { type: String, required: true },
    busStatus:{type: String, enum:["ontime","delayed","cancelled"], default:"ontime"},
    bookingStatus:{type:Boolean, default:true},
    route: [
        {
            stationName: { type: String, required: true },
            time: { type: String, required: true },
            status: { 
                type: String, 
                enum: ['previous', 'current', 'next'], 
                default: 'current', 
                required: true 
            }
        }
    ]
});

busSchema.index(
    { 'route.stationName': 1, 'route.time': 1, busNumber: 1 }, 
    { unique: true }
);


let busModel =mongoose.model('Bus', busSchema);
module.exports = busModel 
