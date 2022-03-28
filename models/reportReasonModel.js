const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const db = mongoose.connection;
var Schema = mongoose.Schema;
let Report_Reason = mongoose.Schema({

    reportReason: {
        type: String
    },
    status:{
        type:String,
        enum:['ACTIVE','INACTIVE'],
        default:'ACTIVE'
    },
}, {
        timestamps: true
    })
Report_Reason.plugin(mongoosePaginate)
Report_Reason.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('report_reasons', Report_Reason);