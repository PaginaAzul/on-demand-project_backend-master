const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const db = mongoose.connection;
var Schema = mongoose.Schema;
let SubSubCategory = mongoose.Schema({

    adminId: { type: Schema.Types.ObjectId, ref: "admin" },
    status: {
        type: String,
        enum:['ACTIVE','INACTIVE']
    },
    categoryId: { type: Schema.Types.ObjectId, ref: "category" },
    subCategoryId: { type: Schema.Types.ObjectId, ref: "subCategory" },
    subSubCategoryName:{
        type:String
    },
    categoryName:{
        type:String
    },
    subCategoryName:{
        type:String
    },
    
}, {
    timestamps: true

})
SubSubCategory.plugin(mongoosePaginate)
SubSubCategory.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('subSubCategory', SubSubCategory);