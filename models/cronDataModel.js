const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
var Schema = mongoose.Schema;
let CronData = mongoose.Schema({

    userId: { type: Schema.Types.ObjectId },
    orderId: { type: Schema.Types.ObjectId},
    offerId: { type: Schema.Types.ObjectId},
    apiRunTime:{
        type:Number
    },
    status: {
        type:Boolean,
        default:false
    }
}, {
    timestamps: true
})
CronData.plugin(mongoosePaginate)
CronData.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('cronDatas', CronData);