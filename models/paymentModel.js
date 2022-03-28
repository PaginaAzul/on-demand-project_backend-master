const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const db = mongoose.connection;
var Schema = mongoose.Schema;
let Payment = mongoose.Schema({

    resAndStoreId: { type :Schema.Types.ObjectId,ref:"sellers"},
    userId: { type :Schema.Types.ObjectId,ref:"users"},
    driverId: { type :Schema.Types.ObjectId,ref:"drivers"},
    orderId: { type :Schema.Types.ObjectId,ref:"productorders"},
    sellerAmount:{
        type:Number
    },
    driverAmount:{
        type:Number
    },
    adminAmount:{
        type:Number
    },
    totalAmount:{
        type:Number
    },
    status:{
        type:String,
        enum:['Active','Inactive'],
        default:'Active'
    },
    deleteStatus:{
        type:Boolean,
        default:false
    }
},{
    timestamps: true
})
Payment.plugin(mongoosePaginate)
Payment.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('payments', Payment);