const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const db = mongoose.connection;
var Schema = mongoose.Schema;
let Rating = mongoose.Schema({

   
    orderId: { type :Schema.Types.ObjectId,ref:"service"},
    ratingBy: { type :Schema.Types.ObjectId,ref:"user"},
    ratingTo: { type :Schema.Types.ObjectId,ref:"user"},
    ratingByType:{
        type:String
    },
    ratingToType:{
        type:String
    },
    status:{
        type:String,
        enum:['ACTIVE','INACTIVE'],
        default:'ACTIVE'
    },
    ratingByName:{
        type:String
    },
    ratingToName:{
        type:String
    },
    userName:{
        type:String
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
Rating.plugin(mongoosePaginate)
Rating.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('rating', Rating);