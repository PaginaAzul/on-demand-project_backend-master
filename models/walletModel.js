const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const db = mongoose.connection;
var Schema = mongoose.Schema;
let Wallet = mongoose.Schema({

    userId: { 
        type: Schema.Types.ObjectId,
        trim:true, 
        ref: "user"
    },
    status:{
        type:String,
        enum:['Add','Paid']
    },
    name:{
        type:String
    },
    userType:{
        type:String
    },
    accountBalance:{
        type:Number
    },
    totalBillPaid:{
        type:Number
    },
    orderCount:{
        type:Number
    },
    tax:{
        type:Number
    },
    ourCommission:{
        type:Number
    },
    taxRecieved:{
        type:Number
    },
    totalDue:{
        type:Number
    },
    measurement:{
        type:String
    },
    status: {
        type: String
    },
  
}, {
    timestamps: true

})
Wallet.plugin(mongoosePaginate)
Wallet.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('wallet', Wallet);