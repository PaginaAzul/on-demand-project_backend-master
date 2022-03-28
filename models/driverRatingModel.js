const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const db = mongoose.connection;
var Schema = mongoose.Schema;
let Driverrating = mongoose.Schema({

    driverId: { type :Schema.Types.ObjectId,ref:"driverId"},
    userId: { type :Schema.Types.ObjectId,ref:"users"},
    orderId: { type :Schema.Types.ObjectId,ref:"productorders"},
    status:{
        type:String,
        enum:['Active','Inactive'],
        default:'Active'
    },
    rating:{
        type:Number
    },
    review:{
        type:String
    }
},{
    timestamps: true
})
Driverrating.plugin(mongoosePaginate)
Driverrating.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('driverratings', Driverrating);