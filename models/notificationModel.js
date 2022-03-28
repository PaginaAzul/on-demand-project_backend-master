const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
var Schema = mongoose.Schema;
let Notification = mongoose.Schema({

    notiBy: { type: Schema.Types.ObjectId, ref: "user" },
    notiTo: { type: Schema.Types.ObjectId, ref: "user" },
    driverId: { type: Schema.Types.ObjectId, ref: "drivers" },
    sellerId: { type: Schema.Types.ObjectId, ref: "sellerId" },
    notificationType:{
        type:String
    },
    orderId: { type: Schema.Types.ObjectId, ref: "service" },
    offerId: {
        type: Schema.Types.ObjectId,ref: "makeAOfferDeliveryPerson"
    },
    notiMessage:{
        type:String
    },
    roomId:{
        type:String
    },
    notiTitle:{
        type:String
    },
    notiTime:{
        type:Date
    },
    status: {
        type: String,
        enum:['Active','Inactive'],
        default:'Active'
    },
    isSeen:{
        type:Boolean,
        default:false
    },
    productOrderId:{ type :Schema.Types.ObjectId,ref:"productorders"}
}, {
    timestamps: true
})
Notification.plugin(mongoosePaginate)
Notification.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('notifications', Notification);