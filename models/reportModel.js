const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
var Schema = mongoose.Schema;
let Report = mongoose.Schema({

    orderId: { type :Schema.Types.ObjectId,ref:"service"},
    reportBy: { type :Schema.Types.ObjectId,ref:"users"},
    reportResaon:{
        type:String
    },
    reportMessage:{
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
Report.plugin(mongoosePaginate)
Report.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('report', Report);