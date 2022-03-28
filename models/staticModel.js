const mongoose = require('mongoose');
const schema = mongoose.Schema;
let static_content = new schema({
    
    title: {
        type: String
    },
    description:{
        type: String
    },
    portDescription:{
        type: String
    },
    status: {
        type: String,
        default: "ACTIVE"
    },
    email:{
        type:String
    },
    phoneNumber:{
        type:String
    },
    location:{
        type:String,
    },
    Type:
    {
        type: String
    },
    createdAt: {
        type: Date,
        default:new Date()
    },
    createdAt1: {
        type: Date,
        default: Date.now()
    }, 
    },
    { timestamps: true }
    );

module.exports = mongoose.model('static_content', static_content);
mongoose.model('static_content', static_content).find((error, result) => {
if (result.length == 0) {
    let obj = {
        'title': "Terms of Condition",
        'description': "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.",
        'Type': 'TermCondition'
       
    };
    mongoose.model('static_content', static_content).create(obj, (error, success) => {
        if (error)
            console.log("Error is" + error)
        else
            console.log("Terms of Condition saved succesfully.", success);
    })
}
});
mongoose.model('static_content', static_content).find((error, result) => {
if (result.length == 0) {
    let obj1 = {
        'title': "Privacy Policy",
        'description': "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.",
        'Type': 'PrivacyPolicy'
       
    };
    mongoose.model('static_content', static_content).create(obj1, (error, success) => {
        if (error)
            console.log("Error is" + error)
        else
            console.log("Privacy policy saved succesfully.", success);
    })
}
});
mongoose.model('static_content', static_content).find((error, result) => {
    if (result.length == 0) {
        let obj1 = {
            'title': "About Us",
            'description': "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.",
            'Type': 'AboutUs'
           
        };
        mongoose.model('static_content', static_content).create(obj1, (error, success) => {
            if (error)
                console.log("Error is" + error)
            else
                console.log("About Us details saved succesfully.", success);
        })
    }
});
mongoose.model('static_content', static_content).find((error, result) => {
    if (result.length == 0) {
        let obj1 = {
            'title': "Contact Us",
            'description': "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.",
            'Type': 'ContactUs'
           
        };
        mongoose.model('static_content', static_content).create(obj1, (error, success) => {
            if (error)
                console.log("Error is" + error)
            else
                console.log("Contact Us details saved succesfully.", success);
        })
    }
});
mongoose.model('static_content', static_content).find((error, result) => {
    if (result.length == 0) {
        let obj1 = {
            'title': "Marketing",
            'description': "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.",
            'Type': 'Marketing'
           
        };
        mongoose.model('static_content', static_content).create(obj1, (error, success) => {
            if (error)
                console.log("Error is" + error)
            else
                console.log("Maketing details saved succesfully.", success);
        })
    }
});

mongoose.model('static_content', static_content).find((error, result) => {
    if (result.length == 0) {
        let obj1 = {
            'title': "Instruction",
            'description': "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.",
            'Type': 'Instruction'
           
        };
        mongoose.model('static_content', static_content).create(obj1, (error, success) => {
            if (error)
                console.log("Error is" + error)
            else
                console.log("Instruction details saved succesfully.", success);
        })
    }
});
mongoose.model('static_content', static_content).find((error, result) => {
    if (result.length == 0) {
        let obj1 = {
            'title': "WalkingPage1",
            'description': "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.",
            'Type': 'WalkingPage1'
           
        };
        mongoose.model('static_content', static_content).create(obj1, (error, success) => {
            if (error)
                console.log("Error is" + error)
            else
                console.log("WalkingPage1 details saved succesfully.", success);
        })
    }
});
mongoose.model('static_content', static_content).find((error, result) => {
    if (result.length == 0) {
        let obj1 = {
            'title': "WalkingPage2",
            'description': "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.",
            'Type': 'WalkingPage2'
           
        };
        mongoose.model('static_content', static_content).create(obj1, (error, success) => {
            if (error)
                console.log("Error is" + error)
            else
                console.log("WalkingPage2 details saved succesfully.", success);
        })
    }
});
mongoose.model('static_content', static_content).find((error, result) => {
    if (result.length == 0) {
        let obj1 = {
            'title': "WalkingPage3",
            'description': "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.",
            'Type': 'WalkingPage3'
           
        };
        mongoose.model('static_content', static_content).create(obj1, (error, success) => {
            if (error)
                console.log("Error is" + error)
            else
                console.log("WalkingPage3 details saved succesfully.", success);
        })
    }
});




