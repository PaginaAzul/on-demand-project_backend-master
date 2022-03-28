const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const db = mongoose.connection;
var Schema = mongoose.Schema;
let Card = mongoose.Schema({

    userId: {
        type: Schema.Types.ObjectId,
        trim: true,
        ref: "user"
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive']
    },
    userType: {
        type: String
    },
    cardNumber: {
        type: String,
        trim: true
    },
    cardName: {
        type: String,
        trim: true
    },
    expiryDate: {
        type: String,
        trim: true
    },
    cvv: {
        type: String,
        trim: true
    },
    setAsDefault: {
        type: String
    },
    cardType:{
        type:String
    }
}, {
        timestamps: true

    })
Card.plugin(mongoosePaginate)
Card.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('cards', Card);