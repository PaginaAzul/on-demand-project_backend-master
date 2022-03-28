const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const db = mongoose.connection;
var Schema = mongoose.Schema;
let Deliveryslot = mongoose.Schema({

    resAndStoreId: { type :Schema.Types.ObjectId,ref:"sellers"},
    openTime:{
        type:String
    },
    closeTime:{
        type:String
    },
    day:{
        type:String
    },
    timeSlot:{
        type:String
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
Deliveryslot.plugin(mongoosePaginate)
Deliveryslot.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('deliveryslots', Deliveryslot);