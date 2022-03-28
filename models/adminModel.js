const mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate');
var func = require('../controllers/function.js');

const Admin = mongoose.Schema({

    name: {
        type: String       
    },
    userType:{
        type:String,
        enum:['Admin','Sub-Admin'],
        default:'Admin'    
    },
    email: {
        type: String
    },
    permission:[{
        userManagement:{
            type:Boolean,
            default:true
        },
        orderManagement:{
            type:Boolean,
            default:true
        },
        ratingManagement:{
            type:Boolean,
            default:true
        }, 
        staticManagement:{
            type:Boolean,
            default:true
        },
        settingManagement:{
            type:Boolean,
            default:true
        },
        subAdminManagement:{
            type:Boolean,
            default:false
        }
    }],
    password: {
        type: String
    },
    profilePic: {
        type: String,
        default:"https://res.cloudinary.com/a2karya80559188/image/upload/v1591876980/Logo_02_1_zmqflr.png"
    },
    username:{
        type:String
    },
    createdAt: {
        type: Date,
        default:new Date()
    },
    jwtToken:{
        type:String
    },
    country:{
        type:String
    },
    status:{
        type:String,
        enum:['ACTIVE','INACTIVE'],
        default:'ACTIVE'
    },
    userExcel:{
        type:String
    },
    currency:{
        type:String,
        default:'Euro'
    },
    orderNumber:{
        type:Number,
        default:15000000
    }
       
}, {
        timestamps: true
    })

Admin.plugin(mongoosePaginate);
const AdminModel = mongoose.model('admin', Admin, 'admin');
module.exports = AdminModel
AdminModel.findOne({}, (error, success) => {
    if (error) {
        console.log(error)
    } else {
        if (!success) {
            func.bcrypt("admin123", (err, password) => {
                if (err)
                    console.log("Error is=============>",err)
                else {                    
                    new AdminModel({
                        email: "admin@gmail.com",
                        password: password,
                        username:"admin8055",
                        name: "Admin Arya",
                        profilePic: "https://res.cloudinary.com/a2karya80559188/image/upload/v1584446275/admin_nke1cg.jpg",
                    }).save((error, success) => {
                        if(error){
                            console.log("Error in creating admin");
                        }
                        else{
                            console.log("Admin created successfully");
                            console.log("Admin data is==========>",success);
                        }                       
                    })
                }
            })
        }
    }
})
