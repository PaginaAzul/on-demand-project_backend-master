const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const db = mongoose.connection;
var Schema = mongoose.Schema;
let Cart = mongoose.Schema({

    resAndStoreId: { type :Schema.Types.ObjectId,ref:"sellers"},
    userId: { type :Schema.Types.ObjectId,ref:"users"},
    productId: { type :Schema.Types.ObjectId,ref:"products"},
    status:{
        type:String,
        enum:['Active','Inactive'],
        default:'Active'
    },
    type:{
        type:String
    },
    quantity:{
        type:Number,
        default:1
    }
},{
    timestamps: true
})
Cart.plugin(mongoosePaginate)
Cart.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('carts', Cart);