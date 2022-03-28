const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const db = mongoose.connection;
var Schema = mongoose.Schema;
let Product = mongoose.Schema({

    resAndStoreId: { type :Schema.Types.ObjectId,ref:"sellers"},
    cuisineId: { type :Schema.Types.ObjectId,ref:"cuisines"},
    productCategoryId: { type :Schema.Types.ObjectId,ref:"productCategorys"},
    productSubCategoryId: { type :Schema.Types.ObjectId,ref:"productSubCategorys"},
    productNumber:{
        type:String
    },
    productImage:{
        type:String
    },
    productName:{
        type:String
    },
    description:{
        type:String
    },
    type:{
        type:String,
        enum:['Menu','Product']
    },
    productType:{
        type:String
    },
    status:{
        type:String,
        enum:['Active','Inactive'],
        default:'Active'
    },
    deleteStatus:{
        type:Boolean,
        default:false
    },
    offerEndDate:{
        type:Date
    },
    offerEndTime:{
        type:Number
    },
    offerPrice:{
        type:Number
    },
    currency:{
        type:String,
        default:'Kz'
    },
    offerStatus:{
        type:Boolean,
        default:false
    },
    quantity:{
        type:Number,
        default:1
    },
    measurement:{
        type:String
    },
    price:{
        type:Number
    },
    categoryName:{
        type:String
    },
    categoryNamePort:{
        type:String
    },
    subCategoryName:{
        type:String
    },
    subCategoryNamePort:{
        type:String
    },
    cuisine:{
        type:String
    },
    avgRating:{
        type:Number,
        default:0
    },
    totalRating:{
        type:Number,
        default:0
    },
    totalOrder:{
        type:Number,
        default:0
    },
    tasteType:{
        type:String
    },
    eatType:{
        type:String
    }
    
},{
    timestamps: true
})
Product.plugin(mongoosePaginate)
Product.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('products', Product);