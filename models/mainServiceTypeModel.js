const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const db = mongoose.connection;
var Schema = mongoose.Schema;
let Mainservicetype = mongoose.Schema({

    image:{
        type:String
    },
    englishName:{
        type:String
    },
    portName:{
        type:String
    },
    status:{
        type:String,
        enum:['Active','Inactive'],
        default:'Active'
    }
},{
    timestamps: true
})
Mainservicetype.plugin(mongoosePaginate)
Mainservicetype.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('mainservicetypes', Mainservicetype);
mongoose.model('mainservicetypes', Mainservicetype).find((error, result) => {
    if (result.length == 0) {
        let obj = {
            'image': "https://img.freepik.com/free-vector/sale-special-offer-tag-price-tags_1588-733.jpg?size=338&ext=jpg",
            "englishName":"Food & Grocery",
            "portName":"Food & Grocery",
        };
        mongoose.model('mainservicetypes', Mainservicetype).create(obj, (error, success) => {
            if (error)
                console.log("Error is" + error)
            else
                console.log("Service saved succesfully.", success);
        })
    }
});
mongoose.model('mainservicetypes', Mainservicetype).find((error, result) => {
    if (result.length == 0) {
        let obj = {
            'image': "https://img.freepik.com/free-vector/sale-special-offer-tag-price-tags_1588-733.jpg?size=338&ext=jpg",
            "englishName":"Home services",
            "portName":"Home services",
        };
        mongoose.model('mainservicetypes', Mainservicetype).create(obj, (error, success) => {
            if (error)
                console.log("Error is" + error)
            else
                console.log("Service saved succesfully.", success);
        })
    }
});