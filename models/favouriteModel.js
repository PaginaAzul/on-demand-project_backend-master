const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const db = mongoose.connection;
var Schema = mongoose.Schema;
let Favourite = mongoose.Schema({

    resAndStoreId: { type :Schema.Types.ObjectId,ref:"sellers"},
    userId: { type :Schema.Types.ObjectId,ref:"users"},
    status:{
        type:String,
        enum:['Active','Inactive'],
        default:'Active'
    }
},{
    timestamps: true
})
Favourite.plugin(mongoosePaginate)
Favourite.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('favourites', Favourite);