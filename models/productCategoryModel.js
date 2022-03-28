const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const db = mongoose.connection;
var Schema = mongoose.Schema;
let Productcategory = mongoose.Schema({

    name:{
       type:String
    },
    portName:{
        type:String
    },
    image:{
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
Productcategory.plugin(mongoosePaginate)
Productcategory.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('productcategorys', Productcategory);