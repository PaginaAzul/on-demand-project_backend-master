var mongoose = require('mongoose');
const db = mongoose.connection;
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');
var ChatHistory = new Schema({

    roomId: {
        type: String
    },
    senderId: { type: Schema.Types.ObjectId, ref: "user" },
    orderId: { type: Schema.Types.ObjectId, ref: "service" },
    receiverId: { type: Schema.Types.ObjectId, ref: "user" },
    message: {
        type: String
    },
    time: {
        type: Date,
        default: Date.now()
    },
    messageType:{
        type:String
    },
    image:
    {
        type: String
    },
    media:{
        type:String
    },
    readStatus:{
        type:Boolean
    },
    deleteStatus:{
        type:Boolean
    },
    localMedia:{
        type:String,
    },
    localTime:{
        type: String,
        default:new Date().toLocaleString()
    },
    from:{
        type:String,
        default:"Server"
    },
    locationType:{
        type:String
    },
    url:{
        type:String
    }

}, { timestamps: true });
ChatHistory.plugin(mongoosePaginate);
module.exports = mongoose.model('chatHistorys', ChatHistory);