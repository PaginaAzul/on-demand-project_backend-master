const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const db = mongoose.connection;
var Schema = mongoose.Schema;
let Storerating = mongoose.Schema({

    resAndStoreId: { type :Schema.Types.ObjectId,ref:"sellers"},
    userId: { type :Schema.Types.ObjectId,ref:"users"},
    productId: { type :Schema.Types.ObjectId,ref:"products"},
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
Storerating.plugin(mongoosePaginate)
Storerating.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('storeratings', Storerating);