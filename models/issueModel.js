const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const db = mongoose.connection;
var Schema = mongoose.Schema;
let Issue = mongoose.Schema({

   
    orderId: { type :Schema.Types.ObjectId,ref:"service"},
    issueBy: { type :Schema.Types.ObjectId,ref:"user"},
    userType:{
        type:String
    },
    status:{
        type:String,
        enum:['ACTIVE','INACTIVE'],
        default:'ACTIVE'
    },
    issueReason:{
        type:String
    },
    issueMessage:{
        type:String
    }  
},{
    timestamps: true
})
Issue.plugin(mongoosePaginate)
Issue.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('issue', Issue);