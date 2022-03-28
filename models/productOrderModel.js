const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const db = mongoose.connection;
var Schema = mongoose.Schema;
let Productorder = mongoose.Schema({

    resAndStoreId: { type :Schema.Types.ObjectId,ref:"sellers"},
    userId: { type :Schema.Types.ObjectId,ref:"users"},
    driverId: { type :Schema.Types.ObjectId,ref:"drivers"},
    orderData:[{
        productId: { type: Schema.Types.ObjectId, ref: "products" },
        quantity: {
            type: Number
        },
        price: {
            type: Number
        },
        actualAmount: {
            type: Number
        },
        amountWithQuantuty: {
            type: Number
        }
    }],
    orderType:{
        type:String
    },
    quantity:{
        type:Number,
        default:1
    },
    orderNumber:{
        type:String
    },
    price:{
        type:Number
    },
    offerPrice:{
        type:Number
    },
    offerApplicable:{
        type:Boolean,
        default:false
    },
    deliveryCharge:{
        type:Number
    },
    totalPrice:{
        type:Number
    },
    address:{
        type:String
    },
    latitude:{
        type:String
    },
    longitude:{
        type:String
    },
    landmark:{
        type:String
    },
    buildingAndApart:{
        type:String
    },
    paymentMode:{
        type:String
    },
    paymentAmount:{
        type:Number
    },
    status:{
        type:String,
        enum:['Pending','Accept','Reject','Cancel','Confirmed','In process','Out for delivery','Delivered'],
        default:'Pending'
    },
    deliveryDate:{
        type:String
    },
    deliverySlot:{
        type:String
    },
    deliveryTimeSlot:{
        type:String
    },
    excepetdDeliveryTime:{
        type:Number
    },
    driverAssign:{
        type:Boolean,
        default:false
    },
    offerAmount:{
        type:Number
    }
    
},{
    timestamps: true
})
Productorder.plugin(mongoosePaginate)
Productorder.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('productorders', Productorder);