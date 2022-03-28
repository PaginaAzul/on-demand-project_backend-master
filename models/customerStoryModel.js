const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const db = mongoose.connection;
var Schema = mongoose.Schema;
let Customerstory = mongoose.Schema({

    username:{
       type:String
    },
    image:{
        type:String
    },
    resAndStoreName:{
        type:String
    },
    status:{
        type:String,
        enum:['Active','Inactive'],
        default:'Active'
    }
},{
    timestamps: true
})
Customerstory.plugin(mongoosePaginate)
Customerstory.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('customerstorys', Customerstory);