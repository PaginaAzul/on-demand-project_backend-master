const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const db = mongoose.connection;
var Schema = mongoose.Schema;
let SubCategory = mongoose.Schema({

    adminId: { type: Schema.Types.ObjectId, ref: "admin" },
    status: {
        type: String,
        enum:['Active','Inactive'],
        default:'Active'
    },
    categoryName:{
        type:String
    },
    portugueseSubCategoryName:{
        type:String
    },
    categoryId: { type: Schema.Types.ObjectId, ref: "category" },
    subCategoryName:{
        type:String
    },
    image:{
        type:String
    }
  
}, {
    timestamps: true

})
SubCategory.plugin(mongoosePaginate)
SubCategory.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('subCategory', SubCategory);