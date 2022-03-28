const mongoose = require('mongoose');
const schema = mongoose.Schema;
let Account = new schema({
    
    currency: {
        type: String,
        enum:['SAR','Rupee']
    },
    taxInPercentage:{
        type: String
    },
    region:{
        type:String,
        enum:['India','Arab']
    },
    status: {
        type: String,
        default: "Active"
    }
    },
    { timestamps: true }
    );

module.exports = mongoose.model('accounts', Account);
mongoose.model('accounts', Account).find((error, result) => {
if (result.length == 0) {
    let obj = {
        'currency': "SAR",
        'taxInPercentage': "5",
        'region': 'Arab'
       
    };
    mongoose.model('accounts', Account).create(obj, (error, success) => {
        if (error)
            console.log("Error is" + error)
        else
            console.log("Account data saved successfully", success);
    })
}
});
mongoose.model('accounts', Account).find((error, result) => {
if (result.length == 0) {
    let obj1 = {
        'currency': "Rupee",
        'taxInPercentage': "5",
        'region': 'India'
       
    };
    mongoose.model('accounts', Account).create(obj1, (error, success) => {
        if (error)
            console.log("Error is" + error)
        else
        console.log("Account data saved successfully", success);
    })
}
});





