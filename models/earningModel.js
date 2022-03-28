const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const db = mongoose.connection;
var Schema = mongoose.Schema;
let Earning = mongoose.Schema({

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
    earning:{
        type:Number
    },
    date:{
        type:Date
    },
}, {
        timestamps: true

    })
Earning.plugin(mongoosePaginate)
Earning.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('earning', Earning);