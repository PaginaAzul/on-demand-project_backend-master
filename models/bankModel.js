const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const db = mongoose.connection;
var Schema = mongoose.Schema;
let Bank = mongoose.Schema({

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
    bankName: {
        type: String,
        trim: true
    },
    accountHolderName: {
        type: String,
        trim: true
    },
    accountnumber: {
        type: String,
        trim: true
    },
    holderAccountNumber: {
        type: String,
        trim: true
    },
    ibanNumber: {
        type: String,
        trim: true
    },
    setAsDefault: {
        type: Boolean
    }
}, {
        timestamps: true

    })
Bank.plugin(mongoosePaginate)
Bank.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('bank', Bank);