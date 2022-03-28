const jwt = require('jsonwebtoken');
var func = require('../controllers/function.js');
var bcrypt = require('bcryptjs');
var config = require("../config/config");
var cloudinary = require('cloudinary');
var User = require('../models/userModel.js');
const WalletModel = require('../models/walletModel.js');
var StaticContent = require('../models/staticModel.js');
var ServiceCategory = require('../models/serviceCatModel.js');
var ServiceSubCategory = require('../models/serviceSubCatModel.js');
var ServiceSubSubCategory = require('../models/serviceSubSubCatModel.js');
var ServiceModel = require('../models/serviceModel.js');
var LanguageModel = require('../models/languageModel.js');
var ReportReasonModel = require('../models/reportReasonModel.js');
const MakeAOfferDeliveryPerson = require('../models/makeAOfferDeliveryPerson.js');
var ContactModel = require('../models/contactUsModel.js');
var BannerModel = require('../models/bannerModel.js');
const Report = require('../models/reportModel.js');
var Admin = require('../models/adminModel.js');
var RatingModel = require('../models/ratingModel.js');
const ActionModel = require('../models/actionModel.js');
var Account = require('../models/accountModel.js');
var nodemailer = require('nodemailer');
const Notification = require('../models/notificationModel.js');
const Chat = require('../models/chatHistoryModel.js');
var salt = bcrypt.genSaltSync();
const { ObjectId } = require('mongodb');
const ChatHistory = require('../models/chatHistoryModel.js');
cloudinary.config({
    cloud_name: 'boss8055',
    api_key: '586377977311428',
    api_secret: 'uvX8_Mjf2QoArR-HxkeaHgyu-AQ'
});
const pdf = require('html-pdf');
const fileSystem = require('file-system');
const path = require('path');
const Seller = require('../models/sellerModel.js');
const Cuisine = require('../models/cuisineModel.js');
const Productcategory = require('../models/productCategoryModel.js');
const Productsubcategory = require('../models/productSubCategoryModel.js');
const Commission = require('../models/commissionModel.js');
const Driver = require('../models/driverModel.js');
const { triggerAsyncId } = require('async_hooks');
const Orderproduct = require('../models/productOrderModel.js');
const Homebanner = require('../models/homeBannerModel.js');
const Mainservice = require('../models/mainServiceTypeModel.js');
const Banneroffer = require('../models/exclusiveOfferBannerModel.js');



module.exports = {

    //========================================Admin Login=================================================//

    adminLogin: async (req, res) => {

        console.log("Request for admin login is===========>", req.body);
        if (!req.body.email || !req.body.password) {
            console.log("Field is required");
            return res.send({ response_code: 501, response_message: "Something went wrong" })
        }
        let checkAdmin = await Admin.findOne({ email: (req.body.email).toLowerCase() })
        if (!checkAdmin) {
            console.log("Invalid Credentials")
            return res.send({ response_code: 500, response_message: "Invalid Credentials" })
        }
        let passVerify = bcrypt.compareSync(req.body.password, checkAdmin.password)
        if (!passVerify) {
            console.log("Invalid Credentials");
            res.send({ response_code: 404, response_message: "Invalid Credentials" })
        }
        let jwtToken = jwt.sign({ "email": req.body.email }, config.jwtSecretKey);
        if (checkAdmin.userType == "Admin") {
            let permission = [{
                "userManagement": true,
                "orderManagement": true,
                "ratingManagement": true,
                "staticManagement": true,
                "bankManagement": true,
                "settingManagement": true,
                "subAdminManagement": true
            }]
            let updateAdmin = await Admin.findByIdAndUpdate({ _id: checkAdmin._id }, { $set: { jwtToken: jwtToken, "permission": permission } }, { new: true })
            delete (updateAdmin.password)
            console.log("Admin has successfully logged in", updateAdmin)
            return res.send({ response_code: 200, response_message: "You have successfully logged in ", Data: updateAdmin })
        }
        let updateAdmin = await Admin.findByIdAndUpdate({ _id: checkAdmin._id }, { $set: { jwtToken: jwtToken } }, { new: true })
        delete (updateAdmin.password)
        console.log("Admin has successfully logged in", updateAdmin)
        return res.send({ response_code: 200, response_message: "You have successfully logged in ", Data: updateAdmin })

    },

    //=======================================Admin Forgot password=======================================//

    adminForgotPassword: (req, res) => {

        console.log("Request for forgot password===========>", req.body);
        console.log("Admin forgot password api hit on time==============>", new Date().toLocaleString());
        if (!req.body.email) {
            console.log("Email is required")
            return res.send({ response_code: 401, response_message: "Email is required" })
        }
        else {
            req.body.email = req.body.email.toLowerCase();
            Admin.findOne({ email: req.body.email }, (error, result) => {
                if (error) {
                    console.log("Error is============>", error)
                    return res.send({ response_code: 500, response_message: "Internal server error " })
                }
                else if (!result) {
                    console.log("Invalid Credentials")
                    return res.send({ response_code: 500, response_message: "Invalid Credentials" });
                }
                else {

                    var adminId = result._id;
                    let otp = Math.floor(10000000 + Math.random() * 90000000)
                    let password = otp.toString()
                    let newPassword = bcrypt.hashSync(password, salt);
                    console.log("New password is===========>", newPassword);
                    console.log("Password is===========>", password);
                    let name = result.name
                    func.sendHtmlEmail(req.body.email, "Forgot Password", name, password, (error2, sent) => {
                        if (error2) {
                            console.log("Error 2 is============>", error2)
                            return res.send({ response_code: 500, response_message: "Internal server error " })
                        }
                        else if (sent) {
                            console.log("Email for===========>", sent)
                            Admin.findByIdAndUpdate({ "_id": result._id }, { $set: { password: newPassword } }, { new: true }, (error3, result3) => {
                                if (error3) {
                                    console.log("Error 3 is===========>", error3);
                                    return res.send({ response_code: 500, response_message: "Internal server error" });
                                }
                                else if (!result3) {
                                    console.log("Invalid Token");
                                    return res.send({ response_code: 500, response_message: "Invalid Token" });
                                }
                                else {
                                    console.log("New password has been sent on your registered email", result3)
                                    return res.send({ response_code: 200, response_message: "New password has been sent on your registered email", Data: result3 })
                                }
                            })
                        }
                    })
                }
            })
        }
    },

    //===========================================Admin resend password===================================//

    adminResetPassword: (req, res) => {

        console.log("Request for email otp verification is===========>", req.body);
        console.log("Admin reset password api hit on time==============>", new Date().toLocaleString());
        if (!req.body.adminId || !req.body.otp) {
            console.log("Required fields are required");
            return res.send({ response_code: 401, response_message: "Required fields are required" })
        }
        Admin.findOne({ _id: req.body.adminId }, (error, result) => {
            if (error) {
                console.log("Error is============>", error);
                return res.send({ response_code: 500, response_message: "Internal server error " })
            }
            else if (!result) {
                console.log("Admin id is incorrect");
                return res.send({ response_code: 500, response_message: "Admin id is incorrect" });
            }
            else if (result) {
                if (result.forgotOtp == req.body.otp) {
                    req.body.password = bcrypt.hashSync(req.body.password, salt);
                    var otp = Math.floor(100000 + Math.random() * 900000)
                    Admin.findByIdAndUpdate({ _id: req.body.adminId }, { $set: { forgotOtp: otp, password: req.body.password } }, { new: true }, (error1, result1) => {
                        if (error1) {
                            console.log("Error is============>", error)
                            return res.send({ response_code: 500, response_message: "Internal server error " });
                        }
                        else if (result1) {
                            console.log("Password updated successfully", result1);
                            return res.send({ response_code: 200, response_message: "Password updated successfully ", Data: result1 });
                        }
                        else {
                            console.log("Invalid Token");
                            return res.send({ response_code: 500, response_message: "Invalid Token" });
                        }
                    })
                }
                else {
                    console.log("Password link has been expired");
                    return res.send({ response_code: 500, response_message: "Password link has been expired" });
                }
            }
        })
    },

    //=============================================Admin Logout==========================================//

    adminLogout: async (req, res) => {

        console.log("Request for logout is===========>", req.body);
        let checkAdmin = await Admin.findByIdAndUpdate({ _id: req.body.adminId }, { $set: { jwtToken: '' } }, { new: true })
        console.log("Admin has successfully logout", checkAdmin);
        return res.send({ response_code: 200, response_message: "Admin has successfully logout" });
    },

    //==============================================Get static Content==================================//

    getStaticContent: async (req, res) => {

        console.log("You are in get Content api...");
        let list = await StaticContent.find({})
        console.log("Result is========>", list);
        res.send({ response_code: 200, response_message: "Data found successfully ", Data: list });
    },

    //==============================================Static content by type==============================//

    staticContentByType: async (req, res) => {

        console.log("Request for get static content api==========>", req.body);
        if (!req.body.type) {
            console.log("Content type is required");
            return res.send({ response_code: 401, response_message: "Something went wrong" });
        }
        let content = await StaticContent.findOne({ "Type": req.body.type })
        console.log("Result is=========>", content);
        res.send({ response_code: 200, response_message: "Data found successfully ", Data: content });
    },

    //==============================================static content update===============================//

    staticContentUpdate: (req, res) => {

        console.log("Request for update static content is=========>", req.body);
        if (!req.body.adminId) {
            console.log("Admin Id is required");
            res.send({ response_code: 500, response_message: "Admin Id is required" });
        }
        else if (!req.body._id) {
            console.log("Content Id is required");
            res.send({ response_code: 500, response_message: "Content Id is required" });
        }
        else if (!req.body.title) {
            console.log("Title is required");
            res.send({ response_code: 500, response_message: "Title is required" });
        }
        else if (!req.body.description) {
            console.log("Description is required");
            res.send({ response_code: 500, response_message: "Description is required" });
        }
        else {
            Admin.findOne({ "_id": req.body.adminId }, (error, result) => {
                if (error) {
                    console.log("Error  is============>", error);
                    return res.send({ response_code: 500, response_message: "Internal server error " });
                }
                else if (!result) {
                    console.log("Admin Id is incorrect");
                    res.send({ response_code: 500, response_message: "Admin Id is incorrect" });
                }
                else {
                    StaticContent.findByIdAndUpdate({ "_id": req.body._id }, { $set: { "title": req.body.title, "description": req.body.description } }, { new: true }, (error1, result1) => {
                        if (error1) {
                            console.log("Error is==========>", error1)
                            return res.send({ response_code: 500, response_message: "Internal server error" });
                        }
                        else if (!result1) {
                            console.log("Id is incorrect");
                            return res.send({ response_code: 404, response_message: "Id is incorrect" });
                        }
                        else {
                            if (result.userType == 'admin') {
                                console.log("Content data updeted successfully.", result1);
                                res.send({ response_code: 200, response_message: "Static Content data updeted successfully ", Data: result1 });
                            }
                            else {
                                let actionObj = new ActionModel({
                                    "userId": req.body.adminId,
                                    "action": "Static content updated"
                                })
                                actionObj.save((error2, result2) => {
                                    if (error2) {
                                        console.log("Error 2 is===========>", error2);
                                    }
                                    else {
                                        console.log("Action data is=============>", result2);
                                        console.log("Content data updeted successfully.", result1);
                                        res.send({ response_code: 200, response_message: "Static Content data updeted successfully ", Data: result1 });
                                    }
                                })
                            }
                        }
                    })
                }
            })
        }
    },

    //=================================================Work(Get static content)=========================//

    staticContentGet: (req, res) => {

        console.log("You are in static content by Id api...")
        console.log("Request is==========>", req.body);
        if (!req.body.type) {
            console.log("All fields are required")
            return res.send({ response_code: 401, response_message: "All fields are required" })
        }
        else {
            StaticContent.findOne({ "Type": req.body.type }, (error, result) => {
                if (error) {
                    console.log("Error is=========>", error);
                    return res.send({ response_code: 500, response_message: "Internal server error" })
                }
                else if (!result) {
                    console.log("Type is not correct");
                    return res.send({ response_code: 500, response_message: "Type is not correct" })
                }
                else {
                    console.log("Result is=========>", result);
                    res.send({ response_code: 200, response_message: "Data found successfully", Data: result })

                }
            })
        }
    },

    //================================================Work(Update static content)========================//

    StaticContentUpdate: async (req, res) => {

        try {
            console.log("Request for update static content is===========>", req.body);
            let updateContent = await StaticContent.findOneAndUpdate({ "Type": req.body.type }, { $set: { description: req.body.description, portDescription: req.body.portDescription } }, { new: true })
            console.log("Content data updated successfully", updateContent)
            res.send({ response_code: 200, response_message: "Content data updated successfully." })
            let checkAdmin = await Admin.findOne({ _id: req.body.adminId })
            if (checkAdmin.userType == "Sub-Admin") {
                let actionObj = new ActionModel({
                    "userId": req.body.adminId,
                    "action": `Static content updated by ${checkAdmin.name}.`
                })
                actionObj.save()
            }
        } catch (error) {
            console.log("Error is=========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" })
        }

    },

    //============================================Get Admin Details=====================================//

    getAdminDetail: async (req, res) => {

        try {
            if (!req.body.userId) {
                return res.send({ response_code: 401, response_message: "Something went wrong" })
            }
            let result = await Admin.findOne({ "_id": req.body.userId }).lean()
            if (!result) {
                console.log("Admin Id is not correct")
                return res.send({ response_code: 500, response_message: "Something went wrong" })
            }
            delete (result.password)
            console.log("Admin data found successfully", result)
            return res.send({ response_code: 200, response_message: "Admin data found successfully", Data: result })

        } catch (error) {
            console.log("Error is============>", error)
            return res.send({ response_code: 500, response_message: "Internal server error" })
        }
    },

    //==========================================Password change==========================================//

    passwordChange: async (req, res) => {

        console.log("Request is========>", req.body);
        if (!req.body.newPassword || !req.body.adminId || !req.body.password) {
            return res.send({ response_code: 401, response_message: "Something went wrong" })
        }
        let checkAdmin = await Admin.findOne({ _id: req.body.adminId })
        if (!checkAdmin) {
            console.log("Invalid Id")
            return res.send({ response_code: 401, response_message: "Something went wrong" })
        }
        if (!(bcrypt.compareSync(req.body.password, checkAdmin.password))) {
            console.log("Old password is incorrect")
            return res.send({ response_code: 400, response_message: "Old password is incorrect" })
        }
        req.body.newPassword = bcrypt.hashSync(req.body.newPassword, salt)
        let updateAdmin = await Admin.findByIdAndUpdate({ _id: req.body.adminId }, { $set: { "password": req.body.newPassword } }, { new: true })
        console.log("Password updated successfully", updateAdmin);
        return res.send({ response_code: 200, response_message: "Password updated successfully" });

    },

    //=============================================User List===========================================//

    userList: async (req, res) => {

        try {
            console.log("Request for get all user list is============>", req.body);
            let options = {
                page: req.body.pageNumber || 1,
                limit: req.body.limit || 10,
                sort: { createdAt: -1 },
            }
            var query = { userType: 'User' }

            if (req.body.startDate && req.body.endDate) {
                query.createdAt = { $gte: req.body.startDate, $lte: req.body.endDate }
            }
            if (req.body.search) {
                query.$and = [{
                    $or: [
                        { "email": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "name": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "country": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "countryCode": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "mobileNumber": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "status": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "appLanguage": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "speakLanguage": { $regex: "^" + req.body.search, $options: 'i' } },
                    ]
                }]
            }
            let result = await User.paginate(query, options)
            console.log("User list found successfully", result);
            return res.send({ response_code: 200, response_message: "User list fetch successfully", Data: result })
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" })
        }
    },

    //=============================================User Details=======================================//

    getUserDetail: async (req, res) => {

        try {
            if (!req.body.userId) {
                return res.send({ response_code: 401, response_message: "Something went wrong" })
            }
            let result = await User.findOne({ "_id": req.body.userId }).lean()
            if (!result) {
                console.log("User Id is not correct")
                return res.send({ response_code: 500, response_message: "Something went wrong" })
            }
            delete (result.password)
            console.log("User data found successfully", result)
            return res.send({ response_code: 200, response_message: "User data found successfully", Data: result })
        } catch (error) {
            console.log("Error is============>", error)
            return res.send({ response_code: 500, response_message: "Internal server error" })
        }
    },

    //===========================================Update user status====================================//

    updateUserStatus: async (req, res) => {

        console.log("Request for update user status===========>", req.body);
        if (!req.body.userId || !req.body.status) {
            return res.send({ response_code: 401, response_message: "Something went wrong" })
        }
        let updateStatus = await User.findByIdAndUpdate({ _id: req.body.userId }, { $set: { status: req.body.status } }, { new: true })
        if (!updateStatus) {
            console.log("User is incorrect");
            return res.send({ response_code: 500, response_message: "Something went wrong" })
        }
        let sms = ''
        if (req.body.status == 'ACTIVE') {
            sms = "Your account have been enabled by administrator.Now you can use your account.Please do not share your credentials with anyone."
        }
        if (req.body.status == 'INACTIVE') {
            sms = "Your account have been disabled by administrator due to any suspicious activity.To enable your account, Please contact with administrator and confirm your identity."

        }
        res.send({ response_code: 200, response_message: "User status changed successfully." })
        if (updateStatus.email) {
            func.sendHtmlEmail1(updateStatus.email, "Account Notification", sms, (err__, succ__) => {
                if (err__) {
                    console.log("Error is=======>", err__);
                } else if (succ__) {
                    console.log("Sent");

                }
            })
        }
    },

    //==============================================Add service category==============================//

    addServiceCat: async (req, res) => {

        console.log("Request for add service cat is==========>", req.files);
        let checkAdmin = await Admin.findOne({ _id: req.body.adminId })
        if (!checkAdmin) {
            console.log("Admin Id is incorrect");
            res.send({ response_code: 501, response_message: "Something went wrong" })
        }
        let categoryImage = ""
        let image = await cloudinary.v2.uploader.upload(req.files.categoryImage.path, { resource_type: "image" })
        categoryImage = image.secure_url
        console.log(categoryImage)
        let categoryObj = new ServiceCategory({
            "categoryName": req.body.categoryName,
            "adminId": req.body.adminId,
            portugueseCategoryName: req.body.portugueseCategoryName,
            "categoryImage": categoryImage
        })
        await categoryObj.save();
        console.log("Category added successfully");
        res.send({ response_code: 200, response_message: "Sub-Category added successfully" });
        if (checkAdmin.userType == "Sub-Admin") {
            let actionObj = new ActionModel({
                "userId": req.body.userId,
                "action": `New service category added by ${checkAdmin.name};`
            })
            await actionObj.save()
        }
    },

    //===========================================Add sub category======================================//

    addServiceSubCat: async (req, res) => {

        console.log("Request for add service cat is==========>", req.body);
        let checkAdmin = await Admin.findOne({ _id: req.body.adminId })
        if (!checkAdmin) {
            console.log("Admin Id is incorrect");
            res.send({ response_code: 501, response_message: "Something went wrong" })
        }
        let checkCategory = await ServiceCategory.findOne({ _id: req.body.categoryId })
        let subcategoryImage = ""
        let image = await cloudinary.v2.uploader.upload(req.files.subCategoryImage.path, { resource_type: "image" })
        subcategoryImage = image.secure_url
        let obj = new ServiceSubCategory({
            "adminId": req.body.adminId,
            "categoryId": req.body.categoryId,
            portugueseSubCategoryName: req.body.portugueseSubCategoryName,
            "image": subcategoryImage,
            "subCategoryName": req.body.subCategoryName,
            categoryName: checkCategory.categoryName
        })
        await obj.save()
        console.log("Category added successfully");
        res.send({ response_code: 200, response_message: "Category added successfully" });
        if (checkAdmin.userType == "Sub-Admin") {
            let actionObj = new ActionModel({
                "userId": req.body.userId,
                "action": `New service sub-bcategory added by ${checkAdmin.name}`
            })
            await actionObj.save()
        }

    },

    //=================================================Add sub sub category===============================//

    addServiceSubSubCat: (req, res) => {

        console.log("Request for add service cat is==========>", req.body);
        Admin.findOne({ "_id": req.body.adminId }, (error, result) => {
            if (error) {
                console.log("Error is=========>", error);
                return res.send({ response_code: 500, response_message: "Internal server error" })
            }
            else if (!result) {
                console.log("Admin Id is incorrect");
                res.send({ response_code: 501, response_message: "Admin Id is incorrect" })
            }
            else {
                ServiceSubCategory.findOne({ "_id": req.body.subCategoryId }, (error2, result2) => {
                    if (error2) {
                        console.log("Error 2 is==========>", error2);
                        return res.send({ response_code: 500, response_message: "Internal server error" })
                    }
                    else if (!result2) {
                        console.log("Sub-Category Id is incorrect");
                        res.send({ response_code: 501, response_message: "Sub-Category Id is incorrect" })

                    }
                    else {
                        console.log("Result 2 is=======>", result2);
                        let obj = new ServiceSubSubCategory({
                            "categoryName": result2.categoryName,
                            "adminId": req.body.adminId,
                            "categoryId": result2.categoryId,
                            "subCategoryName": result2.subCategoryName,
                            "subCategoryId": req.body.subCategoryId,
                            "subSubCategoryName": req.body.subSubCategoryName
                        })
                        obj.save((error1, result1) => {
                            if (error1) {
                                console.log("Error is==========>", error1);
                                return res.send({ response_code: 500, response_message: "Internal server error." })
                            }
                            else {
                                if (result.userType == "Admin") {
                                    console.log("Sub-Sub-Category added successfully", result1);
                                    return res.send({ response_code: 200, response_message: "Sub-Sub-Category added successfully", Data: result1 });
                                }
                                else {
                                    let actionObj = new ActionModel({
                                        "userId": req.body.userId,
                                        "action": "New service sub-sub-bcategory added by " + result.name
                                    })
                                    actionObj.save((error2, result2) => {
                                        if (error2) {
                                            console.log("Error 2 is============>", error2);
                                            return res.send({ response_code: 500, response_message: "Internal server error" })

                                        }
                                        else {
                                            console.log("Action data is===========>", result2);
                                            console.log("Sub-Sub-Category added successfully", result1);
                                            return res.send({ response_code: 200, response_message: "Sub-Sub-Category added successfully", Data: result1 });
                                        }
                                    })
                                }
                            }
                        })
                    }
                })

            }
        })
    },

    //==========================================totalCount===================================================//

    totalCount: async (req, res) => {

        try {
            let userCount = await User.find({ userType: 'User' }).count()
            let postCount = await ServiceModel.find({ status: { $ne: 'Cancel' } }).count()
            let pendingOrderCount = await ServiceModel.find({ "status": 'Pending' }).count()
            let activeOrderCount = await ServiceModel.find({ "status": 'Active' }).count()
            let completeOrderCount = await ServiceModel.find({ "status": 'Complete' }).count()
            let normalUserquery = { $and: [{ signupWithNormalPerson: "true" }, { "adminVerifyProfessionalWorker": "false" }] }
            let normalUserCount = await User.find({ userType: 'User' }).count()
            let professionalUserCount = await User.find({ "adminVerifyProfessionalWorker": "true" }).count()
            let professionalRequestQuery = { $and: [{ signupWithProfessionalWorker: "true" }, { "adminVerifyProfessionalWorker": "false" }] }
            let professionalRequestCount = await User.find(professionalRequestQuery).count()
            let restaurantQuery = { storeType: 'Restaurant', deleteStatus: false }
            let totalRestaurant = await Seller.find(restaurantQuery).count()
            let storeQuery = { storeType: 'Grocery Store', deleteStatus: false }
            let totalStore = await Seller.find(storeQuery).count()
            let totalDriver = await Driver.find({deleteStatus:false}).count()
            let obj = {
                "User": userCount, "Post": postCount, "PendingOrder": pendingOrderCount, "ActiveOrder": activeOrderCount, "PastOrders": completeOrderCount, "NormalUser": normalUserCount, "ProfessionalUser": professionalUserCount, "RequestProfessional": professionalRequestCount,
                totalRestaurant: totalRestaurant, totalStore: totalStore,totalDriver:totalDriver
            }
            console.log("Dashboard data is============>", obj)
            return res.send({ response_code: 200, response_message: "Collection found", obj })
        } catch (error) {
            console.log("Error is=========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" })
        }
    },

    //==================================================Order List=======================================//

    orderList: async (req, res) => {

        try {
            console.log("Request for get order is============>", req.body);
            let options = {
                page: req.body.pageNumber || 1,
                limit: req.body.limit || 10,
                sort: { createdAt: -1 },
                populate: 'userId'
            }
            let query = {}
            if (req.body.type == 'pending') {
                query = { status: 'Pending', deleteStatus: false }
            }
            if (req.body.type == 'active') {
                query = { status: 'Active', deleteStatus: false }
            }
            if (req.body.type == 'past') {
                query = { status: 'Complete', deleteStatus: false }
            }
            if (req.body.type == 'all') {
                query = { deleteStatus: false }
            }

            if (req.body.startDate && req.body.endDate) {
                query.createdAt = { $gte: req.body.startDate, $lte: req.body.endDate }
            }
            if (req.body.search) {
                query.$and = [{
                    $or: [
                        { "orderNumber": { $regex: "^" + req.body.search, $options: 'i' } }
                    ]
                }]
            }
            let result = await ServiceModel.paginate(query, options)
            console.log("Order list for normal user is=========>", result);
            return res.send({ response_code: 200, response_message: "Order list fetch successfully", Data: result })
        } catch (error) {
            return res.send({ response_code: 500, response_message: "Internal server error" })
        }
    },

    //===============================================Order details========================================//

    orderDetails: async (req, res) => {

        try {
            if (!req.body.orderId) {
                return res.send({ response_code: 401, response_message: "Something went wrong" })
            }
            let result = await ServiceModel.findOne({ "_id": req.body.orderId }).populate("userId offerAcceptedOfId")
            if (!result) {
                console.log("Order Id is not correct")
                return res.send({ response_code: 500, response_message: "Invalid Token" })
            }
            console.log("Order data found successfully", result)
            return res.send({ response_code: 200, response_message: "Order data found successfully", Data: result })
        } catch (error) {
            console.log("Error is============>", error)
            return res.send({ response_code: 500, response_message: "Internal server error" })
        }
    },

    //================================================contact us list======================================//

    contactUsList: async (req, res) => {

        try {
            let options = {
                page: req.body.pageNumber || 1,
                limit: req.body.limit || 10,
                sort: { createdAt: -1 },
                populate: [{path:'userId',select:'name email'},{path:'driverId',select:'name email'}]
            }

            let query = {}
            if (req.body.startDate && req.body.endDate) {
                query.createdAt = { $gte: req.body.startDate, $lte: req.body.endDate }
            }
            if (req.body.search) {
                query.$and = [{
                    $or: [
                        { "reason": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "description": { $regex: "^" + req.body.search, $options: 'i' } }
                    ]
                }]
            }
            let result = await ContactModel.paginate(query, options)
            console.log("Contact us list is===========>", result);
            return res.send({ response_code: 200, response_message: "Contact us list fetch successfully", Data: result })
        } catch (error) {
            console.log("Error is=========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" })

        }
    },

    //================================================Contact us details=================================//

    contactDetails: async (req, res) => {

        try {
            if (!req.body.contactId) {
                return res.send({ response_code: 401, response_message: "Something went wrong" })
            }
            let result = await ContactModel.findOne({ "_id": req.body.contactId })
            if (!result) {
                console.log("Contact Id is not correct")
                return res.send({ response_code: 500, response_message: "Invalid Token" })
            }
            console.log("Contact data found successfully", result)
            return res.send({ response_code: 200, response_message: "Contact data found successfully", Data: result })
        } catch (error) {
            console.log("Error is============>", error)
            return res.send({ response_code: 500, response_message: "Internal server error" })
        }
    },

    //================================================Contact delete=====================================//

    contactDelete: async (req, res) => {

        try {
            if (!req.body.contactId) {
                return res.send({ response_code: 401, response_message: "Something went wrong" })
            }
            let result = await ContactModel.findByIdAndRemove({ "_id": req.body.contactId })
            if (!result) {
                console.log("Contact Id is not correct")
                return res.send({ response_code: 500, response_message: "Invalid Token" })
            }
            console.log("Contact data deleted successfully", result)
            return res.send({ response_code: 200, response_message: "Contact data deleted successfully" })
        } catch (error) {
            console.log("Error is============>", error)
            return res.send({ response_code: 500, response_message: "Internal server error" })
        }
    },

    //================================================Get All rating======================================//

    getAllRating: async (req, res) => {

        try {
            console.log("Get all rating is============>", req.body);
            let options = {
                page: req.body.pageNumber || 1,
                limit: req.body.limit || 10,
                sort: { createdAt: -1 },
            }

            let query = {}
            if (req.body.startDate && req.body.endDate) {
                query.createdAt = { $gte: req.body.startDate, $lte: req.body.endDate }
            }
            if (req.body.search) {
                query.$and = [{
                    $or: [
                        { "ratingBy": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "ratingTo": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "ratingMessage": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "comments": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "rate": { $regex: "^" + req.body.search, $options: 'i' } }
                    ]
                }]
            }
            let result = await RatingModel.paginate(query, options)
            console.log("Rating List found successfully", result);
            return res.send({ response_code: 200, response_message: "Rating List found successfully", Data: result })
        } catch (error) {
            console.log("Error is=============>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //==================================================rating delete====================================//

    ratingDelete: async (req, res) => {

        try {
            console.log("Request for delete rating is===========>", req.body);
            if (!req.body.ratetId) {
                return res.send({ response_code: 401, response_message: "Order Id is required" })
            }
            let result = await RatingModel.findByIdAndRemove({ "_id": req.body.ratetId })
            if (!result) {
                console.log("Rate Id is not correct")
                return res.send({ response_code: 500, response_message: "Invalid Token" });
            }
            console.log("Rate data deleted successfully", result)
            res.send({ response_code: 200, response_message: "Rate data deleted successfully" })
            let totalRating = await RatingModel.aggregate([
                {
                    $match: {
                        ratingTo: ObjectId(result.ratingTo)
                    }
                },
                {
                    "$group": {
                        _id: "$ratingTo",
                        total: { "$sum": "$rate" },
                        average: { "$avg": "$rate" }
                    }
                }
            ])
            await User.findByIdAndUpdate({ _id: result.ratingTo }, { totalRating: totalRating[0].total, avgRating: totalRating[0].average }, { new: true })
            let checkAdmin = await Admin.findOne({ "_id": req.body.adminId })
            if (!checkAdmin) {
                return;
            }
            if (checkAdmin.userType == "Sub-Admin") {
                let actionObj = new ActionModel({
                    "userId": req.body.adminId,
                    "action": `Rating data deletd by ${checkAdmin.name}`
                })
                await actionObj.save()
                return;
            }
        } catch (error) {
            console.log("Error is============>", error)
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //================================================Add subadmin========================================//

    addSubAdmin: async (req, res) => {

        try {
            console.log("Request for add subadmin is==============>", req.body);
            let result = await Admin.findOne({ "email": req.body.email })
            if (result) {
                console.log("Email already exist");
                return res.send({ response_code: 501, response_message: "Email already exist" });
            }
            req.body.password = bcrypt.hashSync(req.body.password, salt);
            let obj = new Admin({
                "name": req.body.name,
                "username": req.body.username,
                "password": req.body.password,
                "userType": "Sub-Admin",
                "email": req.body.email,
                "country": req.body.country,
                "permission": req.body.permission
            })
            let result1 = await obj.save()
            console.log("Sub Admin created successfully", result1);
            return res.send({ response_code: 200, response_message: "Sub Admin created successfully" });

        } catch (error) {
            console.log("Error is==========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //==============================================Add Language=========================================//

    addLanguage: async (req, res) => {

        try {
            console.log("Request for add language is============>", req.body);
            if (!req.body.language) {
                return res.send({ response_code: 501, response_message: "Something went wrong" });
            }
            let result = await LanguageModel.findOne({ "language": req.body.language })
            if (result) {
                console.log("Langauge alraedy exist");
                return res.send({ response_code: 501, response_message: "Langauge alraedy exist" });
            }
            let obj = new LanguageModel({
                "language": req.body.language
            })
            let result1 = await obj.save()
            console.log("Langauge added successfully", result1);
            res.send({ response_code: 200, response_message: "Langauge added successfully" });
            let checkAdmin = await Admin({ _id: req.body.adminId })
            if (!checkAdmin) {
                return;
            }
            if (checkAdmin.userType == 'Sub-Admin') {
                let actionObj = new ActionModel({
                    "userId": req.body.userId,
                    "action": `New language added by ${checkAdmin.name}`
                })
                await actionObj.save()
                return;
            }
        } catch (error) {
            console.log("Error is=========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
        console.log("Request for add language is============>", req.body);
        if (!req.body.language) {
            return res.send({ response_code: 501, response_message: "Langauge is required" });

        }
    },

    //============================================Update language========================================//

    updateLanguage: async (req, res) => {

        try {
            console.log("Update language request is===========>", req.body);

            let query = { $and: [{ language: req.body.language }, { _id: { $ne: req.body.languageId } }] }
            let checkLanguage = await LanguageModel.findOne(query)
            if (checkLanguage) {
                console.log("Langauge alraedy exist");
                return res.send({ response_code: 501, response_message: "Langauge alraedy exist" });
            }
            let result = await LanguageModel.findByIdAndUpdate({ "_id": req.body.languageId }, { $set: { "language": req.body.language } }, { new: true })
            if (!result) {
                console.log("Language Id is incorrect");
                return res.send({ response_code: 501, response_message: "Invalid Token" });
            }
            console.log("Language updated successfully", result);
            return res.send({ response_code: 200, response_message: "Language updated successfully" });
        } catch (error) {
            console.log("Error is==========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //==============================================Delete language=====================================//

    deleteLangauge: async (req, res) => {

        try {
            console.log("Request for delete langauge===========>", req.body);
            if (!req.body.languageId) {
                return res.send({ response_code: 501, response_message: "Something went wrong" });
            }
            let result = await LanguageModel.findByIdAndRemove({ "_id": req.body.languageId })
            if (!result) {
                console.log("Language Id is incorrect");
                return res.send({ response_code: 501, response_message: "Invalid Token" });
            }
            console.log("Langauge deleted successfully", result);
            res.send({ response_code: 200, response_message: "Langauge deleted successfully" });
            let checkAdmin = await Admin.findOne({ _id: req.body.adminId })
            if (!checkAdmin) {
                return;
            }
            if (checkAdmin.userType == 'Sub-Admin') {
                let actionObj = new ActionModel({
                    "userId": req.body.userId,
                    "action": `Language deleted by ${checkAdmin.name}`
                })
                await actionObj.save()
                return;
            }
        } catch (error) {
            console.log("Error is=========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //===============================================Get All Language List==============================//

    getLanguage: async (req, res) => {

        try {
            console.log("Request for get language is============>", req.body);
            let options = {
                page: req.body.pageNumber || 1,
                limit: req.body.limit || 10,
                sort: { createdAt: -1 },
            }

            let query = {}
            if (req.body.startDate && req.body.endDate) {
                query.createdAt = { $gte: req.body.startDate, $lte: req.body.endDate }
            }
            if (req.body.search) {
                query.$and = [{
                    $or: [
                        { "language": { $regex: "^" + req.body.search, $options: 'i' } }
                    ]
                }]
            }
            let result = await LanguageModel.paginate(query, options)
            console.log("Language List found successfully", result);
            return res.send({ response_code: 200, response_message: "Language List found successfully", Data: result })
        } catch (error) {
            console.log("Error is=============>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //================================================Add report reason=================================//

    addReportReason: async (req, res) => {

        try {
            console.log("Request for add report reason is============>", req.body);
            if (!req.body.reportReason) {
                return res.send({ response_code: 501, response_message: "Something went wrong" });
            }
            let obj = new ReportReasonModel({
                "reportReason": req.body.reportReason
            })
            let result1 = await obj.save()
            console.log("Report Reason added successfully", result1);
            res.send({ response_code: 200, response_message: "Report Reason added successfully" });
            let checkAdmin = await Admin.findOne({ _id: req.body.adminId })
            if (!checkAdmin) {
                return;
            }
            if (checkAdmin.userType == "Sub-Admin") {
                let actionObj = new ActionModel({
                    "userId": req.body.adminId,
                    "action": `New Report raeson added by ${checkAdmin.name}`
                })
                await actionObj.save()
                return;
            }
        } catch (error) {
            console.log("Error is=============>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //==========================================Update report Reason======================================//

    updateReportReason: async (req, res) => {

        try {
            console.log("Update report reason request is===========>", req.body);
            if (!req.body.reportReason || !req.body.reportReasonId) {
                return res.send({ response_code: 501, response_message: "Something went wrong" });
            }
            let result = await ReportReasonModel.findByIdAndUpdate({ "_id": req.body.reportReasonId }, { $set: { "reportReason": req.body.reportReason } }, { new: true })
            if (!result) {
                console.log("Report Reason Id is incorrect");
                return res.send({ response_code: 501, response_message: "Invalid Token" });
            }
            console.log("Report Reason updated successfully", result);
            return res.send({ response_code: 200, response_message: "Report Reason updated successfully" });
        } catch (error) {
            console.log("Error is==========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //===============================================Delete report reason==================================//

    deleteReportReason: async (req, res) => {

        try {
            console.log("Request for delete report reason===========>", req.body);
            if (!req.body.reportReasonId) {
                return res.send({ response_code: 501, response_message: "Something went wrong" });
            }
            let result = await ReportReasonModel.findByIdAndRemove({ "_id": req.body.reportReasonId })
            if (!result) {
                console.log("Report Reason Id is incorrect");
                return res.send({ response_code: 501, response_message: "Invalid Token" });
            }
            console.log("Report Reason deleted successfully", result);
            res.send({ response_code: 200, response_message: "Report Reason deleted successfully" });
            let checkAdmin = await Admin.findOne({ _id: req.body.adminId })
            if (!checkAdmin) {
                return;
            }
            if (checkAdmin.userType == "Sub-Admin") {
                let actionObj = new ActionModel({
                    "userId": req.body.adminId,
                    "action": `Report raeson deleted by ${checkAdmin.name}`
                })
                await actionObj.save()
                return;
            }
        } catch (error) {
            console.log("Error is=========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //====================================================Get Category List==============================//

    getCategory: async (req, res) => {

        try {
            console.log("Request for get category list is============>", req.body);
            let options = {
                page: req.body.pageNumber || 1,
                limit: req.body.limit || 10,
            }

            let query = {}
            if (req.body.startDate && req.body.endDate) {
                query.createdAt = { $gte: req.body.startDate, $lte: req.body.endDate }
            }
            if (req.body.search) {
                query.$and = [{
                    $or: [
                        { "categoryName": { $regex: "^" + req.body.search, $options: 'i' } }
                    ]
                }]
            }
            let result = await ServiceCategory.paginate(query, options)
            console.log("Category List found successfully", result);
            return res.send({ response_code: 200, response_message: "Category List found successfully", Data: result })
        } catch (error) {
            console.log("Error is=============>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //===================================================Delete category================================//

    deleteCategory: async (req, res) => {

        try {
            console.log("Request for delete Category===========>", req.body);
            if (!req.body.categoryId) {
                return res.send({ response_code: 501, response_message: "Something went wrong" });
            }
            let orderRequest = {
                $and: [
                    {
                        $or: [
                            { "status": "Active" },
                            { "status": "Pending" }
                        ]
                    },
                    { serviceCategoryId: req.body.categoryId }
                ]
            }
            let checkCategoryInOrder = await ServiceModel.findOne(orderRequest)
            if (checkCategoryInOrder) {
                console.log("Can not user");
                return res.send({ response_code: 501, response_message: "You can not update this category because this is already used in ongoing order." });
            }
            let checkCategoryInUser = await User.findOne({ "categoryNameArray.serviceCategoryId": req.body.categoryId })
            if (checkCategoryInUser) {
                console.log("Can not user");
                return res.send({ response_code: 501, response_message: "You can not update this category because this is already used by provider." });
            }
            let result = await ServiceCategory.findByIdAndRemove({ "_id": req.body.categoryId })
            if (!result) {
                console.log("Category Id is incorrect");
                return res.send({ response_code: 501, response_message: "Invalid Token" });
            }
            console.log("Category deleted successfully", result);
            res.send({ response_code: 200, response_message: "Category deleted successfully" });
            let checkAdmin = await Admin.findOne({ _id: req.body.adminId })
            if (!checkAdmin) {
                return;
            }
            if (checkAdmin.userType == "Sub-Admin") {
                let actionObj = new ActionModel({
                    "userId": req.body.adminId,
                    "action": `Service category deleted by ${checkAdmin.name}.`
                })
                await actionObj.save()
                return;
            }
        } catch (error) {
            console.log("Error is=========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //====================================================Get sub category===============================//

    getSubCategory: async (req, res) => {

        try {
            console.log("Request for get category list is============>", req.body);
            let options = {
                page: req.body.pageNumber || 1,
                limit: req.body.limit || 10,
            }

            let query = { "categoryId": req.body.categoryId }
            if (req.body.startDate && req.body.endDate) {
                query.createdAt = { $gte: req.body.startDate, $lte: req.body.endDate }
            }
            if (req.body.search) {
                query.$and = [{
                    $or: [
                        { "categoryName": { $regex: "^" + req.body.search, $options: 'i' } }
                    ]
                }]
            }
            let result = await ServiceSubCategory.paginate(query, options)
            console.log("Sub-Category List found successfully", result);
            return res.send({ response_code: 200, response_message: "Sub-Category List found successfully", Data: result })

        } catch (error) {
            console.log("Error is=============>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }


    },

    //==================================================Delete sub category==============================//

    deleteSubCategory: async (req, res) => {

        try {
            console.log("Request for delete Category===========>", req.body);
            if (!req.body.subCategoryId) {
                return res.send({ response_code: 501, response_message: "Something went wrong" });
            }
            let orderRequest = {
                $and: [
                    {
                        $or: [
                            { "status": "Active" },
                            { "status": "Pending" }
                        ]
                    },
                    { serviceSubCategoryId: req.body.subCategoryId }
                ]
            }
            let checkCategoryInOrder = await ServiceModel.findOne(orderRequest)
            if (checkCategoryInOrder) {
                console.log("Can not user");
                return res.send({ response_code: 501, response_message: "You can not update this sub-category because this is already used in ongoing order." });
            }
            let result = await ServiceSubCategory.findByIdAndRemove({ "_id": req.body.subCategoryId })
            if (!result) {
                console.log("Sub-Category Id is incorrect");
                return res.send({ response_code: 501, response_message: "Invalid Token" });
            }
            console.log("Sub-Category deleted successfully", result);
            res.send({ response_code: 200, response_message: "Sub-Category deleted successfully" });
            let checkAdmin = await Admin.findOne({ _id: req.body.adminId })
            if (!checkAdmin) {
                return;
            }
            if (checkAdmin.userType == "Sub-Admin") {
                let actionObj = new ActionModel({
                    "userId": req.body.adminId,
                    "action": `Service sub-category deleted by ${checkAdmin.name}.`
                })
                await actionObj.save()
                return;
            }
        } catch (error) {
            console.log("Error is=========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //===============================================Get Sub sub category================================//

    getSubSubCategory: async (req, res) => {

        try {
            console.log("Request for get category list is============>", req.body);
            let options = {
                page: req.body.pageNumber || 1,
                limit: req.body.limit || 10,
                sort: { createdAt: -1 },
            }

            let query = { "subCategoryId": req.body.subCategoryId }
            if (req.body.startDate && req.body.endDate) {
                query.createdAt = { $gte: req.body.startDate, $lte: req.body.endDate }
            }
            if (req.body.search) {
                query.$and = [{
                    $or: [
                        { "categoryName": { $regex: "^" + req.body.search, $options: 'i' } }
                    ]
                }]
            }
            let result = await ServiceSubSubCategory.paginate(query, options)
            console.log("Sub-Sub-Category List found successfully", result);
            return res.send({ response_code: 200, response_message: "Sub-Sub-Category List found successfully", Data: result })
        } catch (error) {
            console.log("Error is=============>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //===========================================Delete sub sub category================================//

    deleteSubSubCategory: async (req, res) => {

        try {
            console.log("Request for delete Category===========>", req.body);
            if (!req.body.subSubCategoryId) {
                return res.send({ response_code: 501, response_message: "Something went wrong" });
            }
            let result = await ServiceSubSubCategory.findByIdAndRemove({ "_id": req.body.subSubCategoryId })
            if (!result) {
                console.log("Sub-Sub-Category Id is incorrect");
                return res.send({ response_code: 501, response_message: "Invalid Token" });
            }
            console.log("Sub-Sub-Category deleted successfully", result);
            res.send({ response_code: 200, response_message: "Sub-Sub-Category deleted successfully" });
            let checkAdmin = await Admin.findOne({ _id: req.body.adminId })
            if (!checkAdmin) {
                return;
            }
            if (checkAdmin.userType == "Sub-Admin") {
                let actionObj = new ActionModel({
                    "userId": req.body.adminId,
                    "action": `Service sub-sub-category deleted by ${checkAdmin.name}.`
                })
                await actionObj.save()
                return;
            }
        } catch (error) {
            console.log("Error is=========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //==========================================Update category=======================================//

    updateCategory: async (req, res) => {

        console.log("Request for add service cat is==========>", req.files);
        console.log("Request for add service cat is==========>", req.body);
        let checkAdmin = await Admin.findOne({ _id: req.body.adminId })
        if (!checkAdmin) {
            console.log("Admin Id is incorrect");
            return res.send({ response_code: 501, response_message: "Something went wrong" })
        }
        let checkCategory = await ServiceCategory.findOne({ _id: req.body.categoryId })
        let orderRequest = {
            $and: [
                {
                    $or: [
                        { "status": "Active" },
                        { "status": "Pending" }
                    ]
                },
                { serviceCategoryId: req.body.categoryId }
            ]
        }
        let checkCategoryInOrder = await ServiceModel.findOne(orderRequest)
        if (checkCategoryInOrder) {
            let categoryImage = checkCategory.categoryImage
            if (req.files.categoryImage) {
                let image = await cloudinary.v2.uploader.upload(req.files.categoryImage.path, { resource_type: "image" })
                categoryImage = image.secure_url
                let obj = {
                    categoryImage: categoryImage
                }
                await ServiceCategory.findByIdAndUpdate({ _id: req.body.categoryId }, { $set: obj }, { new: true })
                console.log("Image uploaded successfully");
                return res.send({ response_code: 200, response_message: "Image uploaded successfully" });
            }
            console.log("Can not user");
            return res.send({ response_code: 501, response_message: "You can not update this category because this is already used in ongoing order." });
        }
        let checkCategoryInUser = await User.findOne({ "categoryNameArray.serviceCategoryId": req.body.categoryId })
        if (checkCategoryInUser) {
            let categoryImage = checkCategory.categoryImage
            if (req.files.categoryImage) {
                let image = await cloudinary.v2.uploader.upload(req.files.categoryImage.path, { resource_type: "image" })
                categoryImage = image.secure_url
                let obj = {
                    categoryImage: categoryImage
                }
                await ServiceCategory.findByIdAndUpdate({ _id: req.body.categoryId }, { $set: obj }, { new: true })
                console.log("Image uploaded successfully");
                return res.send({ response_code: 200, response_message: "Image uploaded successfully" });
            }
            console.log("Can not user");
            return res.send({ response_code: 501, response_message: "You can not update this category because this is already used by provider." });
        }

        let categoryImage = checkCategory.categoryImage
        if (req.files.categoryImage) {
            let image = await cloudinary.v2.uploader.upload(req.files.categoryImage.path, { resource_type: "image" })
            categoryImage = image.secure_url
        }
        let categoryObj = {
            "categoryName": req.body.categoryName,
            "categoryImage": categoryImage,
            portugueseCategoryName: req.body.portugueseCategoryName,
        }
        await ServiceCategory.findByIdAndUpdate({ _id: req.body.categoryId }, { $set: categoryObj }, { new: true })
        console.log("Category added successfully");
        res.send({ response_code: 200, response_message: "Category added successfully" });
        if (checkAdmin.userType == "Sub-Admin") {
            let actionObj = new ActionModel({
                "userId": req.body.userId,
                "action": `New service category updated by ${checkAdmin.name};`
            })
            await actionObj.save()
        }
    },

    //============================================Update sub category=================================//

    updateSubCategory: async (req, res) => {

        console.log("Request for update sub-category is=============>", req.body);
        console.log("Request for update sub-category is=============>", req.files);
        let checkAdmin = await Admin.findOne({ _id: req.body.adminId })
        if (!checkAdmin) {
            console.log("Admin Id is incorrect");
            return res.send({ response_code: 501, response_message: "Something went wrong" })
        }
        let checkCategory = await ServiceSubCategory.findOne({ _id: req.body.subCategoryId })
        let orderRequest = {
            $and: [
                {
                    $or: [
                        { "status": "Active" },
                        { "status": "Pending" }
                    ]
                },
                { serviceSubCategoryId: req.body.subCategoryId }
            ]
        }
        let checkCategoryInOrder = await ServiceModel.findOne(orderRequest)
        if (checkCategoryInOrder) {
            let categoryImage = checkCategory.image
            if (req.files.subCategoryImage) {
                let image = await cloudinary.v2.uploader.upload(req.files.subCategoryImage.path, { resource_type: "image" })
                categoryImage = image.secure_url
                let categoryObj = {
                    "image": categoryImage,
                }
                await ServiceSubCategory.findByIdAndUpdate({ _id: req.body.subCategoryId }, { $set: categoryObj }, { new: true })
                console.log("Image uploaded successfully");
                return res.send({ response_code: 200, response_message: "Image uploaded successfully" });
            }
            console.log("Can not user");
            return res.send({ response_code: 501, response_message: "You can not update this sub-category because this is already used in ongoing order." });
        }
        let checkCategoryInUser = await User.findOne({ "subCategoryNameArray.serviceSubCategoryId": req.body.subCategoryId })
        if (checkCategoryInUser) {
            let categoryImage = checkCategory.image
            if (req.files.subCategoryImage) {
                let image = await cloudinary.v2.uploader.upload(req.files.subCategoryImage.path, { resource_type: "image" })
                categoryImage = image.secure_url
                let categoryObj = {
                    "image": categoryImage,
                }
                await ServiceSubCategory.findByIdAndUpdate({ _id: req.body.subCategoryId }, { $set: categoryObj }, { new: true })
                console.log("Image uploaded successfully");
                return res.send({ response_code: 200, response_message: "Image uploaded successfully" });
            }
            console.log("Can not user");
            return res.send({ response_code: 501, response_message: "You can not update this sub-category because this is already used by provider." });
        }

        let categoryImage = checkCategory.image
        if (req.files.subCategoryImage) {
            let image = await cloudinary.v2.uploader.upload(req.files.subCategoryImage.path, { resource_type: "image" })
            categoryImage = image.secure_url
        }
        let categoryObj = {
            "subCategoryName": req.body.subCategoryName,
            "image": categoryImage,
            portugueseSubCategoryName: req.body.portugueseSubCategoryName,
        }
        await ServiceSubCategory.findByIdAndUpdate({ _id: req.body.subCategoryId }, { $set: categoryObj }, { new: true })
        console.log("Category added successfully");
        res.send({ response_code: 200, response_message: "Category added successfully" });
        if (checkAdmin.userType == "Sub-Admin") {
            let actionObj = new ActionModel({
                "userId": req.body.userId,
                "action": `New service sub-category updated by ${checkAdmin.name};`
            })
            await actionObj.save()
        }
    },

    //==========================================Update sub sub category===============================//

    updateSubSubCategory: (req, res) => {

        console.log("Request for update sub(sub)-category is=============>", req.body);
        ServiceSubSubCategory.findByIdAndUpdate({ "_id": req.body.subSubCategoryId }, req.body, { new: true }, (error, result) => {
            if (error) {
                console.log("Error is===========>", error);
                return res.send({ response_code: 500, response_message: "Internal server error" });
            }
            else if (!result) {
                console.log("Sub(Sub)-Category Id is incorrect");
                return res.send({ response_code: 501, response_message: "Sub(Sub)-Category Id is incorrect" });
            }
            else {
                Admin.findOne({ "_id": req.body.adminId }, (error2, result2) => {
                    if (error2) {
                        console.log("Error 2 is==========>", error2);
                        return res.send({ response_code: 500, response_message: "Internal server error" });

                    }
                    else {
                        if (result2.userType == "Admin") {
                            console.log("Sub(Sub)-Category updated successfully", result);
                            return res.send({ response_code: 200, response_message: "Sub(Sub)-Category updated successfully", Data: result });
                        }
                        else {
                            let actionObj = new ActionModel({
                                "userId": req.body.adminId,
                                "action": "Service sub-sub-category updated by " + result2.name
                            })
                            actionObj.save((error3, result3) => {
                                if (error3) {
                                    console.log("Error 3 is==========>", error3);
                                    return res.send({ response_code: 500, response_message: "Internal server error" });

                                }
                                else {
                                    console.log("Action data is=============>", result3);
                                    console.log("Sub(Sub)-Category updated successfully", result);
                                    return res.send({ response_code: 200, response_message: "Sub(Sub)-Category updated successfully", Data: result });
                                }
                            })
                        }
                    }
                })

            }
        })
    },

    //=========================================Get delivery persion list=============================//

    getDeliverPersion: async (req, res) => {

        try {
            console.log("Request for get delivery persion is==============>", req.body);
            let options = {
                page: req.body.pageNumber || 1,
                limit: req.body.limit || 10,
                sort: { createdAt: -1 },
            }
            var query = { $or: [{ signupWithDeliveryPerson: "true" }, { "adminVerifyDeliveryPerson": "true" }] }
            if (req.body.startDate && req.body.endDate) {
                query.createdAt = { $gte: req.body.startDate, $lte: req.body.endDate }
            }
            if (req.body.search) {
                query.$and = [{
                    $or: [
                        { "email": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "name": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "country": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "gender": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "status": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "adminVerifyDeliveryPerson": { $regex: "^" + req.body.search, $options: 'i' } },
                    ]
                }]
            }
            let result = await User.paginate(query, options)
            console.log("Delivery worker list found successfully", result);
            return res.send({ response_code: 200, response_message: "Delivery worker list found successfully", Data: result })
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" })
        }
    },

    //=========================================Get professional workers list========================//

    getProfessionalWorkers: async (req, res) => {

        try {
            console.log("Request for get delivery persion is==============>", req.body);
            let options = {
                page: req.body.pageNumber || 1,
                limit: req.body.limit || 10,
                sort: { createdAt: -1 },
            }
            let query = {}
            if (req.body.type == "all") {
                query = { userType: 'Provider', "adminVerifyProfessionalWorker": "true" }
            }
            if (req.body.type == "request") {
                query = { userType: 'Provider', signupWithProfessionalWorker: "true", "adminVerifyProfessionalWorker": "false" }
            }

            if (req.body.startDate && req.body.endDate) {
                query.createdAt = { $gte: req.body.startDate, $lte: req.body.endDate }
            }
            if (req.body.search) {
                query.$and = [{
                    $or: [
                        { "email": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "name": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "country": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "countryCode": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "mobileNumber": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "status": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "certificateVerify": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "dutyStatus": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "appLanguage": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "speakLanguage": { $regex: "^" + req.body.search, $options: 'i' } },
                    ]
                }]
            }
            let result = await User.paginate(query, options)
            console.log("Professional worker list found successfully", result);
            return res.send({ response_code: 200, response_message: "Professional worker list found successfully", Data: result })
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" })
        }
    },

    //=============================================Order list delivery persion=======================//

    orderListDeliveryPersion: async (req, res) => {

        try {
            console.log("Request for get delivery persion order list is============>", req.body);
            let options = {
                page: req.body.pageNumber || 1,
                limit: req.body.limit || 10,
                sort: { createdAt: -1 },
            }

            let query = { "adminVerifyDeliveryPerson": "true" }
            if (req.body.startDate && req.body.endDate) {
                query.createdAt = { $gte: req.body.startDate, $lte: req.body.endDate }
            }
            if (req.body.search) {
                query.$and = [{
                    $or: [
                        { "orderNumber": { $regex: "^" + req.body.search, $options: 'i' } }
                    ]
                }]
            }
            let result = await ServiceModel.paginate(query, options)
            console.log("Delivery worker order list found successfully", result);
            return res.send({ response_code: 200, response_message: "Delivery worker order list found successfully", Data: result })
        } catch (error) {
            console.log("Error is============>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" })
        }
    },

    //============================================Order list professional worker====================//

    orderListProfessionalWorker: async (req, res) => {

        try {
            console.log("Request for get professional worker order list is============>", req.body);
            let options = {
                page: req.body.pageNumber || 1,
                limit: req.body.limit || 10,
                sort: { createdAt: -1 },
            }

            let query = { "adminVerifyProfessionalWorker": "true" }

            if (req.body.startDate && req.body.endDate) {
                query.createdAt = { $gte: req.body.startDate, $lte: req.body.endDate }
            }
            if (req.body.search) {
                query.$and = [{
                    $or: [
                        { "orderNumber": { $regex: "^" + req.body.search, $options: 'i' } }
                    ]
                }]
            }
            let result = await ServiceModel.paginate(query, options)
            console.log("Order list professional worker is=============>", result);
            return res.send({ response_code: 200, response_message: "Professional worker order list found successfully", Data: result })
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" })
        }
    },

    //=============================================Get sub admin======================================//

    getSubAdmin: async (req, res) => {

        try {
            console.log("Request for get sub-admin list is============>", req.body);
            let options = {
                page: req.body.pageNumber || 1,
                limit: req.body.limit || 10,
                sort: { createdAt: -1 },
            }

            let query = { "userType": "Sub-Admin" }
            if (req.body.startDate && req.body.endDate) {
                query.createdAt = { $gte: req.body.startDate, $lte: req.body.endDate }
            }
            if (req.body.search) {
                query.$and = [{
                    $or: [
                        { "name": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "email": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "country": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "status": { $regex: "^" + req.body.search, $options: 'i' } },
                    ]
                }]
            }
            let result = await Admin.paginate(query, options)
            console.log("Sub-Admin List found successfully", result);
            return res.send({ response_code: 200, response_message: "Sub-Admin List found successfully", Data: result })
        } catch (error) {
            console.log("Error is=============>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //==============================================Delete sub admin===================================//

    deleteSubAdmin: async (req, res) => {

        try {
            console.log("Request for delete Category===========>", req.body);
            let result = await Admin.findByIdAndRemove({ "_id": req.body.subAdminId })
            if (!result) {
                console.log("Sub-Admin Id is incorrect");
                return res.send({ response_code: 501, response_message: "Invalid Token" });
            }
            console.log("Sub-Admin deleted successfully", result);
            res.send({ response_code: 200, response_message: "Sub-Admin deleted successfully" });
            let deleteAction = await ActionModel.remove({ userId: req.body.subAdminId })
            return;
        } catch (error) {
            console.log("Error is=========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //============================================Sub admin details==================================//

    subAdminDetails: (req, res) => {

        console.log("Request for get sub admin detail================>", req.body);
        if (!req.body.subAdminId) {
            return res.send({ response_code: 401, response_message: "Sub-Admin Id is required" })
        }
        else {
            Admin.findOne({ "_id": req.body.subAdminId }, (error, result) => {
                if (error) {
                    console.log("Error is============>", error)
                    return res.send({ response_code: 500, response_message: "Internal server error" })
                }
                else if (!result) {
                    console.log("Sub-Admin Id is not correct")
                    return res.send({ response_code: 500, response_message: "Sub-Admin Id is not correct" })
                }
                else {
                    console.log("Sub-Admin data found successfully", result)
                    return res.send({ response_code: 200, response_message: "Sub-Admin data found successfully", Data: result })
                }
            })
        }
    },

    //============================================Update sub admin details============================//

    updateSubAdminDetails: (req, res) => {

        console.log("Request for update sub admin details is=============>", req.body);
        if (!req.body.subAdminId) {
            return res.send({ response_code: 401, response_message: "Sub-Admin Id is required" })
        }
        else {
            Admin.findByIdAndUpdate({ "_id": req.body.subAdminId }, { $set: { "permission": req.body.permission, username: req.body.username, name: req.body.name, email: req.body.email, country: req.body.country } }, { new: true }, (error, result) => {
                if (error) {
                    console.log("Error is============>", error)
                    return res.send({ response_code: 500, response_message: "Internal server error" })
                }
                else if (!result) {
                    console.log("Sub-Admin Id is not correct")
                    return res.send({ response_code: 500, response_message: "Sub-Admin Id is not correct" })
                }
                else {
                    console.log("Sub-Admin profile updated successfully", result)
                    return res.send({ response_code: 200, response_message: "Sub-Admin profile updated successfully", Data: result })
                }
            })
        }
    },

    //=============================================Add normal user=====================================//

    addUser: async (req, res) => {

        let checkEmail = await User.findOne({ email: req.body.email })
        if (checkEmail) {
            console.log("Email already exist");
            return res.send({ response_code: 501, response_message: "Email already exist" });
        }
        let checkMobile = await User.findOne({ mobileNumber: req.body.mobileNumber })
        if (checkMobile) {
            console.log("Email already exist");
            return res.send({ response_code: 501, response_message: "Email already exist" });
        }
        var jwtToken = jwt.sign({ "email": req.body.email }, config.jwtSecretKey);
        console.log("Token is===========>", jwtToken);
        let profilePic = ''
        if (req.files.file) {
            let pro = await cloudinary.v2.uploader.upload(req.files.file.path, { resource_type: "image" })
            profilePic = pro.secure_url
        }
        let obj = new User({
            "name": req.body.name,
            "country": req.body.country,
            "email": req.body.email,
            "countryCode": req.body.countryCode,
            "appLanguage": req.body.appLanguage,
            "speakLanguage": req.body.speakLanguage,
            "mobileNumber": req.body.mobileNumber,
            "profilePic": profilePic,
            "signupCompeted": true,
            "jwtToken": jwtToken,
            "location": { "type": "Point", "coordinates": [77.3775657066111, 28.6258360177561] }

        })
        await obj.save()
        console.log("You have successfully signed up");
        return res.send({ response_code: 200, response_message: "New user added successfully" });
    },

    //=============================================Get all banner======================================//

    getBanner: async (req, res) => {

        try {
            console.log("Request for get banner list is============>", req.body);
            let options = {
                page: req.body.pageNumber || 1,
                limit: req.body.limit || 10,
                sort: { createdAt1: -1 },
            }

            let query = { "bannerType": req.body.bannerType }
            if (req.body.startDate && req.body.endDate) {
                query.createdAt = { $gte: req.body.startDate, $lte: req.body.endDate }
            }
            if (req.body.search) {
                query.$and = [{
                    $or: [
                        { "region": { $regex: "^" + req.body.search, $options: 'i' } }
                    ]
                }]
            }
            let result = await BannerModel.paginate(query, options)
            console.log("Banner List found successfully", result);
            return res.send({ response_code: 200, response_message: "Banner List found successfully", Data: result })
        } catch (error) {
            console.log("Error is=============>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //=============================================Become A delivery persion=============================//

    deliveryPerson: (req, res) => {

        var multiparty = require('multiparty');
        var form = new multiparty.Form();
        form.parse(req, (err, fields, files) => {
            if (err) {
                console.log("Unsupported data", err)
                return res.send({ response_code: 501, response_message: "Unsupported content type" })
            }
            else {
                if (!fields) {
                    console.log("Fields are required");
                    return res.send({ response_code: 401, response_message: "Fields are required" });
                }
                else if (!files) {
                    console.log("Files are required");
                    return res.send({ response_code: 401, response_message: "Files are required" });
                }
                else {
                    console.log("Fields are============>", fields);
                    console.log("Files are==============>", files);
                    User.findOne({ "mobileNumber": fields.mobileNumber[0] }, (error7, result7) => {
                        if (error7) {
                            console.log("Error 7 is==========>", error7);
                            return res.send({ response_code: 500, response_message: "Internal server error" })
                        }
                        else if (result7) {
                            console.log("Mobile number already exist");
                            return res.send({ response_code: 501, response_message: "Mobile number already exist" })
                        }
                        else {
                            if (files.file) {
                                cloudinary.v2.uploader.upload(files.file[0].path, { resource_type: "image" }, (error5, result5) => {
                                    if (error5) {
                                        console.log("Err 5 is============>", error5)
                                        return res.send({ response_code: 500, response_message: "Internal server error" })
                                    }
                                    else {
                                        let profilePic = result5.secure_url;

                                        let obj = new User({
                                            "deliveryPAboutUs": fields.deliveryPAboutUs[0],
                                            "vehicleType": fields.vehicleType[0],
                                            "vehicleNumber": fields.vehicleNumber[0],
                                            "insuranceNumber": fields.insuranceNumber[0],
                                            "deliveryPEmergencyContact": fields.deliveryPEmergencyContact[0],
                                            "userType": "DeliveryPersion",
                                            "deliveryPProfilePic": profilePic,
                                            "name": fields.name[0],
                                            "mobileNumber": fields.mobileNumber[0],
                                            "appLanguage": fields.appLanguage[0],
                                            "speakLanguage": fields.speakLanguage[0],
                                            "gender": fields.gender[0],
                                            "country": fields.country[0],
                                            "countryCode": fields.countryCode[0],
                                            "dob": fields.dob[0],
                                            "email": fields.email[0],
                                            "signupWithDeliveryPerson": "true",
                                            "adminVerifyDeliveryPerson": "true",
                                            "certificateVerify": "Verified",
                                            "location": { "type": "Point", "coordinates": [77.3775657066111, 28.6258360177561] }

                                        })
                                        obj.save((error6, result6) => {
                                            if (error6) {
                                                console.log("Error 6 is===========>", error6);
                                                return res.send({ response_code: 500, response_message: "Internal server error" })
                                            }
                                            else {
                                                Admin.findOne({ "_id": fields.adminId[0] }, (error10, result10) => {
                                                    if (error10) {
                                                        console.log("Error 10 is============>", error10);
                                                        return res.send({ response_code: 500, response_message: "Internal server error" });
                                                    }
                                                    else {
                                                        if (result10.userType == "Admin") {
                                                            console.log("Request submit successfully", result6)
                                                            res.send({ response_code: 200, response_message: "Request submit successfully", Data: result6 });
                                                        }
                                                        else {
                                                            let actionObj = new ActionModel({
                                                                "userId": fields.adminId[0],
                                                                "action": "New delivery worker added by " + result10.name
                                                            })
                                                            actionObj.save((error11, result11) => {
                                                                if (error11) {
                                                                    console.log("error 11 is=============>", error11);
                                                                    return res.send({ response_code: 500, response_message: "Internal server error" });
                                                                }
                                                                else {
                                                                    console.log("Action data is=========>", result11);
                                                                    console.log("Delivery worker added successfully", result6)
                                                                    res.send({ response_code: 200, response_message: "Delivery worker added successfully", Data: result6 });
                                                                }
                                                            })
                                                        }
                                                    }
                                                })


                                            }
                                        })

                                    }
                                })
                            }
                            else {
                                let obj = new User({
                                    "deliveryPAboutUs": fields.deliveryPAboutUs[0],
                                    "vehicleType": fields.vehicleType[0],
                                    "vehicleNumber": fields.vehicleNumber[0],
                                    "insuranceNumber": fields.insuranceNumber[0],
                                    "deliveryPEmergencyContact": fields.deliveryPEmergencyContact[0],
                                    "userType": "DeliveryPersion",
                                    "name": fields.name[0],
                                    "mobileNumber": fields.mobileNumber[0],
                                    "appLanguage": fields.appLanguage[0],
                                    "speakLanguage": fields.speakLanguage[0],
                                    "gender": fields.gender[0],
                                    "country": fields.country[0],
                                    "countryCode": fields.countryCode[0],
                                    "dob": fields.dob[0],
                                    "email": fields.email[0],
                                    "signupWithDeliveryPerson": "true",
                                    "adminVerifyDeliveryPerson": "true",
                                    "certificateVerify": "Verified",
                                    "location": { "type": "Point", "coordinates": [77.3775657066111, 28.6258360177561] }


                                })
                                obj.save((error6, result6) => {
                                    if (error6) {
                                        console.log("Error 6 is===========>", error6);
                                        return res.send({ response_code: 500, response_message: "Internal server error" })
                                    }
                                    else {
                                        Admin.findOne({ "_id": fields.adminId[0] }, (error10, result10) => {
                                            if (error10) {
                                                console.log("Error 10 is============>", error10);
                                                return res.send({ response_code: 500, response_message: "Internal server error" });
                                            }
                                            else {
                                                if (result10.userType == "Admin") {
                                                    console.log("Request submit successfully", result6)
                                                    res.send({ response_code: 200, response_message: "Request submit successfully", Data: result6 });
                                                }
                                                else {
                                                    let actionObj = new ActionModel({
                                                        "userId": fields.adminId[0],
                                                        "action": "New delivery worker added by " + result10.name
                                                    })
                                                    actionObj.save((error11, result11) => {
                                                        if (error11) {
                                                            console.log("error 11 is=============>", error11);
                                                            return res.send({ response_code: 500, response_message: "Internal server error" });
                                                        }
                                                        else {
                                                            console.log("Action data is=========>", result11);
                                                            console.log("Delivery worker added successfully", result6)
                                                            res.send({ response_code: 200, response_message: "Delivery worker added successfully", Data: result6 });
                                                        }
                                                    })
                                                }
                                            }
                                        })

                                    }
                                })

                            }

                        }
                    })


                }
            }
        })
    },

    //============================================Update rating=========================================//

    updateRating: async (req, res) => {

        console.log("Request for update rating details is=============>", req.body);
        let ratingData = await RatingModel.findOne({ "_id": req.body.ratingId })
        if (!ratingData) {
            console.log("Rating Id is incorrect");
            return res.send({ response_code: 501, response_message: "Rating Id is incorrect" });
        }
        await RatingModel.findByIdAndUpdate({ "_id": req.body.ratingId }, req.body, { new: true })
        let totalRating = await RatingModel.aggregate([
            {
                $match: {
                    ratingTo: ObjectId(ratingData.ratingTo)
                }
            },
            {
                "$group": {
                    _id: "$ratingTo",
                    total: { "$sum": "$rate" },
                    average: { "$avg": "$rate" }
                }
            }
        ])
        await User.findByIdAndUpdate({ _id: ratingData.ratingTo }, { totalRating: totalRating[0].total, avgRating: totalRating[0].average }, { new: true })
        let checkAdmin = await Admin.findOne({ _id: req.body.adminId })
        if (checkAdmin.userType == "Sub-Admin") {
            let actionObj = new ActionModel({
                "userId": req.body.userId,
                "action": "Rating updated by " + checkAdmin.name
            })
            await actionObj.save()
        }
        console.log("Rating details updated successfully", ratingData);
        return res.send({ response_code: 200, response_message: "Rating details updated successfully" });

    },

    //================================================Delete user======================================//

    deleteUser: async (req, res) => {

        try {
            console.log("Request for delete user is============>", req.body);
            let result = await User.findByIdAndRemove({ "_id": req.body.userId })
            if (!result) {
                console.log("User id is incorrect");
                return res.send({ response_code: 501, response_message: "Invalid Token" });
            }
            console.log("User deleted successfully", result);
            res.send({ response_code: 200, response_message: "User deleted successfully" });
            let ratingQuery = { $or: [{ "ratingBy": req.body.userId }, { "ratingTo": req.body.userId }] }
            await RatingModel.remove(ratingQuery)
            await Notification.remove({ notiTo: req.body.userId })
            await ContactModel.remove({ "userId": req.body.userId })
            await ServiceModel.update({ "userId": req.body.userId }, { $set: { deleteStatus: true } }, { multi: true })
            await ServiceModel.update({ "offerAcceptedOfId": req.body.userId }, { $set: { deleteStatus: true } }, { multi: true })
            await MakeAOfferDeliveryPerson.update({ "makeOfferById": req.body.userId }, { $set: { deleteStatus: true } }, { multi: true })
            await MakeAOfferDeliveryPerson.update({ "userId": req.body.userId }, { $set: { deleteStatus: true } }, { multi: true })
            await MakeAOfferDeliveryPerson.update({ "orderOwner": req.body.userId }, { $set: { deleteStatus: true } }, { multi: true })
            await MakeAOfferDeliveryPerson.update({ "offerAcceptedById": req.body.userId }, { $set: { deleteStatus: true } }, { multi: true })
            await MakeAOfferDeliveryPerson.update({ "offerAcceptedOfId": req.body.userId }, { $set: { deleteStatus: true } }, { multi: true })
        } catch (error) {
            console.log("Error is==========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //===============================================Professional worker=============================//

    professionalWorker: async (req, res) => {

        let checkEmail = await User.findOne({ email: req.body.email })
        if (checkEmail) {
            console.log("Email already exist");
            return res.send({ response_code: 501, response_message: "Email already exist" });
        }
        let checkMobile = await User.findOne({ mobileNumber: req.body.mobileNumber })
        if (checkMobile) {
            console.log("Email already exist");
            return res.send({ response_code: 501, response_message: "Email already exist" });
        }
        var jwtToken = jwt.sign({ "email": req.body.email }, config.jwtSecretKey);
        console.log("Token is===========>", jwtToken);
        let profilePic = ''
        if (req.files.file) {
            let pro = await cloudinary.v2.uploader.upload(req.files.file.path, { resource_type: "image" })
            profilePic = pro.secure_url
        }
        let obj = new User({
            "name": req.body.name,
            "country": req.body.country,
            "email": req.body.email,
            "countryCode": req.body.countryCode,
            "appLanguage": req.body.appLanguage,
            "speakLanguage": req.body.speakLanguage,
            "mobileNumber": req.body.mobileNumber,
            "profilePic": profilePic,
            "signupCompeted": true,
            "jwtToken": jwtToken,
            userType: 'Provider',
            "adminVerifyProfessionalWorker": "true",
            "signupWithProfessionalWorker": "true",
            "location": { "type": "Point", "coordinates": [77.3775657066111, 28.6258360177561] }

        })
        await obj.save()
        console.log("You have successfully signed up");
        return res.send({ response_code: 200, response_message: "New user added successfully" });
    },

    //=============================================Update User Details===============================//

    updateUserDetails: (req, res) => {

        console.log("Request for update user details is=====================>", req.body);
        if (!req.body.userId) {
            return res.send({ response_code: 401, response_message: "User Id is required" })
        }
        else {
            User.findByIdAndUpdate({ "_id": req.body.userId }, req.body, { new: true }, (error, result) => {
                if (error) {
                    console.log("Error is============>", error)
                    return res.send({ response_code: 500, response_message: "Internal server error" })
                }
                else if (!result) {
                    console.log("User  Id is not correct")
                    return res.send({ response_code: 500, response_message: "Something went wrong" })
                }
                else {
                    Admin.findOne({ "_id": req.body.adminId }, (error2, result2) => {
                        if (error2) {
                            console.log("Error 2 is==========>", error2);
                            return res.send({ response_code: 500, response_message: "Internal server error" })
                        }
                        else {
                            console.log("Result 2 is============>", result2);
                            if (result2.userType == "Admin") {
                                console.log("User profile updated successfully", result)
                                return res.send({ response_code: 200, response_message: "User profile updated successfully", Data: result })
                            }
                            else {
                                let actionObj = new ActionModel({
                                    "userId": req.body.userId,
                                    "action": "User detail updated by " + result2.name
                                })
                                actionObj.save((error3, result3) => {
                                    if (error3) {
                                        console.log("Error 3 is===========>", error3);
                                        return res.send({ response_code: 500, response_message: "Internal server error" })

                                    }
                                    else {
                                        console.log("Action data is===========>", result3);
                                        console.log("User profile updated successfully", result)
                                        return res.send({ response_code: 200, response_message: "User profile updated successfully", Data: result })
                                    }
                                })
                            }
                        }
                    })
                }
            })
        }
    },

    //============================================Get all bank=======================================//

    getBank: (req, res) => {

        console.log("Request for get banner list is============>", req.body);
        let options = {
            page: req.body.pageNumber || 1,
            limit: req.body.limit || 10,
            sort: { createdAt1: -1 },
        }

        let query = {}
        if (req.body.startDate && req.body.endDate) {
            query.createdAt = { $gte: req.body.startDate, $lte: req.body.endDate }
        }
        if (req.body.search) {
            query.$and = [{
                $or: [
                    { "name": { $regex: "^" + req.body.search, $options: 'i' } }
                ]
            }]
        }
        WalletModel.paginate(query, options, (error, result) => {
            if (error) {
                console.log("Error is=============>", error);
                return res.send({ response_code: 500, response_message: "Internal server error" });
            }
            else {
                console.log("Bank List found successfully", result);
                res.send({ response_code: 200, response_message: "Bank List found successfully", Data: result })
            }
        })
    },

    //==============================================Delete bank======================================//

    deleteBank: (req, res) => {

        console.log("Request for delete bank is====================>", req.body);
        if (!req.body.bankId || !req.body.userId) {
            console.log("All fields are required")
            return res.send({ response_code: 401, response_message: "All fields are required" })
        }
        else {
            WalletModel.findOneAndUpdate({ "userId": req.body.userId, "bank._id": req.body.bankId }, { $pull: { bank: { _id: req.body.bankId } } }, { safe: true, new: true }, (error, result) => {
                if (error) {
                    console.log("Error is==========>", error)
                    return res.send({ response_code: 500, response_message: "Internal server error" })

                }
                else if (!result) {
                    console.log("Invalid user Id")
                    return res.send({ response_code: 501, response_message: "Invalid user Id" })
                }
                else {

                    console.log("Bank deleted successfully", result)
                    res.send({ response_code: 200, response_message: "Bank deleted successfully", Data: result });
                }
            });
        }
    },

    //=============================================Update bank========================================//

    updateBank: (req, res) => {

        console.log("Request for update bank is==================>", req.body);
        if (!req.body.bankId || !req.body.userId) {
            console.log("All fields are required")
            return res.send({ response_code: 401, response_message: "All fields are required" })
        }
        else {
            User.findOne({ "_id": req.body.userId }, (error, result) => {
                if (error) {
                    console.log("Error is=======>", error);
                    return res.send({ response_code: 500, response_message: "Internal server error" })
                }
                else if (!result) {
                    console.log("Invalid user Id")
                    return res.send({ response_code: 501, response_message: "Invalid user Id" })
                }
                else {
                    let value = {
                        "bankName": req.body.bankName,
                        "accountHolderName": req.body.accountHolderName,
                        "accountnumber": req.body.accountnumber,
                        "holderAccountNumber": req.body.holderAccountNumber,
                        "ibanNumber": req.body.ibanNumber
                    }
                    WalletModel.update({ "userId": req.body.userId, "bank._id": req.body.bankId }, { $set: { "bank.$.bankName": req.body.bankName, "bank.$.accountHolderName": req.body.accountHolderName, "bank.$.accountnumber": req.body.accountnumber, "bank.$.holderAccountNumber": req.body.holderAccountNumber, "bank.$.ibanNumber": req.body.ibanNumber } }, { new: true }, (error1, result1) => {
                        if (error1) {
                            console.log("Error is==========>", error1)
                            return res.send({ response_code: 500, response_message: "Internal server error" })
                        }
                        else if (!result1) {
                            console.log("Invalid Id")
                            return res.send({ response_code: 501, response_message: "Invalid  Id" })
                        }
                        else {
                            console.log("Bank details updated successfully", result1)
                            res.send({ response_code: 200, response_message: "Bank details updated successfully", Data: result1 });
                        }
                    })
                }
            })
        }
    },

    //=============================================Update Earning====================================//

    updateCurrency: (req, res) => {

        console.log("Request is===========>", req.body);
        if (!req.body.currency) {
            console.log("Missing");
        }
        else {
            Admin.findByIdAndUpdate({ "_id": req.body.adminId }, req.body, { new: true }, (error, result) => {
                if (error) {
                    console.log("Error is==========>", error);
                    return res.send({ response_code: 500, response_message: "Internal server error" });
                }
                else if (!result) {
                    console.log("Admin Id is incorrect");
                    return res.send({ response_code: 501, response_message: "Admin Id is incorrect" });
                }
                else {
                    console.log("Currency updated successfully", result);
                    return res.send({ response_code: 200, response_message: "Currency updated successfully" });
                }
            })

        }

    },

    //============================================Update certificate status==========================//

    updateCertificateStatus: async (req, res) => {

        console.log("Request for update certificate status is==========>", req.body);
        try {
            let checkUser = await User.findOne({ _id: req.body.userId })
            if (!checkUser) {
                console.log("User Id is not correct");
                return res.send({ response_code: 501, response_message: "Something went wrong" });
            }
            if (req.body.signupWithProfessionalWorker == 'true' && req.body.certificateVerify == 'Verified') {
                let query = { $set: { adminVerifyProfessionalWorker: "true", certificateVerify: req.body.certificateVerify } }
                let updateUser = await User.findByIdAndUpdate({ _id: req.body.userId }, query, { new: true })

                let notiTitle = "Request Approved"
                let newMes = "Welcome to Paginazul App"
                let message = `Hi ${checkUser.name}! your request for become a provider has been approved by admin now.`
                let notiMessage = "Hi your request for become a provider has been approved by admin now."
                if (checkUser.appLanguage == "Portuguese") {
                    notiTitle = "Solicitação aprovada"
                    notiMessage = "Olá, o seu pedido para se tornar um fornecedor foi aprovado pelo administrador agora."
                    message = `Oi ${checkUser.name}! sua solicitação para se tornar um provedor foi aprovada pelo administrador agora.`
                    newMes = "Bem-vindo ao Paginazul App"
                }
                let notiObj = new Notification({
                    notiTo: req.body.userId,
                    notiTitle: notiTitle,
                    notiMessage: notiMessage
                })
                await notiObj.save()
                console.log("Status updated successfully", updateUser);
                res.send({ response_code: 200, response_message: "Status updated successfully" });


                func.sendHtmlEmail1(checkUser.email, notiTitle, message, newMes, (error10, result10) => {
                    if (error10) {
                        console.log("Error 10 is=========>", error10);
                    }
                    else {
                        console.log("mail send is==========>", result10);
                    }
                })
                if (checkUser.deviceType == 'android') {
                    func.sendNotificationForAndroid(checkUser.deviceToken, notiTitle, notiMessage, "requestApproved", (error10, result10) => {
                        if (error10) {
                            console.log("Error 10 is=========>", error10);
                        }
                        else {
                            console.log("send notification is==========>", result10);
                        }
                    })
                }
                if (checkUser.deviceType == 'iOS') {
                    let query = { $and: [{ notiTo: req.body.userId }, { isSeen: "false" }] }
                    let result2 = await Notification.find(query)
                    let badgeCount = result2.length;
                    func.sendiosNotificationProvider(checkUser.deviceToken, notiTitle, notiMessage, badgeCount, "requestApproved", (error10, result10) => {
                        if (error10) {
                            console.log("Error 10 is=========>", error10);
                        }
                        else {
                            console.log("send notification is==========>", result10);
                        }
                    })
                }
            }
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //============================================Update admin profile==============================//

    updateAdminProfile: (req, res) => {

        var multiparty = require('multiparty');
        var form = new multiparty.Form();
        form.parse(req, (err, fields, files) => {
            if (err) {
                console.log("Unsupported data", err)
                return res.send({ response_code: 202, response_message: "Unsupported content type" });
            }
            else {
                console.log("Fields are===========>", fields);
                console.log("Files are============>", files);
                if (files) {
                    cloudinary.v2.uploader.upload(files.file[0].path, { resource_type: "image" }, (error5, result5) => {
                        if (error5) {
                            console.log("Error in uploading image============>", error5)
                            return res.send({ response_code: 500, response_message: "Internal server error" });
                        }
                        else {
                            Admin.findByIdAndUpdate({ "_id": fields.adminId[0] }, { $set: { "profilePic": result5.secure_url } }, { new: true }, (error, result) => {
                                if (error) {
                                    console.log("Error is==========>", error);
                                    return res.send({ response_code: 500, response_message: "Internal server error" });
                                }
                                else if (!result) {
                                    console.log("Adminid is not correct");
                                    return res.send({ response_code: 501, response_message: "User Id is incorrect" });
                                }
                                else {
                                    console.log("Profile updated successfully", result);
                                    return res.send({ response_code: 200, response_message: "Profile updated successfully", Data: result });
                                }
                            })

                        }
                    })
                }
            }
        })
    },

    //=============================================Create Pdf=======================================//

    createPdf: (req, res) => {

        ServiceModel.findOne({ "_id": req.body.orderId }, (error, result) => {
            if (error) {
                console.log("error is==========>", error);
                return;
            }
            else if (!result) {
                console.log("No found Id")
                return
            }
            else {
                if (result.service == "RequireService") {
                    result.service = "Require Service"
                }
                if (result.serviceType == "DeliveryPersion") {
                    result.serviceType = "Delivery Persion"
                }
                if (result.serviceType == "DeliveryPersion") {
                    var subject = "Order Detail"
                    var signature = "Abhishek Arya"
                    var options = { format: 'Letter' };
                    var fileName = Date.now() + '.pdf';
                    var link = 'http://18.189.223.53:3000/api/v1/admin/getReceipt/' + fileName;
                    var html = `<!DOCTYPE html>
                    <html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
                    <head>
                    <meta charset="utf-8">
                    <meta http-equiv="x-ua-compatible" content="ie=edge">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
                    <meta name="x-apple-disable-message-reformatting">
                    <link href="//netdna.bootstrapcdn.com/bootstrap/3.0.0/css/bootstrap.min.css" rel="stylesheet" id="bootstrap-css">
                    <script src="//netdna.bootstrapcdn.com/bootstrap/3.0.0/js/bootstrap.min.js"></script>
                    <script src="//code.jquery.com/jquery-1.11.1.min.js"></script>
                    </head>
                    <body style="box-sizing:border-box;margin:0;padding:0;width:100%;word-break:break-word;-webkit-font-smoothing:antialiased;">
                    <div class="container" style="">
                 
                    <div class="">
                    <div class="well col-xs-10 col-sm-10 col-md-6 ">
                    <div class="row">
                    <div class="col-xs-6 col-sm-6 col-md-6">
                    <tr style="margin:0;padding:0">
                    <td width="600" height="130" valign="top" class="" style="background-image:url(https://res.cloudinary.com/sumit9211/image/upload/v1548744410/acq6u5kcd1ieumpg0xga.png);background-repeat:no-repeat;background-position:top center;">
                        <table width="460" height="50" class="" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto">
                            <tbody>
                            </tbody>
                        </table>
                      
                    </td>
                </tr> 
                <center>                    
                </center>  
                 </div>
            
                 <div class="col-xs-6 col-sm-6 col-md-6 text-right">
                 <center>   
                     <p>
                         <strong>Order created date: `+ result.createdAt + `</strong>
                     </p>
                     </center>   
                 </div>
             </div>
             <div class="row">
            <center>
                 <div class="text-center">
                     <h3>Order Details</h3><hr>
                 </div>
                 
                 <table>
                    
                     <tr>
                         <td colspan=3> </td>
                     </tr>
                     <tr>
                         <td colspan=3><b>Order Details :</b> </td>
                     </tr>
                     <tr>
                         <td>Order Number </td>
                         <td>-</td>
                         <td> ${result.orderNumber} </td>
                     </tr>
                     <tr>
                         <td>Service</td>
                         <td>-</td>
                         <td> ${result.service} </td>
                     </tr>
                     <tr>
                         <td>Service Type</td>
                         <td>-</td>
                         <td> ${result.serviceType} </td>
                     </tr>
                     <tr>
                     <td>Pickup Location</td>
                     <td>-</td>
                     <td> ${result.pickupLocation} </td>
                   </tr>
    
                   <tr>
                   <td>Dropoff Location</td>
                   <td>-</td>
                   <td> ${result.dropOffLocation} </td>
                 </tr>
    
                 <tr>
                 <td>Time</td>
                 <td>-</td>
                 <td> ${result.seletTime} </td>
               </tr>
    
               <tr>
               <td>Order Details</td>
               <td>-</td>
               <td> ${result.orderDetails} </td>
             </tr>
    
             <tr>
             <td>Status</td>
             <td>-</td>
             <td> ${result.status} </td>
           </tr>     
                 </table>
                <br>
                     </center>
                 </div>
             </div>
            </div>
            </body>
            </html>`
                    pdf.create(html, options).toFile('./Receipt/' + fileName, function (err11, res11) {
                        if (err11) {
                            return res.send({ response_code: 500, response_message: "Internal server error" })
                        }
                        else {
                            ServiceModel.findByIdAndUpdate({ "_id": req.body.orderId }, { $set: { "orderPdf": fileName } }, { new: true }, (error1, result1) => {
                                if (error1) {
                                    console.log("Error 1 is==========>", error1);
                                }
                                else {
                                    console.log(res11);
                                    return res.send({ response_code: 200, response_message: "Pdf created", Data: fileName });

                                }
                            })

                        }
                    })
                }
                else {
                    var subject = "Order Detail"
                    var signature = "Abhishek Arya"
                    var options = { format: 'Letter' };
                    var fileName = Date.now() + '.pdf';
                    var link = 'http://18.189.223.53:3000/api/v1/admin/getReceipt/' + fileName;
                    var html = `<!DOCTYPE html>
                    <html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
                    <head>
                    <meta charset="utf-8">
                    <meta http-equiv="x-ua-compatible" content="ie=edge">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
                    <meta name="x-apple-disable-message-reformatting">
                    <link href="//netdna.bootstrapcdn.com/bootstrap/3.0.0/css/bootstrap.min.css" rel="stylesheet" id="bootstrap-css">
                    <script src="//netdna.bootstrapcdn.com/bootstrap/3.0.0/js/bootstrap.min.js"></script>
                    <script src="//code.jquery.com/jquery-1.11.1.min.js"></script>
                    </head>
                    <body style="box-sizing:border-box;margin:0;padding:0;width:100%;word-break:break-word;-webkit-font-smoothing:antialiased;">
                    <div class="container" style="">
                 
                    <div class="">
                    <div class="well col-xs-10 col-sm-10 col-md-6 ">
                    <div class="row">
                    <div class="col-xs-6 col-sm-6 col-md-6">
                    <tr style="margin:0;padding:0">
                    <td width="600" height="130" valign="top" class="" style="background-image:url(https://res.cloudinary.com/sumit9211/image/upload/v1548744410/acq6u5kcd1ieumpg0xga.png);background-repeat:no-repeat;background-position:top center;">
                        <table width="460" height="50" class="" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto">
                            <tbody>
                            </tbody>
                        </table>
                    </td>
                </tr> 
                <center>                    
                </center>  
                 </div>
            
                 <div class="col-xs-6 col-sm-6 col-md-6 text-right">
                 <center>   
                     <p>
                         <strong>Order created date: `+ result.createdAt + `</strong>
                     </p>
                     </center>   
                 </div>
             </div>
             <div class="row">
            <center>
                 <div class="text-center">
                     <h3>Order Details</h3><hr>
                 </div>
                 
                 <table>
                    
                     <tr>
                         <td colspan=3> </td>
                     </tr>
                     <tr>
                         <td colspan=3><b>Order Details :</b> </td>
                     </tr>
                     <tr>
                         <td>Order Number </td>
                         <td>-</td>
                         <td> ${result.orderNumber} </td>
                     </tr>
                     <tr>
                         <td>Service</td>
                         <td>-</td>
                         <td> ${result.service} </td>
                     </tr>
                     <tr>
                         <td>Service Type</td>
                         <td>-</td>
                         <td> ${result.serviceType} </td>
                     </tr>
                   <tr>
                   <td>Dropoff Location</td>
                   <td>-</td>
                   <td> ${result.pickupLocation} </td>
                 </tr>
    
                 <tr>
                 <td>Time</td>
                 <td>-</td>
                 <td> ${result.seletTime} </td>
               </tr>
    
               <tr>
               <td>Order Details</td>
               <td>-</td>
               <td> ${result.orderDetails} </td>
             </tr>
    
             <tr>
             <td>Status</td>
             <td>-</td>
             <td> ${result.status} </td>
           </tr>     
                 </table>
                <br>
                     </center>
                 </div>
             </div>
            </div>
            </body>
            </html>`
                    pdf.create(html, options).toFile('./Receipt/' + fileName, function (err11, res11) {
                        if (err11) {
                            return res.send({ response_code: 500, response_message: "Internal server error" })
                        }
                        else {
                            ServiceModel.findByIdAndUpdate({ "_id": req.body.orderId }, { $set: { "orderPdf": fileName } }, { new: true }, (error1, result1) => {
                                if (error1) {
                                    console.log("Error 1 is==========>", error1);
                                }
                                else {
                                    console.log(res11);
                                    return res.send({ response_code: 200, response_message: "Pdf created", Data: fileName });

                                }
                            })

                        }
                    })
                }

            }
        })
    },

    //=============================================Get receipt======================================//

    getReceipt: (req, res) => {

        console.log("================", req.params);
        if (!req.params.fileName) {
            return func.responseHandler(res, 400, "Please fill the Mandatory details.")
        }
        else {
            var filePath = path.join(__dirname, '.././Receipt/' + req.params.fileName);
            var stat = fileSystem.statSync(filePath);
            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-Length': stat.size
            });
            var readStream = fileSystem.createReadStream(filePath);
            readStream.pipe(res);
        }
    },

    //============================================Get order report==================================//

    getOrderReport: (req, res) => {

        console.log("Request for get order report is============>", req.body);
        let options = {
            page: req.body.pageNumber || 1,
            limit: req.body.limit || 10,
            sort: { createdAt: -1 },
            populate: { path: 'userId', select: 'name email gender countryCode country' },
        }

        let query = { "orderReported": "true" }
        if (req.body.startDate && req.body.endDate) {
            query.createdAt = { $gte: req.body.startDate, $lte: req.body.endDate }
        }
        if (req.body.search) {
            query.$and = [{
                $or: [
                    { "orderNumber": { $regex: "^" + req.body.search, $options: 'i' } }
                ]
            }]
        }
        ServiceModel.paginate(query, options, (error, result) => {
            if (error) {
                console.log("Error is=============>", error);
                return res.send({ response_code: 500, response_message: "Internal server error" });
            }
            else {
                console.log("Reported order list found successfully", result);
                res.send({ response_code: 200, response_message: "Reported order list found successfully", Data: result })
            }
        })
    },

    //=============================================Get Account data==================================//

    getAccountData: (req, res) => {

        console.log("Request for get account data is============>", req.body);
        let options = {
            page: req.body.pageNumber || 1,
            limit: req.body.limit || 10,
            sort: { createdAt: -1 },
        }

        let query = {}
        if (req.body.startDate && req.body.endDate) {
            query.createdAt = { $gte: req.body.startDate, $lte: req.body.endDate }
        }
        if (req.body.search) {
            query.$and = [{
                $or: [
                    { "currency": { $regex: "^" + req.body.search, $options: 'i' } },
                    { "taxInPercentage": { $regex: "^" + req.body.search, $options: 'i' } },
                    { "region": { $regex: "^" + req.body.search, $options: 'i' } }
                ]
            }]
        }
        Account.paginate(query, options, (error, result) => {
            if (error) {
                console.log("Error is=============>", error);
                return res.send({ response_code: 500, response_message: "Internal server error" });
            }
            else {
                console.log("Account data found successfully", result);
                res.send({ response_code: 200, response_message: "Account data found successfully", Data: result })
            }
        })
    },

    //===========================================Update account data=================================//

    updateAccountData: (req, res) => {

        console.log("Request for update account details is=============>", req.body);
        Account.findByIdAndUpdate({ "_id": req.body.accountId }, req.body, (error, result) => {
            if (error) {
                console.log("Error is============>", error);
                return res.send({ response_code: 500, response_message: "Internal server error" });
            }
            else if (!result) {
                console.log("Rating Id is incorrect");
                return res.send({ response_code: 501, response_message: "Something went wrong" });
            }
            else {
                Admin.findOne({ "_id": req.body.adminId }, (error2, result2) => {
                    if (error2) {
                        console.log("Error 2 is==========>", error2);
                    }
                    else {
                        if (result2.userType == "Admin") {
                            console.log("Account details updated successfully", result);
                            return res.send({ response_code: 200, response_message: "Account details updated successfully", Data: result });
                        }
                        else {
                            let actionObj = new ActionModel({
                                "userId": req.body.userId,
                                "action": "Account detail updated by " + result2.name
                            })
                            actionObj.save((error3, result3) => {
                                if (error3) {
                                    console.log("Error 3 is===========>", error3);
                                }
                                else {
                                    console.log("Action data is===========>", result3);
                                    console.log("Account details updated successfully", result);
                                    return res.send({ response_code: 200, response_message: "Account details updated successfully", Data: result });
                                }
                            })
                        }
                    }
                })
            }
        })
    },

    //===========================================Send Notification to user============================//

    sendMessageToUser: async (req, res) => {

        try {
            console.log("Request for send notification to single user===============>", req.body);
            let result = await User.findOne({ _id: req.body.userId })
            if (!result) {
                console.log("Invalid Token");
                return res.send({ response_code: 501, response_message: "Something went wrong" });
            }
            let notiObj = new Notification({
                notiTo: req.body.userId,
                notiTitle: req.body.title,
                notiMessage: req.body.message
            })
            await notiObj.save()
            res.send({ response_code: 200, response_message: "Notification send successfully" });
            if (result.deviceType == 'android') {
                func.sendNotificationForAndroid(result.deviceToken, req.body.title, req.body.message, '', (error10, result10) => {
                    if (error10) {
                        console.log("Error 10 is=========>", error10);
                    }
                    else {
                        console.log("send notification is==========>", result10);
                    }
                })
            }
            if (result.deviceType == 'iOS') {
                func.sendiosNotification(result.deviceToken, req.body.title, req.body.message, '', (error10, result10) => {
                    if (error10) {
                        console.log("Error 10 is=========>", error10);
                    }
                    else {
                        console.log("send notification is==========>", result10);
                    }
                })
            }

        } catch (error) {
            console.log("Error is===========", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }


    },

    //==========================================Send Notification to all===============================//

    sendNotificationToAll: async (req, res) => {

        try {
            console.log("Request for send notification to all is============>", req.body);
            if (req.body.type == "Provider") {
                var query = { $and: [{ "userType": "Provider" }, { "status": "ACTIVE" }] }
                let result = await User.find(query)
                if (result.length == 0) {
                    console.log("No user found to send notification");
                    return res.send({ response_code: 501, response_message: "Something went wrong" });
                }
                res.send({ response_code: 200, response_message: "Notification send successfully" });
                for (let i = 0; i < result.length; i++) {
                    let notiObj = new Notification({
                        notiTo: result[i]._id,
                        notiTitle: req.body.title,
                        notiMessage: req.body.message
                    })
                    await notiObj.save()
                    if (result[i].deviceType == 'android') {
                        func.sendNotificationForAndroid1(result[i].deviceToken, req.body.title, req.body.message, '', (error10, result10) => {
                            if (error10) {
                                console.log("Error 10 is=========>", error10);
                            }
                            else {
                                console.log("Send notification is=============>", result10);

                            }
                        })
                    }
                    if (result[i].deviceType == 'iOS') {
                        func.sendiosNotificationProvider(result[i].deviceToken, req.body.title, req.body.message, '', (error10, result10) => {
                            if (error10) {
                                console.log("Error 10 is=========>", error10);
                                return res.send({ response_code: 500, response_message: "Internal server error" })
                            }
                            else {
                                console.log("Send notification is=============>", result10);
                            }
                        })
                    }
                }
                let checkAdmin = await Admin.findOne({ _id: req.body.adminId })
                if (checkAdmin.userType == 'Sub-Admin') {
                    let actionObj = new ActionModel({
                        "userId": req.body.userId,
                        "action": "Send notification to all user by " + result2.name
                    })
                    await actionObj.save()
                }

            }
            else {
                var query = { $and: [{ "userType": "User" }, { "status": "ACTIVE" }] }
                let result = await User.find(query)
                if (result.length == 0) {
                    console.log("No user found to send notification");
                    return res.send({ response_code: 501, response_message: "Something went wrong" });
                }
                res.send({ response_code: 200, response_message: "Notification send successfully" });
                for (let i = 0; i < result.length; i++) {
                    let notiObj = new Notification({
                        notiTo: result[i]._id,
                        notiTitle: req.body.title,
                        notiMessage: req.body.message
                    })
                    await notiObj.save()
                    if (result[i].deviceType == 'android') {
                        func.sendNotificationForAndroid1(result[i].deviceToken, req.body.title, req.body.message, '', (error10, result10) => {
                            if (error10) {
                                console.log("Error 10 is=========>", error10);
                            }
                            else {
                                console.log("Send notification is=============>", result10);

                            }
                        })
                    }
                    if (result[i].deviceType == 'iOS') {
                        func.sendiosNotification(result[i].deviceToken, req.body.title, req.body.message, '', (error10, result10) => {
                            if (error10) {
                                console.log("Error 10 is=========>", error10);
                                return res.send({ response_code: 500, response_message: "Internal server error" })
                            }
                            else {
                                console.log("Send notification is=============>", result10);

                            }
                        })
                    }
                }
                let checkAdmin = await Admin.findOne({ _id: req.body.adminId })
                if (checkAdmin.userType == 'Sub-Admin') {
                    let actionObj = new ActionModel({
                        "userId": req.body.userId,
                        "action": "Send notification to all user by " + result2.name
                    })
                    await actionObj.save()
                }
            }

        } catch (error) {
            console.log("Error is===========", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }

    },

    //==========================================Get user account detail================================//

    getUserDataForAccountingDelivery: async (req, res) => {

        try {
            console.log("Request for get user list for accounting is============>", req.body);
            let options = {
                page: req.body.pageNumber || 1,
                limit: req.body.limit || 10,
                sort: { createdAt1: -1 },
            }

            let query = { adminVerifyDeliveryPerson: "true" }
            if (req.body.startDate && req.body.endDate) {
                query.createdAt = { $gte: req.body.startDate, $lte: req.body.endDate }
            }
            if (req.body.search) {
                query.$and = [{
                    $or: [
                        { "name": { $regex: "^" + req.body.search, $options: 'i' } }
                    ]
                }]
            }
            let result = await User.paginate(query, options)
            console.log("User list found successfully", result);
            res.send({ response_code: 200, response_message: "User list found successfully", Data: result })

        } catch (error) {
            console.log("Error is===========", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //========================================get professional worker account==========================//

    getUserDataForAccountingProfessional: async (req, res) => {

        try {
            console.log("Request for get user list for accounting is============>", req.body);
            let options = {
                page: req.body.pageNumber || 1,
                limit: req.body.limit || 10,
                sort: { createdAt1: -1 },
            }

            let query = { adminVerifyProfessionalWorker: "true" }
            if (req.body.startDate && req.body.endDate) {
                query.createdAt = { $gte: req.body.startDate, $lte: req.body.endDate }
            }
            if (req.body.search) {
                query.$and = [{
                    $or: [
                        { "name": { $regex: "^" + req.body.search, $options: 'i' } }
                    ]
                }]
            }
            let result = await User.paginate(query, options)
            console.log("User list found successfully", result);
            res.send({ response_code: 200, response_message: "User list found successfully", Data: result })
        } catch (error) {
            console.log("Error is===========", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //=======================================Update measurement status=================================//

    updateMeasurementStatus: (req, res) => {

        console.log("Request for update measurement status is===========>", req.body);
        User.findByIdAndUpdate({ "_id": req.body.userId }, req.body, { new: true }, (error, result) => {
            if (error) {
                console.log("Error is==========>", error);
                return res.send({ response_code: 500, response_message: "Internal server error" });
            }
            else if (!result) {
                console.log("ussr id is incorrect");
                return res.send({ response_code: 501, response_message: "Something went wrong" });
            }
            else {
                Admin.findOne({ "_id": req.body.adminId }, (error2, result2) => {
                    if (error2) {
                        console.log("Error 2 is==========>", error2);
                    }
                    else {
                        if (result2.userType == "Admin") {
                            console.log("Status updated successfully", result);
                            res.send({ response_code: 200, response_message: "Status updated successfully", Data: result })
                        }
                        else {
                            let actionObj = new ActionModel({
                                "userId": req.body.userId,
                                "action": "Account measurement status updated by " + result2.name
                            })
                            actionObj.save((error3, result3) => {
                                if (error3) {
                                    console.log("Error 3 is===========>", error3);
                                }
                                else {
                                    console.log("Action data is===========>", result3);
                                    console.log("Status updated successfully", result);
                                    res.send({ response_code: 200, response_message: "Status updated successfully", Data: result })
                                }
                            })
                        }
                    }
                })
            }
        })
    },

    //========================================Update minimum offer status===============================//

    updateMinimumOfferStatus: (req, res) => {

        console.log("Request for update offer status is===========>", req.body);
        User.findByIdAndUpdate({ "_id": req.body.userId }, req.body, { new: true }, (error, result) => {
            if (error) {
                console.log("Error is==========>", error);
                return res.send({ response_code: 500, response_message: "Internal server error" });
            }
            else if (!result) {
                console.log("ussr id is incorrect");
                return res.send({ response_code: 501, response_message: "Something went wrong" });
            }
            else {
                Admin.findOne({ "_id": req.body.adminId }, (error2, result2) => {
                    if (error2) {
                        console.log("Error 2 is==========>", error2);
                    }
                    else {
                        if (result2.userType == "Admin") {
                            console.log("Status updated successfully", result);
                            res.send({ response_code: 200, response_message: "Status updated successfully", Data: result })
                        }
                        else {
                            let actionObj = new ActionModel({
                                "userId": req.body.userId,
                                "action": "Minimum offer status updated by " + result2.name
                            })
                            actionObj.save((error3, result3) => {
                                if (error3) {
                                    console.log("Error 3 is===========>", error3);
                                }
                                else {
                                    console.log("Action data is===========>", result3);
                                    console.log("Status updated successfully", result);
                                    res.send({ response_code: 200, response_message: "Status updated successfully", Data: result })
                                }
                            })
                        }
                    }
                })
            }
        })
    },

    //========================================Update minimum offer for delivery=========================//

    updateMinimumOfferAllDelivery: (req, res) => {

        console.log("Request for update offer status is===========>", req.body);
        var query = { $and: [{ adminVerifyDeliveryPerson: "true" }, { country: req.body.country }] }
        User.find(query, (error, result) => {
            if (error) {
                console.log("Error is==========>", error);
                return res.send({ response_code: 500, response_message: "Internal server error" });
            }
            else if (!result) {
                console.log("ussr id is incorrect");
                return res.send({ response_code: 501, response_message: "Something went wrong" });
            }
            else {
                Admin.findOne({ "_id": req.body.adminId }, (error2, result2) => {
                    if (error2) {
                        console.log("Error 2 is==========>", error2);
                    }
                    else {
                        if (result2.userType == "Admin") {
                            for (let i = 0; i < result.length; i++) {
                                User.findByIdAndUpdate({ "_id": result[i]._id }, req.body, (error1, result1) => {
                                    if (error1) {
                                        console.log("error 1 is============>", error1);
                                    }
                                    else {
                                        console.log("Status updated successfully", result);

                                    }
                                })
                            }
                            res.send({ response_code: 200, response_message: "Status updated successfully" })
                        }
                        else {
                            let actionObj = new ActionModel({
                                "userId": req.body.userId,
                                "action": "Delivery worker minimum offer limit updated by " + result2.name
                            })
                            actionObj.save((error3, result3) => {
                                if (error3) {
                                    console.log("Error 3 is===========>", error3);
                                    return res.send({ response_code: 500, response_message: "Internal server error" });
                                }
                                else {
                                    console.log("Action data is===========>", result3);
                                    for (let i = 0; i < result.length; i++) {
                                        User.findByIdAndUpdate({ "_id": result[i]._id }, req.body, (error1, result1) => {
                                            if (error1) {
                                                console.log("error 1 is============>", error1);
                                            }
                                            else {
                                                console.log("Status updated successfully", result);

                                            }
                                        })
                                    }
                                    res.send({ response_code: 200, response_message: "Status updated successfully" })
                                }
                            })
                        }
                    }
                })
            }
        })
    },

    //=======================================Update offer for professional==============================//

    updateOfferAllProfessional: (req, res) => {

        console.log("Request for update offer status is===========>", req.body);
        var query = { $and: [{ adminVerifyProfessionalWorker: "true" }, { country: req.body.country }] }
        User.find(query, (error, result) => {
            if (error) {
                console.log("Error is==========>", error);
                return res.send({ response_code: 500, response_message: "Internal server error" });
            }
            else if (!result) {
                console.log("ussr id is incorrect");
                return res.send({ response_code: 501, response_message: "Something went wrong" });
            }
            else {
                Admin.findOne({ "_id": req.body.adminId }, (error2, result2) => {
                    if (error2) {
                        console.log("Error 2 is==========>", error2);
                    }
                    else {
                        if (result2.userType == "Admin") {
                            for (let i = 0; i < result.length; i++) {
                                User.findByIdAndUpdate({ "_id": result[i]._id }, req.body, (error1, result1) => {
                                    if (error1) {
                                        console.log("error 1 is============>", error1);
                                    }
                                    else {
                                        console.log("Status updated successfully", result);

                                    }
                                })
                            }
                            res.send({ response_code: 200, response_message: "Status updated successfully" })
                        }
                        else {
                            let actionObj = new ActionModel({
                                "userId": req.body.userId,
                                "action": "Minimum offer of all user status updated by " + result2.name
                            })
                            actionObj.save((error3, result3) => {
                                if (error3) {
                                    console.log("Error 3 is===========>", error3);
                                }
                                else {
                                    console.log("Action data is===========>", result3);
                                    for (let i = 0; i < result.length; i++) {
                                        User.findByIdAndUpdate({ "_id": result[i]._id }, req.body, (error1, result1) => {
                                            if (error1) {
                                                console.log("error 1 is============>", error1);
                                            }
                                            else {
                                                console.log("Status updated successfully", result);

                                            }
                                        })
                                    }
                                    res.send({ response_code: 200, response_message: "Status updated successfully" })
                                }
                            })
                        }
                    }
                })

            }
        })
    },

    //==========================================Update measurement delivery ============================//

    updateMeasurementAllDelivery: (req, res) => {

        console.log("Request for update measurement  status for delivery is===========>", req.body);
        User.find({ adminVerifyDeliveryPerson: "true" }, (error, result) => {
            if (error) {
                console.log("Error is==========>", error);
                return res.send({ response_code: 500, response_message: "Internal server error" });
            }
            else if (!result) {
                console.log("ussr id is incorrect");
                return res.send({ response_code: 501, response_message: "Something went wrong" });
            }
            else {
                Admin.findOne({ "_id": req.body.adminId }, (error2, result2) => {
                    if (error2) {
                        console.log("Error 2 is==========>", error2);
                    }
                    else {
                        if (result2.userType == "Admin") {
                            for (let i = 0; i < result.length; i++) {
                                User.findByIdAndUpdate({ "_id": result[i]._id }, req.body, (error1, result1) => {
                                    if (error1) {
                                        console.log("error 1 is============>", error1);
                                    }
                                    else {
                                        console.log("Status updated successfully", result1);

                                    }
                                })
                            }
                            res.send({ response_code: 200, response_message: "Status updated successfully" })
                        }
                        else {
                            let actionObj = new ActionModel({
                                "userId": req.body.userId,
                                "action": "Measurement limit status updated by " + result2.name
                            })
                            actionObj.save((error3, result3) => {
                                if (error3) {
                                    console.log("Error 3 is===========>", error3);
                                }
                                else {
                                    console.log("Action data is===========>", result3);
                                    for (let i = 0; i < result.length; i++) {
                                        User.findByIdAndUpdate({ "_id": result[i]._id }, req.body, (error1, result1) => {
                                            if (error1) {
                                                console.log("error 1 is============>", error1);
                                            }
                                            else {
                                                console.log("Status updated successfully", result1);

                                            }
                                        })
                                    }
                                    res.send({ response_code: 200, response_message: "Status updated successfully" })
                                }
                            })
                        }
                    }
                })


            }
        })
    },

    //=========================================Update measurement professional==========================//

    updateMeasurementAllProfessional: (req, res) => {

        console.log("Request for update all user measurement status is===========>", req.body);
        User.find({ adminVerifyProfessionalWorker: "true" }, (error, result) => {
            if (error) {
                console.log("Error is==========>", error);
                return res.send({ response_code: 500, response_message: "Internal server error" });
            }
            else if (!result) {
                console.log("ussr id is incorrect");
                return res.send({ response_code: 501, response_message: "Something went wrong" });
            }
            else {
                Admin.findOne({ "_id": req.body.adminId }, (error2, result2) => {
                    if (error2) {
                        console.log("Error 2 is==========>", error2);
                    }
                    else {
                        if (result2.userType == "Admin") {
                            for (let i = 0; i < result.length; i++) {
                                User.findByIdAndUpdate({ "_id": result[i]._id }, req.body, (error1, result1) => {
                                    if (error1) {
                                        console.log("error 1 is============>", error1);
                                    }
                                    else {
                                        console.log("Status updated successfully", result);

                                    }
                                })
                            }
                            res.send({ response_code: 200, response_message: "Status updated successfully" })
                        }
                        else {
                            let actionObj = new ActionModel({
                                "userId": req.body.userId,
                                "action": "Account measurement status updated by " + result2.name
                            })
                            actionObj.save((error3, result3) => {
                                if (error3) {
                                    console.log("Error 3 is===========>", error3);
                                }
                                else {
                                    console.log("Action data is===========>", result3);
                                    for (let i = 0; i < result.length; i++) {
                                        User.findByIdAndUpdate({ "_id": result[i]._id }, req.body, (error1, result1) => {
                                            if (error1) {
                                                console.log("error 1 is============>", error1);
                                            }
                                            else {
                                                console.log("Status updated successfully", result);

                                            }
                                        })
                                    }
                                    res.send({ response_code: 200, response_message: "Status updated successfully" })
                                }
                            })
                        }
                    }
                })

            }
        })
    },

    //============================================Get action list=======================================//

    getActionList: async (req, res) => {

        try {
            console.log("Request for get action list is============>", req.body);
            let options = {
                page: req.body.pageNumber || 1,
                limit: req.body.limit || 10,
                sort: { createdAt1: -1 },
                populate: 'userId'
            }

            let query = {}
            if (req.body.startDate && req.body.endDate) {
                query.createdAt = { $gte: req.body.startDate, $lte: req.body.endDate }
            }
            if (req.body.search) {
                query.$and = [{
                    $or: [
                        { "action": { $regex: "^" + req.body.search, $options: 'i' } }
                    ]
                }]
            }
            let result = await ActionModel.paginate(query, options)
            console.log("Action list found successfully", result);
            return res.send({ response_code: 200, response_message: "Action list found successfully", Data: result })
        } catch (error) {
            console.log("Error is=============>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //=============================================delete action========================================//

    deleteAction: async (req, res) => {

        try {
            console.log("Request for delete action===========>", req.body);
            let result = await ActionModel.findByIdAndRemove({ "_id": req.body.actionId })
            if (!result) {
                console.log("Action Id is incorrect");
            }
            console.log("Record deleted successfully", result);
            return res.send({ response_code: 200, response_message: "Record deleted successfully" });
        } catch (error) {
            console.log("Error is=========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //=============================================get report reason list================================//

    getReportReasonList: async (req, res) => {

        try {
            console.log("Request for get report reason list is============>", req.body);
            let options = {
                page: req.body.pageNumber || 1,
                limit: req.body.limit || 10,
                sort: { createdAt1: -1 },
                populate: 'userId'
            }

            let query = {}
            if (req.body.startDate && req.body.endDate) {
                query.createdAt = { $gte: req.body.startDate, $lte: req.body.endDate }
            }
            if (req.body.search) {
                query.$and = [{
                    $or: [
                        { "reportReason": { $regex: "^" + req.body.search, $options: 'i' } }
                    ]
                }]
            }
            let result = await ReportReasonModel.paginate(query, options)
            console.log("Reason list found successfully", result);
            return res.send({ response_code: 200, response_message: "Reason list found successfully", Data: result })

        } catch (error) {
            console.log("Error is=============>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //=============================================get offer list========================================//

    getOfferList: async (req, res) => {

        try {
            console.log("Request for get offer list is============>", req.body);
            let options = {
                page: req.body.pageNumber || 1,
                limit: req.body.limit || 10,
                sort: { createdAt1: -1 },
                populate: 'makeOfferById'
            }
            let query = { $and: [{ realOrderId: req.body.orderId }] }
            if (req.body.startDate && req.body.endDate) {
                query.createdAt = { $gte: req.body.startDate, $lte: req.body.endDate }
            }
            if (req.body.search) {
                query.$and = [{
                    $or: [
                        { "orderNumber": { $regex: "^" + req.body.search, $options: 'i' } }
                    ]
                }]
            }
            let result = await MakeAOfferDeliveryPerson.paginate(query, options)
            console.log("Offer list found successfully", result);
            return res.send({ response_code: 200, response_message: "Offer list found successfully", Data: result })
        } catch (error) {
            console.log("Error is=============>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //=============================================delete offer list=====================================//

    deleteOffer: async (req, res) => {

        try {
            let query = { $and: [{ "_id": req.body.orderId }, { "makeOfferById": req.body.userId }] }
            let result1 = await MakeAOfferDeliveryPerson.findOne(query)
            if (!result1) {
                console.log("Order id is incorrect");
                return res.send({ response_code: 501, response_message: "Something went wrong" });
            }
            let result2 = await MakeAOfferDeliveryPerson.findByIdAndUpdate({ "_id": req.body.orderId }, { $set: { "status": 'Cancel' } }, { new: true })
            let result3 = await ServiceModel.findOneAndUpdate({ "_id": result2.realOrderId, "makeOfferByDeliveryPerson.makeOfferById": req.body.userId }, { $pull: { makeOfferByDeliveryPerson: { makeOfferById: req.body.userId } } }, { safe: true, new: true })
            res.send({ response_code: 200, response_message: "Offer deleted successfully", Data: result2 })
            let checkAdmin = await Admin.findOne({ "_id": req.body.adminId })
            if (!checkAdmin) {
                return;
            }
            if (checkAdmin.userType == 'Sub-Admin') {
                let actionObj = new ActionModel({
                    "userId": req.body.userId,
                    "action": "Offer deleetd by " + result2.name
                })
                await actionObj.save()
            }
        } catch (error) {
            console.log("Error is============>", error)
            return res.send({ response_code: 500, response_message: "Internal server error" })
        }
    },

    //==============================================accept offer=========================================//

    acceptOffer: (req, res) => {

        console.log("Request for accept offer is=========>", req.body);
        User.findOne({ '_id': req.body.userId }, (error7, result7) => {
            if (error7) {
                console.log("Error 7 is==========>", error7);
                return res.send({ response_code: 500, response_message: "Internal server error" });
            }
            else if (!result7) {
                console.log("Invalid Token");
                return res.send({ response_code: 501, response_message: "Something went wrong" });
            }
            else if (result7.status == 'INACTIVE') {
                console.log("Account disabled");
                res.send({ status: "FAILURE", response_message: "Your account have been disabled by administrator due to any suspicious activity" })
            }
            else {
                ServiceModel.findOne({ "_id": req.body.orderId }, (error, result) => {
                    if (error) {
                        console.log("Error is==========>", error);
                        return res.send({ response_code: 500, response_message: "Internal server error" });

                    }
                    else if (!result) {
                        console.log("Order Id is incorrect");
                        return res.send({ response_code: 501, response_message: "Something went wrong" });
                    }
                    else {
                        MakeAOfferDeliveryPerson.findOne({ "_id": req.body.offerId }, (error3, result3) => {
                            if (error3) {
                                console.log("Error 3 is=========>", req.body);
                                return res.send({ response_code: 500, response_message: "Internal server error" });

                            }
                            else if (!result3) {
                                console.log("Offer Id is incorrect");
                                return res.send({ response_code: 501, response_message: "Something went wrong" });
                            }
                            else {
                                ServiceModel.findOneAndUpdate({ "_id": req.body.orderId }, {
                                    $set: {
                                        offerAcceptedOfId: result3.makeOfferById,
                                        offerId: req.body.offerId,
                                        offerAcceptedStatus: true,
                                        status: 'Active',
                                        deliveryOffer: result3.deliveryOffer,
                                        tax: result3.tax,
                                        total: result3.total,
                                        roomId: result3.makeOfferById + req.body.userId
                                    }
                                }, { new: true }, (error4, result4) => {
                                    if (error4) {
                                        console.log("Error 4 is===========>", error4);
                                        return res.send({ response_code: 500, response_message: "Internal server error" });
                                    }
                                    else {
                                        MakeAOfferDeliveryPerson.findByIdAndUpdate({ "_id": req.body.offerId }, {
                                            $set: {
                                                offerAcceptedById: req.body.userId,
                                                offerAcceptedStatus: true,
                                                status: 'Active',
                                                roomId: result3.makeOfferById + req.body.userId
                                            }
                                        }, { new: true }, (error5, result5) => {
                                            if (error5) {
                                                console.log("Error 5 is===============>", error5);
                                                return res.send({ response_code: 500, response_message: "Internal server error" });
                                            }
                                            else {
                                                User.findOne({ "_id": result3.makeOfferById }, (error2, result2) => {
                                                    if (error2) {
                                                        console.log("Error 2 is=========>", error2);
                                                        return res.send({ response_code: 500, response_message: "Internal server error" });
                                                    }
                                                    else {
                                                        let notiObj = new Notification({
                                                            notiBy: req.body.userId,
                                                            notiTo: result3.makeOfferById,
                                                            notiTitle: "Order Accept Successfully",
                                                            notiTime: Date.now(),
                                                            notiMessage: "Hi, your order number " + result.orderNumber + "has been accepted by " + result.orderCreatedByName + "Please check your status and start the process."
                                                        })
                                                        notiObj.save((error6, result6) => {
                                                            if (error6) {
                                                                console.log("Error 6 is===========>", error6);
                                                                return res.send({ response_code: 500, response_message: "Internal server error" });
                                                            }
                                                            else {
                                                                let chatObj = new Chat({
                                                                    "senderId": result3.makeOfferById,
                                                                    "receiverId": req.body.userId,
                                                                    "message": "",
                                                                    "roomId": req.body.orderId + req.body.offerId
                                                                })
                                                                chatObj.save((error8, result8) => {
                                                                    if (error8) {
                                                                        console.log("Error 8 is===========>", error8);
                                                                        return res.send({ response_code: 500, response_message: "Internal server error" });
                                                                    }
                                                                    else {
                                                                        console.log("Notification data is=============>", result6);
                                                                        console.log("Chat data is============>", result8);
                                                                        console.log("Offer accepted successfully", result4);
                                                                        res.send({ response_code: 200, response_message: "Offer accepted successfully", Data: result4 });
                                                                        if (result7.deviceType == 'android') {
                                                                            func.sendNotificationForAndroid(result2.deviceToken, notiObj.notiTitle, notiObj.notiMessage, req.body.userId, notiObj, (error10, result10) => {
                                                                                if (error10) {
                                                                                    console.log("Error 10 is=========>", error10);
                                                                                }
                                                                                else {
                                                                                    console.log("Send notification is=============>", result10);
                                                                                }
                                                                            })
                                                                        }
                                                                        if (result7.deviceType == 'iOS') {
                                                                            func.sendiosNotification(result2.deviceToken, notiObj.notiTitle, notiObj.notiMessage, req.body.userId, notiObj, (error10, result10) => {
                                                                                if (error10) {
                                                                                    console.log("Error 10 is=========>", error10);
                                                                                }
                                                                                else {
                                                                                    console.log("Send notification is=============>", result10);
                                                                                }
                                                                            })
                                                                        }
                                                                    }
                                                                })
                                                            }
                                                        })
                                                    }
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })
    },

    //==============================================Order cancel=========================================//

    orderCancel: (req, res) => {

        console.log("Request for order cancel by normal user or delivery person is=============>", req.body);
        User.findOne({ "_id": req.body.userId }, (error, result) => {
            if (error) {
                console.log("Error is==========>", error);
                return res.send({ response_code: 500, response_message: "Internal server error" });
            }
            else if (!result) {
                console.log("Invalid user Id");
                return res.send({ response_code: 500, response_message: "Something went wrong" });
            }
            else {
                let query = { $and: [{ "_id": req.body.orderId }, { "userId": req.body.userId }] }
                ServiceModel.findOne(query, (error1, result1) => {
                    if (error1) {
                        console.log("Error 1 is==========>", error1);
                        return res.send({ response_code: 500, response_message: "Internal server error" });
                    }
                    else {
                        if (result1.status == 'Active') {
                            ServiceModel.findByIdAndUpdate({ "_id": req.body.orderId }, { $set: { status: 'Cancel' } }, { new: true }, (error2, result2) => {
                                if (error2) {
                                    console.log("Error 2 is=============>", error2);
                                    return res.send({ response_code: 500, response_message: "Internal server error" });
                                }
                                else {
                                    MakeAOfferDeliveryPerson.findByIdAndUpdate({ "_id": result2.offerId }, { $set: { status: 'Cancel' } }, { new: true }, (error6, result6) => {
                                        if (error6) {
                                            console.log("Error 6 is===========>", error6);
                                            return res.send({ response_code: 500, response_message: "Internal server error" });
                                        }
                                        else {

                                            User.findOne({ "_id": result2.offerAcceptedOfId }, (error8, result8) => {
                                                if (error8) {
                                                    console.log("Error 8 is===========>", error8);
                                                    return res.send({ response_code: 500, response_message: "Internal server error" });
                                                }
                                                else {
                                                    let notiObj = new Notification({
                                                        "notiTo": req.body.userId,
                                                        "notiTime": Date.now(),
                                                        "notiTitle": "Order Cancelled Successfully",
                                                        "notiMessage": "Hi, your order number " + result2.offerId + " has been cancelled by due to limition of offer."
                                                    })
                                                    notiObj.save((error7, result7) => {
                                                        if (error7) {
                                                            console.log("Error 4 is===========>", error7);
                                                            return res.send({ response_code: 500, response_message: "Internal server error" });

                                                        }
                                                        else {
                                                            console.log("Notification data is============>", result7);
                                                            console.log("Order canceled successfully", result2);
                                                            res.send({ response_code: 200, response_message: "Order canceled successfully" });
                                                            if (result.deviceType == 'android') {
                                                                func.sendNotificationForAndroid(result.deviceToken, "Order Cancelled Successfully", "Hi, your order number " + result2.offerId + " has been cancelled by " + result.name, notiObj, (error10, result10) => {
                                                                    if (error10) {
                                                                        console.log("Error 10 is=========>", error10);
                                                                    }
                                                                    else {
                                                                        console.log("Send notification is=============>", result10);
                                                                    }
                                                                })
                                                            }
                                                            if (result.deviceType == 'iOS') {
                                                                func.sendiosNotification(result.deviceToken, "Order Cancelled Successfully", "Hi, your order number " + result2.offerId + " has been cancelled by " + result.name, notiObj, (error10, result10) => {
                                                                    if (error10) {
                                                                        console.log("Error 10 is=========>", error10);
                                                                    }
                                                                    else {
                                                                        console.log("Send notification is=============>", result10);
                                                                    }
                                                                })
                                                            }
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                    })
                                }
                            })

                        }
                        else {
                            ServiceModel.findByIdAndUpdate({ "_id": req.body.orderId }, { $set: { status: 'Cancel', "orderCanelReason": req.body.orderCanelReason, "orderCancelMessage": req.body.orderCancelMessage } }, { new: true }, (error2, result2) => {
                                if (error2) {
                                    console.log("Error 2 is=============>", error2);
                                    return res.send({ response_code: 500, response_message: "Internal server error" });
                                }
                                else {
                                    console.log("Order canceled successfully", result2);
                                    res.send({ response_code: 200, response_message: "Order canceled successfully" });
                                    if (result.deviceType == 'android') {
                                        func.sendNotificationForAndroid(result.deviceToken, "Order Cancelled Successfully", "Hi, your order number " + result2.orderNumber + " has been cancelled by admin", (error10, result10) => {
                                            if (error10) {
                                                console.log("Error 10 is=========>", error10);
                                            }
                                            else {
                                                console.log("Send notification is=============>", result10);
                                            }
                                        })
                                    }
                                    if (result.deviceType == 'iOS') {
                                        func.sendiosNotification(result.deviceToken, "Order Cancelled Successfully", "Hi, your order number " + result2.orderNumber + " has been cancelled by admin", (error10, result10) => {
                                            if (error10) {
                                                console.log("Error 10 is=========>", error10);
                                            }
                                            else {
                                                console.log("Send notification is=============>", result10);
                                            }
                                        })
                                    }
                                }
                            })
                        }
                    }
                })
            }
        })

    },

    //=============================================Order delete===========================================//

    orderDelete: async (req, res) => {

        try {
            let result = await ServiceModel.findByIdAndUpdate({ "_id": req.body.orderId }, { $set: { deleteStatus: true } }, { new: true })
            if (!result) {
                console.log("order Id is not correct")
                return res.send({ response_code: 500, response_message: "Something went wrong" });
            }
            console.log("order deleted successfully", result)
            res.send({ response_code: 200, response_message: "Order deleted successfully", Data: result })
            let updateOffer = await MakeAOfferDeliveryPerson.update({ realOrderId: req.body.orderId }, { $set: { deleteStatus: true } }, { new: true, multi: true })
            console, log("Update offer is==========>", updateOffer)
        } catch (error) {
            console.log("Error is============>", error)
            return res.send({ response_code: 500, response_message: "Internal server error" })
        }
    },

    //===========================================cancel offer by worker===================================//

    cancelOrderByworker: (req, res) => {

        let query1 = { $and: [{ "_id": req.body.orderId }, { "makeOfferById": req.body.userId }] }
        MakeAOfferDeliveryPerson.findOne(query1, (error1, result1) => {
            if (error1) {
                console.log("Error 1 is==========>", error1);
                return res.send({ response_code: 500, response_message: "Internal server error" })

            }
            else if (!result1) {
                console.log("Order id is incorrect");
                return res.send({ response_code: 500, response_message: "Something went wrong" })
            }
            else {
                MakeAOfferDeliveryPerson.findByIdAndUpdate({ "_id": req.body.orderId }, { $set: { "status": 'Cancel', "orderCanelReason": req.body.orderCanelReason, "orderCancelMessage": req.body.orderCancelMessage } }, { new: true }, (error2, result2) => {
                    if (error2) {
                        console.log("Error 2 is=============>", error2);
                        return res.send({ response_code: 500, response_message: "Internal server error" })
                    }
                    else {
                        if (result1.status == 'Pending') {
                            ServiceModel.findOneAndUpdate({ "_id": result2.realOrderId, "makeOfferByDeliveryPerson.makeOfferById": req.body.userId }, { $pull: { makeOfferByDeliveryPerson: { makeOfferById: req.body.userId } } }, { safe: true, new: true }, (error3, result3) => {
                                if (error3) {
                                    console.log("Error is==========>", error3)
                                    return res.send({ response_code: 500, response_message: "Internal server error" })
                                }
                                else {
                                    User.findOne({ "_id": result2.orderOwner }, (error5, result5) => {
                                        if (error5) {
                                            console.log("Error 5 is=========>", error5);
                                            return res.send({ response_code: 500, response_message: "Internal server error" })
                                        }
                                        else {
                                            let notiObj = new Notification({
                                                "notiBy": req.body.userId,
                                                "notiTo": result2.orderOwner,
                                                "notiTitle": "Order Cancelled Notification",
                                                "notiTime": Date.now(),
                                                "notiMessage": "Hi, your order number " + result2.orderNumber + " has been cancelled by admin"
                                            })
                                            notiObj.save((error4, result4) => {
                                                if (error4) {
                                                    console.log("Error 4 is===========>", error4);
                                                    return res.send({ response_code: 500, response_message: "Internal server error" })

                                                }
                                                else {
                                                    console.log("Notification data is===========>", result4);
                                                    console.log("Order canceled successfully", result2);
                                                    console.log("Pull data is============>", result3);
                                                    res.send({ response_code: 200, response_message: "Order canceled successfully" });
                                                    if (result5.deviceType == 'android') {
                                                        func.sendNotificationForAndroid(result5.deviceToken, "Order Cancelled Notification", "Hi, your order number " + result2.orderNumber + " has been cancelled by " + result.name + " If you have not perform this action please contact with admin", (error10, result10) => {
                                                            if (error10) {
                                                                console.log("Error 10 is=========>", error10);
                                                            }
                                                            else {
                                                                console.log("Send notification is=============>", result10);
                                                            }
                                                        })
                                                    }
                                                    if (result5.deviceType == 'iOS') {
                                                        func.sendiosNotification(result5.deviceToken, "Order Cancelled Notification", "Hi, your order number " + result2.orderNumber + " has been cancelled by " + result.name + " If you have not perform this action please contact with admin", (error10, result10) => {
                                                            if (error10) {
                                                                console.log("Error 10 is=========>", error10);
                                                            }
                                                            else {
                                                                console.log("Send notification is=============>", result10);
                                                            }
                                                        })
                                                    }
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        }
                        else {
                            ServiceModel.findByIdAndUpdate({ "_id": result2.realOrderId }, { $set: { status: "Cancel" } }, { new: true }, (error3, result3) => {
                                if (error3) {
                                    console.log("Error is==========>", error3)
                                    return res.send({ response_code: 500, response_message: "Internal server error" })

                                }
                                else {
                                    User.findOne({ "_id": result2.orderOwner }, (error5, result5) => {
                                        if (error5) {
                                            console.log("Error 5 is=========>", error5);
                                            return res.send({ response_code: 500, response_message: "Internal server error" })
                                        }
                                        else {
                                            let notiObj = new Notification({
                                                "notiBy": req.body.userId,
                                                "notiTo": result2.orderOwner,
                                                "notiTitle": "Order Cancelled Notification",
                                                "notiTime": Date.now(),
                                                "notiMessage": "Hi, your order number " + result2.orderNumber + " has been cancelled by " + result.name + " If you have not perform this action please contact with admin"
                                            })
                                            notiObj.save((error4, result4) => {
                                                if (error4) {
                                                    console.log("Error 4 is===========>", error4);
                                                    return res.send({ response_code: 500, response_message: "Internal server error" })

                                                }
                                                else {
                                                    console.log("Notification data is===========>", result4);
                                                    console.log("Order canceled successfully", result2);
                                                    res.send({ response_code: 200, response_message: "Order canceled successfully" });
                                                    if (result5.deviceType == 'abdroid') {
                                                        func.sendNotificationForAndroid(result5.deviceToken, "Order Cancelled Notification", "Hi, your order number " + result2.orderNumber + " has been cancelled by " + result.name + " If you have not perform this action please contact with admin", (error10, result10) => {
                                                            if (error10) {
                                                                console.log("Error 10 is=========>", error10);
                                                            }
                                                            else {
                                                                console.log("Send notification is=============>", result10);
                                                            }
                                                        })
                                                    }
                                                    if (result5.deviceType == 'iOS') {
                                                        func.sendiosNotification(result5.deviceToken, "Order Cancelled Notification", "Hi, your order number " + result2.orderNumber + " has been cancelled by " + result.name + " If you have not perform this action please contact with admin", (error10, result10) => {
                                                            if (error10) {
                                                                console.log("Error 10 is=========>", error10);
                                                            }
                                                            else {
                                                                console.log("Send notification is=============>", result10);
                                                            }
                                                        })
                                                    }
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        }
                    }
                })
            }
        })
    },

    //===========================================Get chat history=========================================//

    getChatHistory: async (req, res) => {

        try {
            console.log("Request for get chat history is=================>", req.body);
            ChatHistory.aggregate([
                {
                    $match: {
                        "roomId": req.body.roomId,
                        "messageType": 'Text'
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "receiverId",
                        foreignField: "_id",
                        as: "receiverData"
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "senderId",
                        foreignField: "_id",
                        as: "senderData"
                    }
                },
                {
                    "$project": {
                        "_id": 1,
                        "time": 1,
                        "messageType": 1,
                        "media": 1,
                        "senderId": 1,
                        "receiverId": 1,
                        "message": 1,
                        "roomId": 1,
                        "createdAt": 1,
                        "updatedAt": 1,
                        "localTime": 1,
                        "receiverData.profilePic": 1,
                        "receiverData.name": 1,
                        "senderData.profilePic": 1,
                        "senderData.name": 1
                    }
                },
            ])
            console.log("Chat history found successfully", result);
            return res.send({ response_code: 200, response_message: "Chat history found successfully ", Data1: result })
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //============================================Create Excel===================================================//

    createExcel: (req, res) => {

        User.find({}, (error, result) => {
            if (error) {
                console.log("Error is==============>", error);
            }
            else {
                var fs = require('fs');
                var data = '';
                data = data + "Name" + '\t' + "Email" + '\t' + "Gender" + '\t' + "Dob" + '\t' + "Country Code" + '\t' + "Mobile Number" + '\t' + "Country" + '\t' + "App Language" + '\t' + "SpeakLanguage" +
                    '\t' + 'Online Status' + '\n';
                for (var i = 0; i < result.length; i++) {
                    data = data + result[i].name + '\t' + result[i].email + '\t' + result[i].gender + '\t' + result[i].dob + '\t' + result[i].countryCode + '\t' + result[i].mobileNumber + '\t' + result[i].country + '\t' + result[i].appLanguage + '\t' + result[i].speakLanguage +
                        '\t' + result[i].onlineStatus + '\n';
                }
                var fileName = Date.now() + '.xls';
                console.log("File name is===========>", fileName);
                fs.appendFile("./excel/" + fileName, data, (err) => {
                    if (err) {
                        console.log("Error is=========>", err)
                    }
                    else {
                        let link = `http://3.129.47.202:3000/api/v1/admin/getExcel/${fileName}`
                        console.log("Link is=========>", link)
                        Admin.findByIdAndUpdate({ "_id": req.body.adminId }, { $set: { userExcel: fileName } }, { new: true }, (error1, result1) => {
                            if (error1) {
                                console.log("Error 1 is===========>", error1);
                            }
                            else {
                                console.log("Admin data is==========>", result1);
                                console.log("Excel is==========>", "./excel/" + fileName)
                                return res.send({ response_code: 200, response_message: "Excel created", Data: link });
                            }
                        })
                    }
                })
            }
        })
    },

    //==============================================Get Excel==================================================//

    getExcel: async (req, res) => {

        try {
            var filePath = path.join(__dirname, '../excel/' + req.params.fileName);
            console.log("File path is===========>", filePath);
            res.writeHead(200, {
                'Content-Type': 'application/vnd.ms-excel',
            });
            var readStream = fileSystem.createReadStream(filePath);
            readStream.pipe(res);
        } catch (error) {
            console.log("Error is=============>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }

    },

    //=============================================Get notification list=======================================//

    getNotificationList: async (req, res) => {

        try {
            console.log("Request for get notification is==========>", req.body);
            let options = {
                page: req.body.pageNumber || 1,
                limit: req.body.limit || 10,
                sort: { createdAt: -1 },
                populate: 'notiTo'
            }

            let query = {}
            if (req.body.startDate && req.body.endDate) {
                query.createdAt = { $gte: req.body.startDate, $lte: req.body.endDate }
            }
            if (req.body.search) {
                query.$and = [{
                    $or: [
                        { "notiMessage": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "notiTitle": { $regex: "^" + req.body.search, $options: 'i' } },

                    ]
                }]
            }
            let result = await Notification.paginate(query, options)
            console.log("Notification list found successfully", result);
            return res.send({ response_code: 200, response_message: "Notification list found successfully", Data: result })
        } catch (error) {
            console.log("Error is=============>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //==============================================Delete notification========================================//

    deleteNotification: async (req, res) => {

        try {
            console.log("Request for delete notification===========>", req.body);
            let result = await Notification.findByIdAndRemove({ "_id": req.body.notificationId })
            if (!result) {
                console.log("Something went wrong");
                return res.send({ response_code: 501, response_message: "Something went wrong" });
            }
            console.log("Deleted", result);
            return res.send({ response_code: 200, response_message: "Deleted", Data: result });
        } catch (error) {
            console.log("Error is=========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //==============================================Send mail==================================================//

    sendMail: async (req, res) => {

        try {
            console.log("Request for send mail is============>", req.body);
            let result = await User.findOne({ "_id": req.body.userId })
            if (!result) {
                console.log("User id is incorrect");
                return res.send({ response_code: 501, response_message: "Something went wrong" });
            }
            res.send({ response_code: 200, response_message: "Mail sent successfully" });
            if (result.email) {
                func.sendHtmlEmail1(result.email, "Paginazul", req.body.message, (err__, succ__) => {
                    if (err__) {
                        console.log("Error is=======>", err__);

                    } else if (succ__) {
                        console.log("Mail send==========>", succ__);

                    }
                })
            }
        } catch (error) {
            console.log("Error is==========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //=================================================Send mail to subadmin==================================//

    sendMailToSubAdmin: async (req, res) => {

        try {
            console.log("Request for send mail is============>", req.body);
            let result = await Admin.findOne({ "_id": req.body.userId })
            if (!result) {
                console.log("Sub-admin id is incorrect");
                return res.send({ response_code: 501, response_message: "Something went wrong" });
            }
            res.send({ response_code: 200, response_message: "Mail sent successfully" });
            if (result.email) {
                func.sendHtmlEmail1(result.email, "Jokar", req.body.message, (err__, succ__) => {
                    if (err__) {
                        console.log("Error is=======>", err__);

                    } else if (succ__) {
                        console.log("Mail send==========>", succ__);

                    }
                })
            }
        } catch (error) {
            console.log("Error is==========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //==============================================Delete admin contact======================================//

    deleteAdminContact: async (req, res) => {

        try {
            console.log("Delete contact us is=========>",req.body);
            let result = await ContactModel.findByIdAndRemove({ "_id": req.body.contactUsId })
            if (!result) {
                console.log("Contact Id is incorrect");
                return res.send({ response_code: 501, response_message: "Something went wrong" });
            }
            let result2 = await Admin.findOne({ "_id": req.body.adminId })
            if (!result2) {
                onsole.log("Admin Id is incorrect");
                return res.send({ response_code: 501, response_message: "Something went wrong" });
            }
            if (result2.userType == 'Sub-Admin') {
                let actionObj = new ActionModel({
                    "userId": req.body.adminId,
                    "action": "Contact record deleted by " + result2.name
                })
                await actionObj.save()
            }
            console.log("Deleted successfully", result);
            return res.send({ response_code: 200, response_message: "Deleted successfully" });
        } catch (error) {
            console.log("Error is=========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //===============================================Send Web=================================================//

    sendWeb: (req, res) => {

        console.log("Request for web is===========>", req.body);
        const webpush = require('web-push');
        const publicVapidKey = "BKRO0aLn2a2dasDRRFTua5_fLXM5StatsTMt1nvtuKMyGOiH8GSu77vfHUFTU5V8LOrAY8AuDiOhdtGS4rZuZJo"
        const privateVapidKey = "Bqp_DCw8VaM0ZfhUSBuOBKVZjJAAn_SRPYD8Xypg02o";
        webpush.setVapidDetails('mailto:abhishekarya8055@gmail.com', publicVapidKey, privateVapidKey);
        const subscription = req.body;
        res.status(201).json({});
        const payload = JSON.stringify({ title: 'test' });

        console.log(subscription);

        webpush.sendNotification(subscription, payload).catch(error => {
            console.error(error.stack);
        });
    },

    //=============================================Update category status=====================================//

    updateCategoryStatus: async (req, res) => {

        console.log("Request for update user status===========>", req.body);
        if (!req.body.categoryId || !req.body.status) {
            return res.send({ response_code: 401, response_message: "Something went wrong" })
        }
        let updateStatus = await ServiceCategory.findByIdAndUpdate({ _id: req.body.categoryId }, { $set: { status: req.body.status } }, { new: true })
        if (!updateStatus) {
            console.log("User is incorrect");
            return res.send({ response_code: 500, response_message: "Something went wrong" })
        }
        return res.send({ response_code: 200, response_message: "Status changed successfully." })

    },

    //=============================================Update sub category status=================================//

    updateSubCategoryStatus: async (req, res) => {

        console.log("Request for update user status===========>", req.body);
        if (!req.body.subCategoryId || !req.body.status) {
            return res.send({ response_code: 401, response_message: "Something went wrong" })
        }
        let updateStatus = await ServiceSubCategory.findByIdAndUpdate({ _id: req.body.subCategoryId }, { $set: { status: req.body.status } }, { new: true })
        if (!updateStatus) {
            console.log("User is incorrect");
            return res.send({ response_code: 500, response_message: "Something went wrong" })
        }
        return res.send({ response_code: 200, response_message: "Status changed successfully." })

    },

    //==============================================Restaurant list===========================================//

    getRestaurantList: async (req, res) => {

        try {
            console.log("Request for get restaurant is==========>", req.body);
            let options = {
                page: req.body.pageNumber || 1,
                limit: req.body.limit || 10,
                sort: { createdAt: -1 },
            }

            let query = { storeType: 'Restaurant', deleteStatus: false }
            if (req.body.startDate && req.body.endDate) {
                query.createdAt = { $gte: req.body.startDate, $lte: req.body.endDate }
            }
            if (req.body.search) {
                query.$and = [{
                    $or: [
                        { "name": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "status": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "address": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "email": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "mobileNumber": { $regex: "^" + req.body.search, $options: 'i' } },

                    ]
                }]
            }
            let result = await Seller.paginate(query, options)
            console.log("Seller list found successfully", result);
            return res.send({ response_code: 200, response_message: "Seller list found successfully", Data: result })
        } catch (error) {
            console.log("Error is=============>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //=============================================Get store list============================================//

    getStoreList: async (req, res) => {

        try {
            console.log("Request for get restaurant is==========>", req.body);
            let options = {
                page: req.body.pageNumber || 1,
                limit: req.body.limit || 10,
                sort: { createdAt: -1 },
            }

            let query = { storeType: 'Grocery Store', deleteStatus: false }
            if (req.body.startDate && req.body.endDate) {
                query.createdAt = { $gte: req.body.startDate, $lte: req.body.endDate }
            }
            if (req.body.search) {
                query.$and = [{
                    $or: [
                        { "name": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "status": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "address": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "email": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "mobileNumber": { $regex: "^" + req.body.search, $options: 'i' } },

                    ]
                }]
            }
            let result = await Seller.paginate(query, options)
            console.log("Seller list found successfully", result);
            return res.send({ response_code: 200, response_message: "Seller list found successfully", Data: result })
        } catch (error) {
            console.log("Error is=============>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //=============================================Res and store detail======================================//

    getResAndStoreDetail: async (req, res) => {

        try {
            if (!req.body.resAndStoreId) {
                return res.send({ response_code: 401, response_message: "Something went wrong" })
            }
            let result = await Seller.findOne({ "_id": req.body.resAndStoreId }).lean()
            if (!result) {
                console.log("Res Id is not correct")
                return res.send({ response_code: 500, response_message: "Something went wrong" })
            }
            delete (result.password)
            console.log("Data found successfully", result)
            return res.send({ response_code: 200, response_message: "Data found successfully", Data: result })
        } catch (error) {
            console.log("Error is============>", error)
            return res.send({ response_code: 500, response_message: "Internal server error" })
        }
    },

    //=============================================Delete res and store======================================//

    deleteResAndStore: async (req, res) => {

        try {
            console.log("Request for delete res and store is============>", req.body);
            let deleteSeller = await Seller.findByIdAndUpdate({ _id: req.body.resAndStoreId }, { $set: { deleteStatus: true } }, { new: true })
            if (!deleteSeller) {
                console.log("Res Id is not correct")
                return res.send({ response_code: 500, response_message: "Something went wrong" })
            }
            console.log("Record deleted successfully", deleteSeller)
            return res.send({ response_code: 200, response_message: "Record deleted successfully" })
        } catch (error) {
            console.log("Error is============>", error)
            return res.send({ response_code: 500, response_message: "Internal server error" })
        }
    },

    //=============================================Update document status=====================================//

    updateSellerDocumentStatus: async (req, res) => {

        console.log("Request for update seller document status is==========>", req.body);
        try {
            let checkUser = await Seller.findOne({ _id: req.body.resAndStoreId })
            if (!checkUser) {
                console.log("Id is not correct");
                return res.send({ response_code: 501, response_message: "Something went wrong" });
            }

            let query = { adminVerifyStatus: req.body.adminVerifyStatus }
            let updateUser = await Seller.findByIdAndUpdate({ _id: req.body.resAndStoreId }, { $set: query }, { new: true })
            let notiTitle = "Request Approved"
            let newMes = "Welcome to Paginazul App"
            let message = `Hi ${checkUser.name}! your request for become a seller has been approved by admin now.`
            if (req.body.adminVerifyStatus == "Cancel") {
                notiTitle = 'Request Cancelled'
                message = 'Hi ${checkUser.name}! your request for become a seller has been cancelled by admin now.'
            }
            console.log("Status updated successfully", updateUser);
            res.send({ response_code: 200, response_message: "Status updated successfully" });
            func.sendHtmlEmail1(checkUser.email, notiTitle, message, newMes, (error10, result10) => {
                if (error10) {
                    console.log("Error 10 is=========>", error10);
                }
                else {
                    console.log("mail send is==========>", result10);
                }
            })

        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //==============================================Update seller status======================================//

    updateSellerStatus: async (req, res) => {

        try {
            console.log("Request for update seller status===========>", req.body);
            if (!req.body.resAndStoreId || !req.body.status) {
                return res.send({ response_code: 401, response_message: "Something went wrong" })
            }
            let updateStatus = await Seller.findByIdAndUpdate({ _id: req.body.resAndStoreId }, { $set: { status: req.body.status } }, { new: true })
            if (!updateStatus) {
                console.log("Id is incorrect");
                return res.send({ response_code: 500, response_message: "Something went wrong" })
            }
            console.log("Status updated successfully", updateStatus)
            return res.send({ response_code: 200, response_message: "Status updated successfully" })
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }


    },

    //==============================================Add cuisine==============================================//

    addCuisine: async (req, res) => {

        try {
            console.log("Request for add cuisine is===========>", req.body);
            let cuisineObj = new Cuisine({
                name: req.body.name
            })
            await cuisineObj.save()
            console.log("Cuisine added successfully")
            return res.send({ response_code: 200, response_message: "Cuisine added successfully" })
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //================================================Update cuisine=========================================//

    updateCuisine: async (req, res) => {

        try {
            console.log("Request for update cuisine is==============>", req.body);
            let obj = {
                name: req.body.name
            }
            let updateData = await Cuisine.findByIdAndUpdate({ _id: req.body.cuisineId }, { $set: obj }, { new: true })
            if (!updateData) {
                console.log("Id is incorrect");
                return res.send({ response_code: 500, response_message: "Something went wrong" })
            }
            console.log("Cuisine updated successfully")
            return res.send({ response_code: 200, response_message: "Cuisine updated successfully" })
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //===============================================Delete cuisine==========================================//

    deleteCuisine: async (req, res) => {

        try {
            console.log("Request for delete cuisine is==========>", req.body);
            let obj = {
                deleteStatus: true
            }
            let updateData = await Cuisine.findByIdAndUpdate({ _id: req.body.cuisineId }, { $set: obj }, { new: true })
            if (!updateData) {
                console.log("Id is incorrect");
                return res.send({ response_code: 500, response_message: "Something went wrong" })
            }
            console.log("Cuisine deleted successfully")
            return res.send({ response_code: 200, response_message: "Cuisine deleted successfully" })
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //==============================================Update status cuisine=====================================//

    updateStatusCuisine: async (req, res) => {

        try {
            console.log("Request for update status cuisine is==========>", req.body);
            let obj = {
                status: req.body.status
            }
            let updateData = await Cuisine.findByIdAndUpdate({ _id: req.body.cuisineId }, { $set: obj }, { new: true })
            if (!updateData) {
                console.log("Id is incorrect");
                return res.send({ response_code: 500, response_message: "Something went wrong" })
            }
            console.log("Cuisine status updated successfully")
            return res.send({ response_code: 200, response_message: "Cuisine status updated successfully" })
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //==============================================Get cuisine list==========================================//

    getCuisineList: async (req, res) => {

        try {
            console.log("Request for get cuisine is==========>", req.body);
            let options = {
                page: req.body.pageNumber || 1,
                limit: req.body.limit || 10,
                sort: { createdAt: -1 },
            }

            let query = { deleteStatus: false }
            if (req.body.startDate && req.body.endDate) {
                query.createdAt = { $gte: req.body.startDate, $lte: req.body.endDate }
            }
            if (req.body.search) {
                query.$and = [{
                    $or: [
                        { "name": { $regex: "^" + req.body.search, $options: 'i' } }
                    ]
                }]
            }
            let result = await Cuisine.paginate(query, options)
            console.log("Cuisine list found successfully", result);
            return res.send({ response_code: 200, response_message: "Cuisine list found successfully", Data: result })
        } catch (error) {
            console.log("Error is=============>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //===============================================Add product category====================================//

    addProductCategory: async (req, res) => {

        try {
            console.log("Request for add product category is===========>", req.body);
            let categoryImage = ""
            let image = await cloudinary.v2.uploader.upload(req.files.image.path, { resource_type: "image" })
            categoryImage = image.secure_url
            let categoryObj = new Productcategory({
                name: req.body.name,
                image: categoryImage
            })
            await categoryObj.save()
            console.log("Category added successfully")
            return res.send({ response_code: 200, response_message: "Category added successfully" })
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //===============================================Update product category=================================//

    updateProductCategory: async (req, res) => {

        try {
            console.log("Request for update product category is==============>", req.body);
            let checkCategory = await Productcategory.findOne({ _id:req.body.categoryId })
            if (!checkCategory) {
                console.log("Id is incorrect");
                return res.send({ response_code: 500, response_message: "Something went wrong" })
            }
            let categoryImage = checkCategory.image
            if(req.files.image){
                let image = await cloudinary.v2.uploader.upload(req.files.image.path, { resource_type: "image" })
                categoryImage = image.secure_url
            }
            
            let obj = {
                name: req.body.name,
                image: categoryImage
            }
            await Productcategory.findByIdAndUpdate({ _id: req.body.categoryId }, { $set: obj }, { new: true })
            console.log("Category updated successfully")
            return res.send({ response_code: 200, response_message: "Category updated successfully" })
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //==============================================Delete product category=================================//

    deleteProductCategory: async (req, res) => {

        try {
            console.log("Request for delete product category is==========>", req.body);
            let obj = {
                deleteStatus: true
            }
            let updateData = await Productcategory.findByIdAndUpdate({ _id: req.body.categoryId }, { $set: obj }, { new: true })
            if (!updateData) {
                console.log("Id is incorrect");
                return res.send({ response_code: 500, response_message: "Something went wrong" })
            }
            console.log("Category deleted successfully")
            return res.send({ response_code: 200, response_message: "Category deleted successfully" })
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //==============================================Update category status==================================//

    updateStatusProductCategory: async (req, res) => {

        try {
            console.log("Request for update status product category is==========>", req.body);
            let obj = {
                status: req.body.status
            }
            let updateData = await Productcategory.findByIdAndUpdate({ _id: req.body.categoryId }, { $set: obj }, { new: true })
            if (!updateData) {
                console.log("Id is incorrect");
                return res.send({ response_code: 500, response_message: "Something went wrong" })
            }
            console.log("Category status updated successfully")
            return res.send({ response_code: 200, response_message: "Category status updated successfully" })
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //============================================Product category list=====================================//

    getProductCategoryList: async (req, res) => {

        try {
            console.log("Request for get cuisine is==========>", req.body);
            let options = {
                page: req.body.pageNumber || 1,
                limit: req.body.limit || 10,
                sort: { createdAt: -1 },
            }

            let query = { deleteStatus: false }
            if (req.body.startDate && req.body.endDate) {
                query.createdAt = { $gte: req.body.startDate, $lte: req.body.endDate }
            }
            if (req.body.search) {
                query.$and = [{
                    $or: [
                        { "name": { $regex: "^" + req.body.search, $options: 'i' } }
                    ]
                }]
            }
            let result = await Productcategory.paginate(query, options)
            console.log("Category list found successfully", result);
            return res.send({ response_code: 200, response_message: "Category list found successfully", Data: result })
        } catch (error) {
            console.log("Error is=============>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //==========================================Add sub-category===========================================//

    addProductSubCategory: async (req, res) => {

        try {
            console.log("Request for add product category is===========>", req.body);
            let categoryImage = ""
            let image = await cloudinary.v2.uploader.upload(req.files.image.path, { resource_type: "image" })
            categoryImage = image.secure_url
            let categoryObj = new Productsubcategory({
                name: req.body.name,
                categoryId: req.body.categoryId,
                image: categoryImage
            })
            await categoryObj.save()
            console.log("Sub-Category added successfully")
            return res.send({ response_code: 200, response_message: "Sub-Category added successfully" })
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //==========================================Update sub-category========================================//

    updateProductSubCategory: async (req, res) => {

        try {
            console.log("Request for update product sub-category is==============>", req.body);
            let checkSubCategory = await Productsubcategory.findOne({ _id: req.body.subCategoryId })
            if (!checkSubCategory) {
                console.log("Id is incorrect");
                return res.send({ response_code: 500, response_message: "Something went wrong" })
            }
            let categoryImage = checkSubCategory.image
            if(req.files.image){
                let image = await cloudinary.v2.uploader.upload(req.files.image.path, { resource_type: "image" })
                categoryImage = image.secure_url
            }
            let obj = {
                name: req.body.name,
                image: categoryImage
            }
            let updateData = await Productsubcategory.findByIdAndUpdate({ _id: req.body.subcategoryId }, { $set: obj }, { new: true })
            if (!updateData) {
                console.log("Id is incorrect");
                return res.send({ response_code: 500, response_message: "Something went wrong" })
            }
            console.log("Sub-Category updated successfully")
            return res.send({ response_code: 200, response_message: "Sub-Category updated successfully" })
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //===========================================Delete sub-category=======================================//

    deleteProductSubCategory: async (req, res) => {

        try {
            console.log("Request for delete product subcategory is==========>", req.body);
            let obj = {
                deleteStatus: true
            }
            let updateData = await Productsubcategory.findByIdAndUpdate({ _id: req.body.subcategoryId }, { $set: obj }, { new: true })
            if (!updateData) {
                console.log("Id is incorrect");
                return res.send({ response_code: 500, response_message: "Something went wrong" })
            }
            console.log("Sub-Category deleted successfully")
            return res.send({ response_code: 200, response_message: "Sub-Category deleted successfully" })
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //===========================================Update status sub-category===============================//

    updateStatusProductSubCategory: async (req, res) => {

        try {
            console.log("Request for update status product subcategory is==========>", req.body);
            let obj = {
                status: req.body.status
            }
            let updateData = await Productsubcategory.findByIdAndUpdate({ _id: req.body.subcategoryId }, { $set: obj }, { new: true })
            if (!updateData) {
                console.log("Id is incorrect");
                return res.send({ response_code: 500, response_message: "Something went wrong" })
            }
            console.log("Sub-Category status updated successfully")
            return res.send({ response_code: 200, response_message: "Sub-Category status updated successfully" })
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //===========================================Get sub-category list===================================//

    getProductSubCategoryList: async (req, res) => {

        try {
            console.log("Request for get cuisine is==========>", req.body);
            let options = {
                page: req.body.pageNumber || 1,
                limit: req.body.limit || 10,
                sort: { createdAt: -1 },
            }

            let query = { deleteStatus: false, categoryId: req.body.categoryId }
            if (req.body.startDate && req.body.endDate) {
                query.createdAt = { $gte: req.body.startDate, $lte: req.body.endDate }
            }
            if (req.body.search) {
                query.$and = [{
                    $or: [
                        { "name": { $regex: "^" + req.body.search, $options: 'i' } }
                    ]
                }]
            }
            let result = await Productsubcategory.paginate(query, options)
            console.log("Ub-Category list found successfully", result);
            return res.send({ response_code: 200, response_message: "Sub-Category list found successfully", Data: result })
        } catch (error) {
            console.log("Error is=============>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //===========================================Add driver=============================================//

    addDriver: async (req, res) => {

        try {
            console.log("Request for add driver is===========>", req.body);
            console.log("Request for add driver is===========>", req.files);
            if (!req.body.mobileNumber || !req.body.countryCode || !req.body.name || !req.body.email || !req.body.appLanguage) {
                console.log("Field is missing");
                return res.send({ status: "FAILURE", response_message: "Something went wrong" });
            }
            let checkEmail = await Driver.findOne({ email: req.body.email })
            if (checkEmail) {
                console.log("Email already exist");
                return res.send({ status: "FAILURE", response_message: 'Email already exist' });
            }
            let query = { $and: [{ countryCode: req.body.countryCode }, { mobileNumber: req.body.mobileNumber }] }
            let checkMobileNumber = await Driver.findOne(query)
            if (checkMobileNumber) {
                console.log("Mobile Number already exist");
                return res.send({ status: "FAILURE", response_message: 'Mobile number already exist' });
            }
            var jwtToken = jwt.sign({ "email": req.body.email }, config.jwtSecretKey);
            var encryptedToken = cryptr.encrypt(jwtToken);
            console.log("Token is===========>", encryptedToken);
            let licenseImage = ''
            let image = ''
            let insuranceImage = ''
            let venueImage = []
            if (req.files.image) {
                let uploadedImage = await cloudinary.v2.uploader.upload(req.files.image.path, { resource_type: "image" })
                image = uploadedImage.secure_url
            }
            if (req.files.licenseImage) {
                let uploadedImage = await cloudinary.v2.uploader.upload(req.files.licenseImage.path, { resource_type: "image" })
                licenseImage = uploadedImage.secure_url
            }
            if (req.files.venueImage) {
                for (let i = 0; i < req.files.venueImage.length; i++) {
                    let uploadedImage = await cloudinary.v2.uploader.upload(req.files.venueImage[i].path, { resource_type: "image" })
                    venueImage.push({ image: uploadedImage.secure_url })
                }
            }
            if (req.files.insuranceImage) {
                let uploadedImage = await cloudinary.v2.uploader.upload(req.files.insuranceImage.path, { resource_type: "image" })
                insuranceImage = uploadedImage.secure_url
            }
            let signupObj = new User({
                "fullName": req.body.fullName,
                "userName": req.body.userName,
                "name": req.body.name,
                "email": req.body.email,
                "image": image,
                "countryCode": req.body.countryCode,
                "appLanguage": req.body.appLanguage,
                "mobileNumber": req.body.mobileNumber,
                "deviceType": req.body.deviceType,
                "deviceToken": req.body.deviceToken,
                "jwtToken": encryptedToken,
                "onlineStatus": "Online",
                licenseImage: licenseImage,
                insuranceImage: insuranceImage,
                venueImage: venueImage,
                vehicleType: req.body.vehicleType,
                brand: req.body.brand,
                vehicleNumber: req.body.vehicleNumber,
                licenseNumber: req.body.licenseNumber,
                insuranceNumber: req.body.insuranceNumber,
                latitude: '24.8055946517755',
                longitude: '46.6030529016949',
                adminVerifyStatus: "Approve",
                "location": { "type": "Point", "coordinates": [46.6030529016949, 24.8055946517755] }
            })
            let signupData = await signupObj.save()
            console.log("You have successfully signed up", signupData);
            return res.send({ status: "SUCCESS", response_message: "Driver added successfully", Data: signupData });
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: "Internal server error" });
        }
    },

    //=============================================Edit driver=========================================//

    driverEditProfile: async (req, res) => {

        try {
            console.log("Request for driver edit profile is===========>", req.body);
            console.log("Request for driver edit profile is===========>", req.files);
            let checkUser = await Driver.findOne({ "_id": req.body.driverId })
            if (!checkUser) {
                console.log("User Id is incorrect");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            let checkEmail = await Driver.findOne({ email: req.body.email })
            if (checkEmail) {
                console.log("Email already exist");
                return res.send({ status: "FAILURE", response_message: 'Email already exist' });
            }
            let licenseImage = checkUser.licenseImage
            let image = checkUser.image
            let insuranceImage = checkUser.insuranceImage
            if (req.files.image) {
                let uploadedImage = await cloudinary.v2.uploader.upload(req.files.image.path, { resource_type: "image" })
                image = uploadedImage.secure_url
            }
            if (req.files.licenseImage) {
                let uploadedImage = await cloudinary.v2.uploader.upload(req.files.licenseImage.path, { resource_type: "image" })
                licenseImage = uploadedImage.secure_url
            }
            if (req.files.venueImage) {
                for (let i = 0; i < req.files.venueImage.length; i++) {
                    let uploadedImage = await cloudinary.v2.uploader.upload(req.files.venueImage[i].path, { resource_type: "image" })
                    let imageA = [{
                        image: uploadedImage.secure_url
                    }]
                    await Driver.findByIdAndUpdate({ _id: req.body.driverId }, { $push: { venueImage: imageA } }, { new: true })
                }
            }
            if (req.files.insuranceImage) {
                let uploadedImage = await cloudinary.v2.uploader.upload(req.files.insuranceImage.path, { resource_type: "image" })
                insuranceImage = uploadedImage.secure_url
            }
            let signupObj = {
                "fullName": req.body.fullName,
                "userName": req.body.userName,
                "name": req.body.name,
                "email": req.body.email,
                "image": image,
                "appLanguage": req.body.appLanguage,
                licenseImage: licenseImage,
                insuranceImage: insuranceImage,
                vehicleType: req.body.vehicleType,
                brand: req.body.brand,
                vehicleNumber: req.body.vehicleNumber,
                licenseNumber: req.body.licenseNumber,
                insuranceNumber: req.body.insuranceNumber,
            }
            let signupData = await Driver.findByIdAndUpdate({ _id: req.body.driverId }, { $set: signupObj }, { new: true })
            console.log("Profile updated successfully", signupData);
            return res.send({ status: "SUCCESS", response_message: "Profile updated successfully", Data: signupData });
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: "Internal server error" });
        }
    },

    //=============================================Update driver document status========================//

    updateDriverDocumentStatus: async (req, res) => {

        console.log("Request for update seller document status is==========>", req.body);
        try {
            let checkUser = await Driver.findOne({ _id: req.body.driverId })
            if (!checkUser) {
                console.log("Id is not correct");
                return res.send({ response_code: 501, response_message: "Something went wrong" });
            }
            let query = { adminVerifyStatus: req.body.adminVerifyStatus }
            let updateUser = await Driver.findByIdAndUpdate({ _id: req.body.driverId }, { $set: query }, { new: true })
            let notiTitle = "Request Approved"
            let newMes = "Welcome to Paginazul App"
            let message = `Hi ${checkUser.name}! your request for become a seller has been approved by admin now.`
            if (req.body.adminVerifyStatus == "Cancel") {
                notiTitle = 'Request Cancelled'
                message = 'Hi ${checkUser.name}! your request for become a seller has been cancelled by admin now.'
            }
            console.log("Status updated successfully", updateUser);
            res.send({ response_code: 200, response_message: "Status updated successfully" });
            func.sendHtmlEmail1(checkUser.email, notiTitle, message, newMes, (error10, result10) => {
                if (error10) {
                    console.log("Error 10 is=========>", error10);
                }
                else {
                    console.log("mail send is==========>", result10);
                }
            })

        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //============================================Delete driver========================================//

    deleteDriver: async (req, res) => {

        try {
            console.log("Request for delete driver is==========>", req.body);
            let obj = {
                deleteStatus: true
            }
            let updateData = await Driver.findByIdAndUpdate({ _id: req.body.driverId }, { $set: obj }, { new: true })
            if (!updateData) {
                console.log("Id is incorrect");
                return res.send({ response_code: 500, response_message: "Something went wrong" })
            }
            console.log("Driver deleted successfully")
            return res.send({ response_code: 200, response_message: "Driver deleted successfully" })
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //============================================Update driver status=================================//

    updateStatusDriver: async (req, res) => {

        try {
            console.log("Request for update status driver is==========>", req.body);
            let obj = {
                status: req.body.status
            }
            let updateData = await Driver.findByIdAndUpdate({ _id: req.body.driverId }, { $set: obj }, { new: true })
            if (!updateData) {
                console.log("Id is incorrect");
                return res.send({ response_code: 500, response_message: "Something went wrong" })
            }
            console.log("Driver status updated successfully")
            return res.send({ response_code: 200, response_message: "Driver status updated successfully" })
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //=============================================Driver list=========================================//

    getDriverList: async (req, res) => {

        try {
            console.log("Request for get cuisine is==========>", req.body);
            let options = {
                page: req.body.pageNumber || 1,
                limit: req.body.limit || 10,
                sort: { createdAt: -1 },
            }

            let query = { deleteStatus: false }
            if (req.body.startDate && req.body.endDate) {
                query.createdAt = { $gte: req.body.startDate, $lte: req.body.endDate }
            }
            if (req.body.search) {
                query.$and = [{
                    $or: [
                        { "name": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "address": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "email": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "mobileNumber": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "vehicleType": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "brand": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "vehicleNumber": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "licenseNumber": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "insuranceNumber": { $regex: "^" + req.body.search, $options: 'i' } },
                    ]
                }]
            }
            let result = await Driver.paginate(query, options)
            console.log("Driver list found successfully", result);
            return res.send({ response_code: 200, response_message: "Driver list found successfully", Data: result })
        } catch (error) {
            console.log("Error is=============>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //=============================================Driver detail======================================//

    getDriverDetail: async (req, res) => {

        try {
            if (!req.body.driverId) {
                return res.send({ response_code: 401, response_message: "Something went wrong" })
            }
            let result = await Driver.findOne({ "_id": req.body.driverId }).lean()
            if (!result) {
                console.log("User Id is not correct")
                return res.send({ response_code: 500, response_message: "Something went wrong" })
            }
            delete (result.password)
            console.log("User data found successfully", result)
            return res.send({ response_code: 200, response_message: "User data found successfully", Data: result })
        } catch (error) {
            console.log("Error is============>", error)
            return res.send({ response_code: 500, response_message: "Internal server error" })
        }
    },

    //============================================Add commission======================================//

    addCommission: async (req, res) => {

        try {
            console.log("Request for add product category is===========>", req.body);
           
            let commissionObj = new Commission({
                resAndStoreId: req.body.resAndStoreId,
                deliveryCharge: req.body.deliveryCharge,
                commission: req.body.commission,
            })
            await commissionObj.save()
            console.log("Commission added successfully")
            return res.send({ response_code: 200, response_message: "Commission added successfully" })
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //===========================================Update commison======================================//

    updateCommission: async (req, res) => {

        try {
            console.log("Request for add product category is===========>", req.body);
           
            let commissionObj ={
                deliveryCharge: req.body.deliveryCharge,
                commission: req.body.commission,
            }
            let updateCommission=await Commission.findByIdAndUpdate({_id:req.body.commissionId},{$set:commissionObj},{new:true})
            if(!updateCommission){
                console.log("Id is incorrect");
                return res.send({ response_code: 500, response_message: "Something went wrong" })
            }
            console.log("Commission updated successfully")
            return res.send({ response_code: 200, response_message: "Commission updated successfully" })
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //=============================================Delete commission=================================//

    deleteCommission: async (req, res) => {

        try {
            console.log("Request for delete commission is==========>", req.body);
            let updateData = await Commission.findByIdAndRemove({ _id: req.body.commissionId })
            if (!updateData) {
                console.log("Id is incorrect");
                return res.send({ response_code: 500, response_message: "Something went wrong" })
            }
            console.log("Commission deleted successfully")
            return res.send({ response_code: 200, response_message: "Commission deleted successfully" })
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //==============================================Get commission list===============================//

    getCommissinList: async (req, res) => {

        try {
            console.log("Request for get cuisine is==========>", req.body);
            let options = {
                page: req.body.pageNumber || 1,
                limit: req.body.limit || 10,
                sort: { createdAt: -1 },
                populate:{path:'resAndStoreId',select:'name image'}
            }

            let query = { }
            if (req.body.startDate && req.body.endDate) {
                query.createdAt = { $gte: req.body.startDate, $lte: req.body.endDate }
            }
            if (req.body.search) {
                query.$and = [{
                    $or: [
                        { "commission": { $regex: "^" + Number(req.body.search), $options: 'i' } },
                        { "deliveryCharge": { $regex: "^" + Number(req.body.search), $options: 'i' } }
                    ]
                }]
            }
            let result = await Commission.paginate(query, options)
            console.log("Commission list found successfully", result);
            return res.send({ response_code: 200, response_message: "Commission list found successfully", Data: result })
        } catch (error) {
            console.log("Error is=============>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //==============================================Get seller list==================================//

    getSellerList: async (req, res) => {

        try {
            console.log("Request for get seller is==========>", req.body);
            let query={
                $and:[{adminVerifyStatus:'Approve'},{status:'Active'},{deleteStatus:false}]
            }
            let result = await Seller.find(query)
            console.log("Seller list found successfully", result);
            return res.send({ response_code: 200, response_message: "Seller list found successfully", Data: result })
        } catch (error) {
            console.log("Error is=============>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //===============================================Product order list===============================//


    getProductOrderList: async (req, res) => {

        try {
            console.log("Request for get order list is==========>", req.body);
            let options = {
                page: req.body.pageNumber || 1,
                limit: req.body.limit || 10,
                sort: { createdAt: -1 },
                populate: [{ path: 'userId', select: 'name profilePic email countryCode mobileNumber' },{path:'resAndStoreId',select:'name image email mobileNumber'}]
            }
            let query = {}
            if (req.body.search) {
                query.$and = [{
                    $or: [
                        { "quantity": { $regex: "^" + Number(req.body.search), $options: 'i' } },
                        { "status": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "orderNumber": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "totalPrice": { $regex: "^" + Number(req.body.search), $options: 'i' } },
                        { "address": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "landmark": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "buildingAndApart": { $regex: "^" + req.body.search, $options: 'i' } },

                    ]
                }]
            }
            let result = await Orderproduct.paginate(query, options)
            console.log("Order list found successfully", result);
            return res.send({ response_code: 200, response_message: "Order list found successfully", Data: result })
        } catch (error) {
            console.log("Error is=============>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //=============================================Product order detail==============================//

    productOrderDetail: async (req, res) => {

        try {
            console.log("Request for order detail is============>", req.body);
            let orderDetail = await Orderproduct.findOne({ _id: req.body.orderId })
            if (!orderDetail) {
                console.log("Invalid order Id");
                return res.send({ response_code: 500, response_message: "Invalid Token" });
            }
            let checkUser = await User.findOne({ _id: orderDetail.userId }).select('name email mobileNumber')
            let driverDetail = {}
            if (orderDetail.driverAssign == true) {
                driverDetail = await Driver.findOne({ _id: orderDetail.driverId }).select('name email mobileNumber')
            }
            let proudctDetail = await Product.findOne({ _id: orderDetail.productId })
            let sellerDetail = await Seller.findOne({ _id: orderDetail.resAndStoreId })
            let productList = []
            if (orderDetail.orderType == "Store") {
                for (let i = 0; i < orderDetail.orderData.length; i++) {
                    let productData = await Product.findOne({ _id: orderDetail.orderData[i].productId })
                    let objPro = {
                        name: productData.productName,
                        productImage: productData.productImage,
                        quantity: orderDetail.orderData[i].quantity
                    }
                    productList.push(objPro)
                }
            }
            let obj = {
                orderDetail: orderDetail,
                productList: productList,
                checkUser: checkUser,
                driverDetail: driverDetail,
                proudctDetail: proudctDetail,
                sellerDetail:sellerDetail

            }
            console.log("Order detail found successfully", obj);
            return res.send({ response_code: 200, response_message: "Order detail found successfully",Data:obj });
        } catch (error) {
            console.log("Error is============>", error)
            return res.send({ response_code: 500, response_message: "Internal server error" })
        }
    },

    //=============================================Main service list=================================//


    getMainServiceList: async (req, res) => {

        try {
            console.log("Request for get main service list is==========>", req.body);
            let options = {
                page: req.body.pageNumber || 1,
                limit: req.body.limit || 10,
                sort: { createdAt: -1 },
            }
            let query = {}
            if (req.body.search) {
                query.$and = [{
                    $or: [
                        { "englishName": { $regex: "^" + req.body.search, $options: 'i' } }
                    ]
                }]
            }
            let result = await Mainservice.paginate(query, options)
            console.log("Service list found successfully", result);
            return res.send({ response_code: 200, response_message: "Service list found successfully", Data: result })
        } catch (error) {
            console.log("Error is=============>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //=============================================Delete main service===============================//

    deleteMainService: async (req, res) => {

        try {
            console.log("Request for delete main service is==========>", req.body);
            let updateData = await Mainservice.findByIdAndRemove({ _id: req.body.serviceId })
            if (!updateData) {
                console.log("Id is incorrect");
                return res.send({ response_code: 500, response_message: "Something went wrong" })
            }
            console.log("Service deleted successfully")
            return res.send({ response_code: 200, response_message: "Service deleted successfully" })
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //=============================================Update service status===============================//

    updateStatusMainService: async (req, res) => {

        try {
            console.log("Request for update status main service is==========>", req.body);
            let obj = {
                status: req.body.status
            }
            let updateData = await Mainservice.findByIdAndUpdate({ _id: req.body.serviceId }, { $set: obj }, { new: true })
            if (!updateData) {
                console.log("Id is incorrect");
                return res.send({ response_code: 500, response_message: "Something went wrong" })
            }
            console.log("Service status updated successfully")
            return res.send({ response_code: 200, response_message: "Service status updated successfully" })
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //==============================================Update main service================================//

    updateMainService: async (req, res) => {

        try {
            console.log("Request for update main service is==============>", req.body);
            let checkService = await Mainservice.findOne({ _id: req.body.serviceId })
            if (!checkService) {
                console.log("Id is incorrect");
                return res.send({ response_code: 500, response_message: "Something went wrong" })
            }
            let imageUrl = checkService.image
            if(req.files.image){
                let image = await cloudinary.v2.uploader.upload(req.files.image.path, { resource_type: "image" })
                imageUrl = image.secure_url
            }
           
            let obj = {
                englishName: req.body.englishName,
                image: imageUrl
            }
            let updateData = await Mainservice.findByIdAndUpdate({ _id: req.body.serviceId }, { $set: obj }, { new: true })
            if (!updateData) {
                console.log("Id is incorrect");
                return res.send({ response_code: 500, response_message: "Something went wrong" })
            }
            console.log("Service updated successfully")
            return res.send({ response_code: 200, response_message: "Service updated successfully" })
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //=============================================Get home banner list================================//

    getHomeBannerList: async (req, res) => {

        try {
            console.log("Request for get home banner list is==========>", req.body);
            let options = {
                page: req.body.pageNumber || 1,
                limit: req.body.limit || 10,
                sort: { createdAt: -1 },
            }
            let query = {}
            let result = await Homebanner.paginate(query, options)
            console.log("Bnner list found successfully", result);
            return res.send({ response_code: 200, response_message: "Bnner list found successfully", Data: result })
        } catch (error) {
            console.log("Error is=============>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //==============================================Update home banner=================================//

    updateHomeBanner: async (req, res) => {

        try {
            console.log("Request for update home banner is==============>", req.body);
            let checkBanner = await Homebanner.findOne({ _id: req.body.bannerId })
            if (!checkBanner) {
                console.log("Id is incorrect");
                return res.send({ response_code: 500, response_message: "Something went wrong" })
            }
            let imageUrl = checkBanner.image
            if(req.files.image){
                let image = await cloudinary.v2.uploader.upload(req.files.image.path, { resource_type: "image" })
                imageUrl = image.secure_url
            }
            let obj = {
                image: imageUrl
            }
            let updateData = await Homebanner.findByIdAndUpdate({ _id: req.body.bannerId }, { $set: obj }, { new: true })
            if (!updateData) {
                console.log("Id is incorrect");
                return res.send({ response_code: 500, response_message: "Something went wrong" })
            }
            console.log("Banner updated successfully")
            return res.send({ response_code: 200, response_message: "Banner updated successfully" })
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //===============================================Add banner offer==================================//

    addBannerOffer: async (req, res) => {

        try {
            console.log("Request for add banner offer is===========>", req.body);
            let bannerImage = ""
            if(req.files.image){
                let image = await cloudinary.v2.uploader.upload(req.files.image.path, { resource_type: "image" })
                bannerImage = image.secure_url
            }
            let offerObj = new Banneroffer({
                image: bannerImage
            })
            await offerObj.save()
            console.log("Offer added successfully")
            return res.send({ response_code: 200, response_message: "Offer added successfully" })
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //===============================================Get banner offer==================================//

    getBannerOfferList: async (req, res) => {

        try {
            console.log("Request for get banner offer list is==========>", req.body);
            let options = {
                page: req.body.pageNumber || 1,
                limit: req.body.limit || 10,
                sort: { createdAt: -1 },
            }
            let query = {}
            let result = await Banneroffer.paginate(query, options)
            console.log("Bnner offer list found successfully", result);
            return res.send({ response_code: 200, response_message: "Bnner offer list found successfully", Data: result })
        } catch (error) {
            console.log("Error is=============>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //===============================================Update banner offer status=======================//

    updateStatusBannerOffer: async (req, res) => {

        try {
            console.log("Request for update status banner offer is==========>", req.body);
            let obj = {
                status: req.body.status
            }
            let updateData = await Banneroffer.findByIdAndUpdate({ _id: req.body.offerId }, { $set: obj }, { new: true })
            if (!updateData) {
                console.log("Id is incorrect");
                return res.send({ response_code: 500, response_message: "Something went wrong" })
            }
            console.log("Offer status updated successfully")
            return res.send({ response_code: 200, response_message: "Offer status updated successfully" })
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //===============================================Delete banner offer==============================//

    deleteBannerOffer: async (req, res) => {

        try {
            console.log("Request for delete banner offer is==========>", req.body);
            let updateData = await Banneroffer.findByIdAndRemove({ _id: req.body.offerId })
            if (!updateData) {
                console.log("Id is incorrect");
                return res.send({ response_code: 500, response_message: "Something went wrong" })
            }
            console.log("Offer deleted successfully")
            return res.send({ response_code: 200, response_message: "Offer deleted successfully" })
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //==============================================Update banner offer===============================//

    updateBannerOffer: async (req, res) => {

        try {
            console.log("Request for update banner offer is==============>", req.body);
            let checkBanner = await Banneroffer.findOne({ _id: req.body.offerId })
            if (!checkBanner) {
                console.log("Id is incorrect");
                return res.send({ response_code: 500, response_message: "Something went wrong" })
            }
            let imageUrl = checkBanner.image
            if(req.fields.image){
                let image = await cloudinary.v2.uploader.upload(req.files.image.path, { resource_type: "image" })
                imageUrl = image.secure_url
            }
            
            let obj = {
                image: imageUrl
            }
            let updateData = await Banneroffer.findByIdAndUpdate({ _id: req.body.offerId }, { $set: obj }, { new: true })
            if (!updateData) {
                console.log("Id is incorrect");
                return res.send({ response_code: 500, response_message: "Something went wrong" })
            }
            console.log("Offer updated successfully")
            return res.send({ response_code: 200, response_message: "Offer updated successfully" })
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },


}
