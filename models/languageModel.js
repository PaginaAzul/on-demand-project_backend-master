const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const db = mongoose.connection;
var Schema = mongoose.Schema;
let Language = mongoose.Schema({

   
    language:{
        type:String
    },
    status:{
        type:String,
        enum:['ACTIVE','INACTIVE'],
        default:'ACTIVE'
    }
},{
    timestamps: true
})
Language.plugin(mongoosePaginate)
Language.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('language', Language);