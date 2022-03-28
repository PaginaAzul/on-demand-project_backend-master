const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const db = mongoose.connection;
var Schema = mongoose.Schema;
let Homebanner = mongoose.Schema({

    image: {
        type: String
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    }
}, {
    timestamps: true
})
Homebanner.plugin(mongoosePaginate)
Homebanner.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('homebanners', Homebanner);
mongoose.model('homebanners', Homebanner).find((error, result) => {
    if (result.length == 0) {
        let obj = {
            'image': "https://img.freepik.com/free-vector/sale-special-offer-tag-price-tags_1588-733.jpg?size=338&ext=jpg"
        };
        mongoose.model('homebanners', Homebanner).create(obj, (error, success) => {
            if (error)
                console.log("Error is" + error)
            else
                console.log("Home banner saved succesfully.", success);
        })
    }
});