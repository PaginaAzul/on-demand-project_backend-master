const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const db = mongoose.connection;
var Schema = mongoose.Schema;
let Exclusiveofferbanner = mongoose.Schema({

    image:{
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
Exclusiveofferbanner.plugin(mongoosePaginate)
Exclusiveofferbanner.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('exclusiveofferbanners', Exclusiveofferbanner);