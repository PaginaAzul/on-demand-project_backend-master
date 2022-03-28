const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const db = mongoose.connection;
var Schema = mongoose.Schema;
let Action = mongoose.Schema({

   
    action:{
        type:String
    },
    userId: { type: Schema.Types.ObjectId, ref: "admin" },
    status:{
        type:String,
        enum:['ACTIVE','INACTIVE'],
        default:'ACTIVE'
    }
},{
    timestamps: true
})
Action.plugin(mongoosePaginate)
Action.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('actions', Action);