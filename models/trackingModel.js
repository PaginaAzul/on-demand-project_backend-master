const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
let Tracking = mongoose.Schema({

    roomId:{
        type:String
    },
    latitude:{
        type:String
    },
    longitude:{
        type:String
    }
},{
    timestamps: true
})
Tracking.plugin(mongoosePaginate)
Tracking.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('tracking', Tracking);