const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const db = mongoose.connection;
var Schema = mongoose.Schema;
let Banner = mongoose.Schema({


    bannerType:{
        type:String,
        enum:['Advertisement','Marketing'],

    },
    bannerImage:{
        type:String
    },
    status:{
        type:String,
        enum:['ACTIVE','INACTIVE'],
        default:'ACTIVE'
    },
    time:{
        type:String
    },
    appScreenName:{
        type:String
    },
    text:{
        type:String
    },
    region:{
        type:String
    },
     
},{
    timestamps: true
})
Banner.plugin(mongoosePaginate)
Banner.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('banner', Banner);