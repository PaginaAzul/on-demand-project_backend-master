var mongoose=require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
var Schema = mongoose.Schema;
var Driver=mongoose.Schema({

    location: {
        type: { type: String, default: 'Point', enum: ['Point'] },
        coordinates: [{ type: Number, createIndexes: true }],
    },
    userName:{
        type:String
    },
    fullName:{
        type:String
    },
    name:{
        type:String,
        trim:true
    },
    status:{
        type:String,
        enum:['Active','Inactive'],
        default:'Active'
    },
    address:{
        type:String
    },
    email:{
        type:String
    },
    countryCode:{
        type:String
    },
    mobileNumber:{
        type:String
    },
    state:{
        type:String
    },
    city:{
        type:String
    },
    image:{
        type:String
    },
    vehicleType:{
        type:String
    },
    brand:{
        type:String
    },
    vehicleNumber:{
        type:String
    },
    vehicleImages:[{
        image:{
            type:String
        }
    }],
    licenseNumber:{
        type:String
    },
    licenseImage:{
        type:String
    },
    insuranceNumber:{
        type:String
    },
    insuranceImage:{
        type:String
    },
    adminVerifyStatus:{
        type:Boolean,
        default:false
    },
    totalRating:{
        type:Number,
        default:0
    },
    avgRating:{
        type:Number,
        default:0
    },
    totalRatingByUser:{
        type:Number,
        default:0
    },
    latitude:{
        type:String
    },
    longitude:{
        type:String
    },
    emailOtp:{
        type:String
    },
    adminVerifyStatus:{
        type:String,
        enum:['Pending','Approve','Cancel'],
        default:'Pending'
    },
    notificationStatus:{
        type:Boolean,
        default:true
    },
    dutyStatus:{
        type:Boolean,
        default:true
    },
    deviceType:{
        type:String
    },
    deviceToken:{
        type:String
    },
    appLanguage:{
        type:String
    },
    jwtToken:{
        type:String
    },
    onlineStatus:{
        type:String
    },
    deleteStatus:{
        type:Boolean,
        default:false
    }
},{
    timestamps:true
})
Driver.index({ location: '2dsphere' });
Driver.plugin(mongoosePaginate)
Driver.plugin(mongooseAggregatePaginate);
module.exports=mongoose.model('drivers',Driver);