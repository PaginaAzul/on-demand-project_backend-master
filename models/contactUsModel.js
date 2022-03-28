const mongoose = require('mongoose');
const schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
var Schema = mongoose.Schema;
var contact = new schema({
   
  
    userId:{
        type: Schema.Types.ObjectId,ref:'user'
    },
    driverId:{
        type: Schema.Types.ObjectId,ref:'drivers'
    },
    reason:{
        type:String
    },
    description:{
        type:String
    },
    type:{
        type:String,
        default:'User'
    }
    },
    { timestamps: true }
    );

contact.plugin(mongoosePaginate)
contact.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('contact', contact);