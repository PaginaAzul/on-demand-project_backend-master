var mongoose=require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
var Schema = mongoose.Schema;
var Seller=mongoose.Schema({

    location: {
        type: { type: String, default: 'Point', enum: ['Point'] },
        coordinates: [{ type: Number, createIndexes: true }],
    },
    name:{
        type:String
    },
    image:{
        type:String
    },
    description:{
        type:String
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
    storeType:{
        type:String,
        enum:['Grocery Store','Restaurant']
    },
    password:{
        type:String
    },
    document:{
        type:String
    },
    adminVerifyStatus:{
        type:String,
        enum:['Pending','Approve','Cancel'],
        default:"Pending"
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
    deliveryTime:{
        type:Number
    },
    minimumValue:{
        type:Number
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
    emailVerificationStatus:{
        type:Boolean,
        default:false
    },
    openingTime:{
        type:String
    },
    closingTime:{
        type:String
    },
    openingSeconds:{
        type:Number
    },
    closingSeconds:{
        type:Number
    },
    jwtToken:{
        type:String
    },
    notificationStatus:{
        type:Boolean,
        default:true
    },
    cuisines:[{
        cuisineId:{ type :Schema.Types.ObjectId,ref:"cuisines"}
    }],
    cuisinesName:[],
    categoryIds:[{
        categoryId:{ type :Schema.Types.ObjectId,ref:"productCategorys"}
    }],
    categoryName:[],
    subCategoryId:[{
        subCategoryId: { type :Schema.Types.ObjectId,ref:"productSubCategorys"},
    }],
    subCategoryName:[],
    deleteStatus:{
        type:Boolean,default:false
    }
},{
    timestamps:true
})
Seller.index({ location: '2dsphere' });
Seller.plugin(mongoosePaginate)
Seller.plugin(mongooseAggregatePaginate);
module.exports=mongoose.model('sellers',Seller);