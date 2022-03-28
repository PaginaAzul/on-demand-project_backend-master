const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const db = mongoose.connection;
var Schema = mongoose.Schema;
let Category = mongoose.Schema({

    adminId: { type: Schema.Types.ObjectId, ref: "admin" },
    status: {
        type: String,
        enum:['Active','Inactive'],
        default:'Active'
    },
    categoryName:{
        type:String
    },
    portugueseCategoryName:{
        type:String
    },
    categoryImage:{
        type:String
    }
  
}, {
    timestamps: true

})
Category.plugin(mongoosePaginate)
Category.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('category', Category);