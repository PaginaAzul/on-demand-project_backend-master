const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const db = mongoose.connection;
var Schema = mongoose.Schema;
let OrderRating = mongoose.Schema({

   
    orderId: { type :Schema.Types.ObjectId,ref:"service"},
    status:{
        type:String,
        enum:['ACTIVE','INACTIVE'],
        default:'ACTIVE'
    },
    ratingMessage:{
        type:String
    },
    comments:{
        type:String
    },
    rate:{
        type:Number
    }  
},{
    timestamps: true
})
OrderRating.plugin(mongoosePaginate)
OrderRating.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('rrderRatings', OrderRating);