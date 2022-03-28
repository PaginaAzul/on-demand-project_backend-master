const User = require('../models/userModel.js');
const StaticModel = require('../models/staticModel.js');
const ServiceModel = require('../models/serviceModel.js');
const ContactModel = require('../models/contactUsModel.js');
const RatingModel = require('../models/ratingModel.js');
const ServiceCategory = require('../models/serviceCatModel.js');
const ServiceSubCategory = require('../models/serviceSubCatModel.js');
const ServiceSubSubCategory = require('../models/serviceSubSubCatModel.js');
const MakeAOfferDeliveryPerson = require('../models/makeAOfferDeliveryPerson.js');
const Notification = require('../models/notificationModel.js');
const OrderRating = require('../models/orderRatingModel.js');
const ReportReasonModel = require('../models/reportReasonModel.js');
const Tracking = require('../models/trackingModel.js');
const Report = require('../models/reportModel.js');
const i18n_module = require("i18n-nodejs");
const func = require('../controllers/function.js');
const Cryptr = require('cryptr');
const cryptr = new Cryptr('abhishekarya8055');
const { ObjectId } = require('mongodb');
const geodist = require('geodist');
const jwt = require('jsonwebtoken');
const config = require("../config/config");
const figures = require('figures');
const right1 = figures.tick;
const cross1 = figures.cross;
const warning = figures.warning;
const cloudinary = require('cloudinary');
const Admin = require('../models/adminModel.js');
const pdf = require('html-pdf');
const shortUrl = require('node-url-shortener');
const ChatHistory = require('../models/chatHistoryModel.js');
const urlMetadata = require('url-metadata');
cloudinary.config({
    cloud_name: 'boss8055',
    api_key: '586377977311428',
    api_secret: 'uvX8_Mjf2QoArR-HxkeaHgyu-AQ'
});
const configs = {
    "lang": ['en', 'ar'],
    "langFile": "./../../helper/language.json"
}


module.exports = {

    //* Api name-User signup
    //* Feautres-1.Multipart Form Data (Request),2.Profie is uploading on cloudinary,3.Url shortner used for short cloudinary url,4.Jwt token is generated for authuntication with encrypt form
    //* Request-langCode,email,mobileNumber,name,gender,dob,appLanguage,speakLanguage,countryCode,fullName,userName,profilePic,deviceToken,deviceType,location(Default)
    //* Description-This api is used for user signup.

    //=========================================User Sign Up===============================================//


    signup: async (req, res) => {

        try {
            console.log("Request for signup is============>", req.body);
            console.log("Files is==========>", req.files);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            if (!req.body.mobileNumber || !req.body.countryCode || !req.body.name || !req.body.email || !req.body.speakLanguage || !req.body.appLanguage) {
                console.log("Field is missing");
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });
            }
            let checkEmail = await User.findOne({ email: req.body.email })
            if (checkEmail) {
                console.log("Email already exist");
                return res.send({ status: "FAILURE", response_message: i18n.__('Email already exist') });
            }
            let query = { $and: [{ countryCode: req.body.countryCode }, { mobileNumber: req.body.mobileNumber }] }
            let checkMobileNumber = await User.findOne(query)
            if (checkMobileNumber) {
                console.log("Mobile Number already exist");
                return res.send({ status: "FAILURE", response_message: i18n.__('Mobile number already exist') });
            }
            var jwtToken = jwt.sign({ "email": req.body.email }, config.jwtSecretKey);
            var encryptedToken = cryptr.encrypt(jwtToken);
            console.log("Token is===========>", encryptedToken);
            let profilePic = ''
            if (req.files.profilePic) {
                let uploadedImage = await cloudinary.v2.uploader.upload(req.files.profilePic.path, { resource_type: "image" })
                profilePic = uploadedImage.secure_url
            }
            let signupObj = new User({
                "fullName": req.body.fullName,
                "userName": req.body.userName,
                "name": req.body.name,
                "dob": req.body.dob,
                "country": req.body.country,
                "email": req.body.email,
                "profilePic": profilePic,
                "countryCode": req.body.countryCode,
                "appLanguage": req.body.appLanguage,
                "speakLanguage": req.body.speakLanguage,
                "mobileNumber": req.body.mobileNumber,
                "deviceType": req.body.deviceType,
                "deviceToken": req.body.deviceToken,
                "jwtToken": encryptedToken,
                "onlineStatus": "Online",
                "signupWithNormalPerson": "true",
                "location": { "type": "Point", "coordinates": [46.6030529016949, 24.8055946517755] }
            })
            let signupData = await signupObj.save()

            let notiTitle = ''
            let notiMessage = ''
            if (req.body.appLanguage == "English") {
                notiTitle = `Welcome ${req.body.name}`
                notiMessage = `Thanks for signing up ${req.body.name}! Check your dashboard for creating order.`
            }
            if (req.body.appLanguage == "Portuguese") {
                notiTitle = `Bem-vinda ${req.body.name}`
                notiMessage = `Obrigado por registra-se ${req.body.name} ! Verifique seu painel para criar pedidos`
            }
            let notiObj = new Notification({
                notiTo: signupData._id,
                notiTitle: notiTitle,
                notiMessage: notiMessage,
                notificationType: `noNeedToRedirect`
            })
            await notiObj.save()
            console.log("You have successfully signed up", signupData);
            return res.send({ status: "SUCCESS", response_message: i18n.__("You have successfully signed up"), Data: signupData });
        } catch (error) {
            console.log("Error is==========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__('Internal server error') });
        }
    },

    //* Api name-User signin
    //* Features-1.Encrupted jwt token is generated,2.Country code and mobile number is mandatory
    //* Request-langCode,countryCode,mobileNumber,deviceType(optional) and deviceToken(optional)
    //* Description-This api is used for user signin.

    //==============================================User signin===========================================//


    signin: async (req, res) => {

        try {
            console.log("Request for signin is===========>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            if (!req.body.mobileNumber || !req.body.countryCode) {
                console.log("Mobile number is missing");
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });
            }
            let query = { $and: [{ "countryCode": req.body.countryCode }, { "mobileNumber": req.body.mobileNumber }] }
            let result = await User.findOne(query)
            if (!result) {
                console.log("Mobile number is not registered");
                return res.send({ status: "FAILURE", response_message: i18n.__("Mobile number is not registered") });
            }
            if (result.status == 'INACTIVE') {
                console.log("Account disabled");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") + warning });
            }
            let jwtToken = jwt.sign({ "countryCode": req.body.countryCode }, config.jwtSecretKey);
            console.log("Token is===========>", jwtToken);
            const encryptedToken = cryptr.encrypt(jwtToken);
            if (req.body.deviceType && req.body.deviceToken) {
                let result1 = await User.findByIdAndUpdate({ "_id": result._id }, { $set: { "jwtToken": encryptedToken, "onlineStatus": "Online", "deviceType": req.body.deviceType, "deviceToken": req.body.deviceToken } }, { new: true })
                console.log("Signin successfully", result1)
                return res.send({ status: "SUCCESS", response_message: i18n.__("Signin successfully"), response: result1 })
            }
            let result1 = await User.findByIdAndUpdate({ "_id": result._id }, { $set: { "jwtToken": encryptedToken, "onlineStatus": "Online" } }, { new: true })
            console.log("Signin successfully", result1)
            return res.send({ status: "SUCCESS", response_message: i18n.__("Signin successfully"), response: result1 })
        } catch (error) {
            console.log("Error is=========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //* Api name-mobileNumberChange
    //* Features-1.Encrypted jwt token and userId is required,2.Country code and mobile number is also mandatory,3.Block & Unblocked status check
    //* Request-langCode,countryCode,mobileNumber,userId,token(In headers)
    //* Description- This api is used for update mobile number from my profile section in app.

    //============================================mobileNumberChange===================================//


    mobileNumberChange: async (req, res) => {

        try {
            console.log("Request for mobile number is===========>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            if (!req.body.mobileNumber || !req.body.userId || !req.body.countryCode) {
                console.log("All fields are required")
                return res.send({ status: "FAILURE", response_message: i18n.__("Country code & mobile number is required") })
            }
            let query = { $and: [{ "_id": req.body.userId }, { "jwtToken": req.headers.token }] }
            let checkUser = await User.findOne(query)
            if (!checkUser) {
                console.log("User Id is not correct")
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            else if (checkUser.status == 'INACTIVE') {
                console.log("Your account has been disabled by admin");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") + warning });
            }
            let checkMobileNumber = await User.findOne({ "mobileNumber": req.body.mobileNumber })
            if (checkMobileNumber) {
                console.log("Mobile number already exist")
                return res.send({ status: "FAILURE", response_message: i18n.__("Mobile number already exist") });
            }
            let updateNumber = await User.findByIdAndUpdate({ _id: req.body.userId }, { $set: { mobileNumber: req.body.mobileNumber } }, { new: true })
            console.log("Mobile number updated successfully", updateNumber)
            return res.send({ status: "SUCCESS", response_message: i18n.__("Mobile number updated successfully"), response: updateNumber })
        } catch (error) {
            console.log("Error is=========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //* Api name-logout
    //* Features-1.Jwt token will null and online status change ,2.User id is mandatory here
    // Request -userId,langCode
    // Description- This api is used for user logout.

    //=============================================User logout===================================//


    logout: async (req, res) => {

        try {

            console.log("Request for logout is===========>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            if (!req.body.userId) {
                console.log("UserId is required")
                return res.send({ status: "FAILURE", response_message: i18n.__("Something wemt wrong") })
            }
            let result = await User.findByIdAndUpdate({ "_id": req.body.userId }, { $set: { "onlineStatus": "Offline", "jwtToken": "", deviceToken: '', deviceType: '' } }, { new: true })
            if (!result) {
                console.log("User Id is not correct");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            console.log("Logout successfully", result)
            return res.send({ status: "SUCCESS", response_message: i18n.__("Logout successfully") })
        } catch (error) {
            console.log("Error  is============>", error)
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") })
        }
    },

    //* Api name-Get static content
    //* Features-1.About us,Terms & conditions and walking page
    //* Method-Get
    //* Description- This api is used in walking page and user setting.

    //==============================================Get Static Content=============================//

    getStaticContent: async (req, res) => {

        try {
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            let result = await StaticModel.find({})
            console.log("Data found successfully", result)
            return res.send({ status: "SUCCESS", response_message: i18n.__('Data found successfully'), response: result })
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //* Api name-Get static content by type
    //* Features- Content get by type
    //* Request -type, Method-Post
    //* Description- This api is not used in this project but it will used in future.

    //============================================Get Static Content By typ=======================//

    getStaticContentByType: async (req, res) => {

        try {
            console.log("Request is==========>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            if (!req.body.type) {
                console.log("Content Type is required")
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });
            }
            let result = await StaticModel.findOne({ "Type": req.body.type })
            if (!result) {
                console.log("Type is not correct");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            console.log("Result is=========>", result);
            return res.send({ status: "SUCCESS", response_message: i18n.__("Data found successfully"), response: result })
        } catch (error) {
            console.log("Error is=========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //* Api name-Change langauge
    //* Features-1.Encrypted jwt token is required 2.User id is manadatory 3.Change app language
    //* Request-langCode,userId,token(In headers),appLanguage Method-Post
    //* Description- This api is used for change app langauge

    //=============================================Change Language=======================================//

    changeLanguage: async (req, res) => {

        try {
            console.log("Request for change language is===========>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            if (!req.body.userId || !req.body.appLanguage) {
                console.log("User Id is required")
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });
            }
            let query = { $and: [{ "_id": req.body.userId }, { "jwtToken": req.headers.token }] }
            let checkUser = await User.findOne(query)
            if (!checkUser) {
                console.log("Invalid Token");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            else if (checkUser.status == 'INACTIVE') {
                console.log("Your account has been disabled by admin");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") + warning });
            }
            let result = await User.findByIdAndUpdate({ "_id": req.body.userId }, { $set: { "appLanguage": req.body.appLanguage } }, { new: true })
            console.log("App language changed successfully", result);
            return res.send({ status: "SUCCESS", response_message: i18n.__("App language changed successfully"), response: result.appLanguage });
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //* Api name-Update settings
    //* Features-1.Encrypted jwt token is required 2.Block & unblock status is checking
    //* Request-langCode,userId,token(In headers) Method-Post
    //* Description- This api is used for update user settings.

    //=============================================Update Setting=========================================//

    updateSetting: async (req, res) => {

        try {
            console.log("Request for update setting is=================>", req.body);
            if (!req.body.userId) {
                console.log("User id is required");
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });
            }
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            let query = { $and: [{ "_id": req.body.userId }, { "jwtToken": req.headers.token }] }
            let checkUser = await User.findOne(query)
            if (!checkUser) {
                console.log("User Id is not correct")
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            else if (checkUser.status == 'INACTIVE') {
                console.log("Your account has been disabled by admin");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") + warning });
            }
            let result = await User.findByIdAndUpdate({ "_id": req.body.userId }, req.body, { new: true })
            console.log("User setting updated successfully", result);
            return res.send({ status: "SUCCESS", response_message: i18n.__("User setting updated successfully"), response: result.normalUserNotification });
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //* Api name-Get settings
    //* Features-1.Encrypted jwt token is required 2.Block & unblock status is checking 3.User id is required
    //* Request-langCode,userId,token(In headers) Method-Post
    //* Description- This api is used for get user settings.

    //=============================================Get Setting===========================================//

    getSetting: async (req, res) => {

        try {
            console.log("Request for get setting is=============>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            if (!req.body.userId) {
                console.log("User id is required");
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });
            }
            let query = { $and: [{ "_id": req.body.userId }, { "jwtToken": req.headers.token }] }
            let result = await User.findOne(query)
            if (!result) {
                console.log("Invalid user Id");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            else if (result.status == 'INACTIVE') {
                console.log("Your account has been disabled by admin");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") + warning });
            }
            console.log("User setting found successfully", result);
            return res.send({ status: "SUCCESS", response_message: i18n.__("User setting found successfully"), response: result.normalUserNotification });
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }

    },

    //* Api name-Add Address
    //* Features-1.Encrypted jwt token is required 2.Block & unblock status is checking
    //* Request-langCode,userId,token(In headers),address,landmark,lat,long,buildingAndApart Method-post
    //* Description -This api is used for add new address of pickup and dropp of for future asp

    //==============================================Add Address===========================================//

    addAddress: async (req, res) => {

        try {
            console.log("Request is for add address is====================>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            if (!req.body.userId) {
                console.log("User id is missing");
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });
            }
            let query = { $and: [{ "_id": req.body.userId }, { "jwtToken": req.headers.token }] }
            let result = await User.findOne(query)
            if (!result) {
                console.log("Invalid user Id")
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            else if (result.status == 'INACTIVE') {
                console.log("Account disabled");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") + warning })
            }
            let value = {
                "address": req.body.address,
                "landmark": req.body.landmark,
                "lat": Number(req.body.lat),
                "long": Number(req.body.long),
                "buildingAndApart": req.body.buildingAndApart
            }
            let result3 = await User.findByIdAndUpdate({ "_id": req.body.userId }, { $push: { "addresses": value } }, { new: true })
            console.log("Address saved successfully", result3)
            return res.send({ status: "SUCCESS", response_message: i18n.__("Address saved successfully"), Data: result3.addresses });
        } catch (error) {
            console.log("Error is============>", error)
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //* Api name-Delete Address
    //* Features-1.Encrypted jwt token is required 2.Block & unblock status is checking
    //* Request-langCode,userId,token(In headers),addressId Method-post
    //* Description -This api is used for delete the address.

    //===============================================Delete Address=======================================//

    deleteAddress: async (req, res) => {

        try {
            console.log("Request is=========>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            if (!req.body.addressId || !req.body.userId) {
                console.log("All fields are required")
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });
            }
            let query = { $and: [{ "_id": req.body.userId }, { "jwtToken": req.headers.token }] }
            let checkUser = await User.findOne(query)
            if (!checkUser) {
                console.log("Invalid Token");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            if (checkUser.status == 'INACTIVE') {
                console.log("Your account has been disabled by admin");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") + warning });
            }
            let result = await User.findOneAndUpdate({ "_id": req.body.userId, "addresses._id": req.body.addressId }, { $pull: { addresses: { _id: req.body.addressId } } }, { safe: true, new: true })
            if (!result) {
                console.log("Invalid user Id")
                return res.send({ status: "FAILURE", response_message: i18n.__("Invalid Token") });
            }
            console.log("Address deleted successfully", result)
            return res.send({ status: "SUCCESS", response_message: i18n.__("Address deleted successfully"), Data: result.addresses });
        } catch (error) {
            console.log("Error is==========>", error)
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //* Api name-Get address
    //* Features-1.Encrypted jwt token is required 2.Block & unblock status is checking
    //* Request-langCode,userId,token(In headers) Method-post
    //* Description -This api is used for get address list.

    //================================================Get Address=========================================//

    getAddress: async (req, res) => {

        try {
            console.log("Request for get address list is=====================>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            if (!req.body.userId) {
                console.log("User id is missing");
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });
            }
            let query = { $and: [{ "_id": req.body.userId }, { "jwtToken": req.headers.token }] }
            let checkUser = await User.findOne(query)
            if (!checkUser) {
                console.log("Invalid Token");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            if (checkUser.status == 'INACTIVE') {
                console.log("Your account has been disabled by admin");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") });
            }
            let options = {
                page: req.body.pageNumber || 1,
                limit: req.body.limit || 50,
                select: 'addresses',
                sort: { createdAt: -1 }

            }
            let result = await User.paginate({ "_id": req.body.userId }, options)
            if (result.docs.length == 0) {
                console.log("Data not found");
                return res.send({ status: "SUCCESS", response_message: i18n.__("No data found") });
            }
            console.log("Address list found successfully", result)
            return res.send({ status: "SUCCESS", response_message: i18n.__("Address list found successfully"), Data: result });
        } catch (error) {
            console.log("Error is==========>", error)
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //* Api name-Update address
    //* Features-1.Encrypted jwt token is required 2.Block & unblock status is checking
    //* Request-langCode,userId,token(In headers),addressId,address,landmark,lat,long,buildingAndApart Method-post
    //* Description -This api is used for update address of pickup and dropp of for future asp


    //================================================Update Address=====================================//

    updateAddress: async (req, res) => {

        try {
            console.log("Request is=======>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            if (!req.body.addressId || !req.body.userId) {
                console.log("All fields are required")
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });
            }
            let query = { $and: [{ "_id": req.body.userId }, { "jwtToken": req.headers.token }] }
            let checkUser = await User.findOne(query)
            if (!checkUser) {
                console.log("Invalid Token");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            if (checkUser.status == 'INACTIVE') {
                console.log("Your account has been disabled by admin");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") + warning });
            }
            let result1 = await User.update({ "_id": req.body.userId, "addresses._id": req.body.addressId }, { $set: { "addresses.$.address": req.body.address, "addresses.$.buildingAndApart": req.body.buildingAndApart, "addresses.$.landmark": req.body.landmark, "addresses.$.lat": Number(req.body.lat), "addresses.$.long": Number(req.body.long) } }, { new: true })
            if (!result1) {
                console.log("Invalid address Id")
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            console.log("Address updated successfully", result1)
            return res.send({ status: "SUCCESS", response_message: i18n.__("Address updated successfully"), Data: result1 });
        } catch (error) {
            console.log("Error is==========>", error)
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //* Api name-Update user profile
    //* Features-1.Encrypted jwt token is required 2.Block & unblock status is checked 3.Form Data Multiparty Request 4.Image is uploading on cloudinary
    //* Request-All fields are file are optional but userId,langCode
    //* Description- This api is used for update the user profile.


    //===============================================Update Profile======================================//

    updateProfile: async (req, res) => {

        try {
            console.log("Request for update profile is============>", req.body);
            console.log("Files is============>", req.files);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            if (!req.body.userId) {
                console.log("Field is missing")
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });
            }
            let checkUser = await User.findOne({ _id: req.body.userId })
            if (!checkUser) {
                console.log("Invalid Token");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            let query = { $and: [{ email: req.body.email }, { _id: { $ne: req.body.userId } }] }
            let checkEmail = await User.findOne(query)
            if (checkEmail) {
                console.log("Email already exist")
                return res.send({ status: "FAILURE", response_message: i18n.__("Email already exist") })
            }
            let profilePic = checkUser.profilePic
            if (req.files.profilePic) {
                let uploadedImage = await cloudinary.v2.uploader.upload(req.files.profilePic.path, { resource_type: "image" })
                profilePic = uploadedImage.secure_url
            }
            let obj = {
                $set: {
                    email: req.body.email,
                    name: req.body.name,
                    appLanguage: req.body.appLanguage,
                    speakLanguage: req.body.speakLanguage,
                    country: req.body.country,
                    profilePic: profilePic
                }
            }
            let updateUser = await User.findByIdAndUpdate({ _id: req.body.userId }, obj, { new: true })
            console.log("Profile updated successfully", updateUser)
            res.send({ status: "SUCCESS", response_message: i18n.__("Profile updated successfully"), response: updateUser });
        } catch (error) {
            console.log("Error is==========>", error)
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //* Api name-Become a delivery person request
    //* Features-userId is mandatory 2.Block & unblock status is checked 3.Form data multiparty request 4.All images are uploading on cloudinary
    //* Request -All fields and files are optional Method-Post
    //* Description- This api is used for request become a delivery person.

    //=============================================Become A delivery persion=============================//

    deliveryPerson: async (req, res) => {

        try {
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            console.log("Request for make a delivery person is============>", req.body);
            console.log("Files is==========>", req.files);
            let checkUser = await User.findOne({ _id: req.body.userId })
            if (!checkUser) {
                console.log("User Id is incorrect");
                return res.send({ status: "FAILURE", response_message: i18n.__("Invalid Token") })
            }
            let orderNumber = (new Date().getTime()).toString()
            let deliveryPersonId = Number(orderNumber.substring(3, 13))
            console.log("Unique id is============>", deliveryPersonId);
            if (req.files.id1) {
                cloudinary.v2.uploader.upload(req.files.id1.path, { resource_type: "image" }, (error1, result1) => {
                    if (error1) {
                        console.log("Err 1 is============>", error1)
                        return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") + cross1 })
                    }
                    else {
                        req.body.deliverPId1 = result1.secure_url;
                        User.findByIdAndUpdate({ "_id": req.body.userId }, req.body, { new: true }, (error6, result6) => {
                            if (error6) {
                                console.log("Error 6 is==========>", error6);
                            }
                            else {
                                console.log("ID1 Uploaded Successfully")
                            }

                        })
                    }
                })
            }
            if (req.files.id2) {
                cloudinary.v2.uploader.upload(req.files.id2.path, { resource_type: "image" }, (error1, result1) => {
                    if (error1) {
                        console.log("Err 1 is============>", error1)
                        return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") + cross1 })
                    }
                    else {
                        req.body.deliveryPId2 = result1.secure_url;
                        User.findByIdAndUpdate({ "_id": req.body.userId }, req.body, { new: true }, (error6, result6) => {
                            if (error6) {
                                console.log("Error 6 is==========>", error6);
                            }
                            else {
                                console.log("ID2 Uploaded Successfully")
                            }
                        })
                    }
                })
            }
            if (req.files.profilePic) {
                cloudinary.v2.uploader.upload(req.files.profilePic.path, { resource_type: "image" }, (error1, result1) => {
                    if (error1) {
                        console.log("Err 1 is============>", error1)
                        return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") + cross1 })
                    }
                    else {
                        req.body.deliveryPProfilePic = result1.secure_url;
                        User.findByIdAndUpdate({ "_id": req.body.userId }, req.body, { new: true }, (error6, result6) => {
                            if (error6) {
                                console.log("Error 6 is==========>", error6);
                            }
                            else {
                                console.log("Profile Uploaded Successfully")
                            }
                        })
                    }
                })
            }
            if (req.files.vehicleLicense) {
                cloudinary.v2.uploader.upload(req.files.vehicleLicense.path, { resource_type: "image" }, (error1, result1) => {
                    if (error1) {
                        console.log("Err 1 is============>", error1)
                        return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") + cross1 })
                    }
                    else {
                        req.body.vehicleLicense = result1.secure_url;
                        User.findByIdAndUpdate({ "_id": req.body.userId }, req.body, { new: true }, (error6, result6) => {
                            if (error6) {
                                console.log("Error 6 is==========>", error6);
                            }
                            else {
                                console.log("License Uploaded Successfully")
                            }
                        })
                    }
                })
            }
            if (req.files.insurance) {
                cloudinary.v2.uploader.upload(req.files.insurance.path, { resource_type: "image" }, (error1, result1) => {
                    if (error1) {
                        console.log("Err 1 is============>", error1)
                        return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") + cross1 })
                    }
                    else {
                        req.body.uploadedInsurance = result1.secure_url;
                        User.findByIdAndUpdate({ "_id": req.body.userId }, req.body, { new: true }, (error6, result6) => {
                            if (error6) {
                                console.log("Error 6 is==========>", error6);
                            }
                            else {
                                console.log("Insurance Uploaded Successfully")
                            }
                        })
                    }
                })
            }
            req.body.deliveryPersonUniqueId = deliveryPersonId;
            req.body.deliveryPAboutUs = req.body.aboutUs
            req.body.vehicleType = req.body.vehicleType
            req.body.vehicleNumber = req.body.vehicleNumber
            req.body.deliveryPBankAC = req.body.bankAC
            req.body.deliveryPEmergencyContact = req.body.emergencyContact
            req.body.signupWithDeliveryPerson = "true"
            let updateUser = await User.findByIdAndUpdate({ _id: req.body.userId }, req.body, { new: true })
            let notiObj = new Notification({
                notiTo: req.body.userId,
                notiTime: Date.now(),
                notiMessage: `Hi ${checkUser.name}! Your request for become a delivery captain have been submitted successfully.Please wait till admin will approval`,
                notiTitle: `Become A Delivery Captain Request Submitted`,
                notificationType: `makeDeliveryRequest`
            })
            let notiData = await notiObj.save()
            console.log("Request submitted successfully", updateUser)
            res.send({ status: "SUCCESS", response_message: i18n.__("Request submitted successfully") + right1, response: updateUser });
            if (checkUser.deviceType == 'android' && checkUser.normalUserNotification == true) {
                func.sendNotificationForAndroid(checkUser.deviceToken, notiObj.notiTitle, notiObj.notiMessage, "deliveryRequest", (error10, result10) => {
                    console.log("Notification Sent");
                    return;
                })
            }
            if (checkUser.deviceType == 'iOS' && checkUser.normalUserNotification) {
                let query2 = { $and: [{ "notiTo": req.body.userId }, { "isSeen": "false" }] }
                Notification.find(query2, (error12, result12) => {
                    if (error12) {
                        console.log("Error 12 is=========>", error12);
                    }
                    else {
                        let badgeCount = result12.length;
                        console.log("Badge count is=========>", badgeCount);
                        func.sendiosNotification(checkUser.deviceToken, notiObj.notiTitle, notiObj.notiMessage, badgeCount, "deliveryRequest", (error10, result10) => {
                            console.log("Notification Sent");
                            return;
                        })
                    }
                })
            }

        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") + cross1 })
        }
    },

    //* Api name-Become a professional worker request
    //* Features-userId is mandatory 2.Block & unblock status is checked 3.Form data multiparty request 4.All images are uploading on cloudinary
    //* Request -All fields and files are optional Method-Post
    //* Description- This api is used for request become a professional worker.


    //===========================================Become a professional persion===========================//

    professionalPerson: async (req, res) => {

        try {
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            console.log("Request for make a professional person is==========>", req.body);
            console.log("Files is==============>", req.files);
            let checkUser = await User.findOne({ _id: req.body.userId })
            if (!checkUser) {
                console.log("User Id is incorrect");
                return res.send({ status: "FAILURE", response_message: i18n.__("Invalid Token") })
            }
            let orderNumber = (new Date().getTime()).toString()
            let professiona1Id = Number(orderNumber.substring(3, 13))
            console.log("Unique id is============>", professiona1Id);
            let identityProof = ''
            let addressProof = ''
            let drivingLicence = ''
            let workImage = []
            let professionalProfie = ''
            if (req.files.identityProof) {
                let uploadedImage = await cloudinary.v2.uploader.upload(req.files.identityProof.path, { resource_type: "image" })
                identityProof = uploadedImage.secure_url
            }
            if (req.files.addressProof) {
                let uploadedImage = await cloudinary.v2.uploader.upload(req.files.addressProof.path, { resource_type: "image" })
                addressProof = uploadedImage.secure_url
            }
            if (req.files.workImage) {
                for (let i = 0; i < req.files.workImage.length; i++) {
                    let uploadedImage = await cloudinary.v2.uploader.upload(req.files.workImage[i].path, { resource_type: "image" })
                    workImage.push(uploadedImage.secure_url)
                }
            }
            if (req.files.drivingLicence) {
                let uploadedImage = await cloudinary.v2.uploader.upload(req.files.drivingLicence.path, { resource_type: "image" })
                drivingLicence = uploadedImage.secure_url
            }
            if (req.files.profilePic) {
                let uploadedImage = await cloudinary.v2.uploader.upload(req.files.profilePic.path, { resource_type: "image" })
                professionalProfie = uploadedImage.secure_url
            }
            let obj = {
                professiona1PersonUniqueId: professiona1Id,
                identityProof: identityProof,
                addressProof: addressProof,
                workImage: workImage,
                drivingLicence: drivingLicence,
                professionalProfie: professionalProfie,
                transportMode: req.body.transportMode,
                serviceCategory: req.body.serviceCategory,
                serviceSubCategory: req.body.serviceSubCategory,
                signupWithProfessionalWorker: "true",
                userType: 'Provider',
            }
            let updateUser = await User.findByIdAndUpdate({ _id: req.body.userId }, { $set: obj }, { new: true })
            let notiObj = new Notification({
                notiTo: req.body.userId,
                notiTime: Date.now(),
                notiMessage: `Hi ${checkUser.name}! Your request for become a professional worker have been submitted successfully. Please wait till admin will approval`,
                notiTitle: `Become A Professional Worker Request Submitted`,
                notificationType: `makeProfessionalRequest`
            })
            await notiObj.save()
            console.log("Request submitted successfully", updateUser)
            res.send({ status: "SUCCESS", response_message: i18n.__("Request submitted successfully") + right1, response: updateUser });
            if (checkUser.deviceType == 'android' && checkUser.normalUserNotification) {
                func.sendNotificationForAndroid(checkUser.deviceToken, notiObj.notiTitle, notiObj.notiMessage, "professionalRequest", (error10, result10) => {
                    console.log("Notification Sent");
                    return;
                })
            }
            if (checkUser.deviceType == 'iOS' && checkUser.normalUserNotification) {
                let query2 = { $and: [{ "notiTo": req.body.userId }, { "isSeen": "false" }] }
                let result12 = await Notification.find(query2)
                let badgeCount = result12.length;
                console.log("Badge count is=========>", badgeCount);
                func.sendiosNotificationProvider(checkUser.deviceToken, notiObj.notiTitle, notiObj.notiMessage, badgeCount, "professionalRequest", (error10, result10) => {
                    console.log("Notification Sent");
                    return;
                })

            }
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") })
        }
    },

    //* Api name-Place a order for delivery and professional worker
    //* Features-1.Order can be placed with signup or login 2.Order can be placed in under 2000km 3.Order number is generated unique 4.Geodist is used for calculating distance btween points
    //* Request-langCode,service,serviceType,pickupLong,pickupLat,dropOffLong,dropOffLat,pickupLocation,dropOffLocation,seletTime,orderDetails,termsAndCondition(Optional),selectCategoryName,selectSubCategoryName,selectSubSubCategoryName
    //* Description-This api is used for placing a order for delivery and professional.

    //==============================================Request Order=======================================//

    requestOrder: async (req, res) => {

        try {
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            console.log("Request for order submitting is==============>", req.body);
            console.log("Request for order submitting is==============>", req.files);
            let checkAdmin = await Admin.findOne({ userType: 'Admin' })
            let od = Number(checkAdmin.orderNumber) + 1
            await Admin.findByIdAndUpdate({ _id: checkAdmin._id }, { $set: { orderNumber: od } }, { new: true })
            var orderId = `OD${od}`
            console.log("Order Id is===============>", orderId);
            let orderImage = []
            if (req.files.orderImages) {
                for (let i = 0; i < req.files.orderImages.length; i++) {
                    let uploadedImage = await cloudinary.v2.uploader.upload(req.files.orderImages[i].path, { resource_type: "image" })
                    orderImage.push(uploadedImage.secure_url)
                    console.log("Image upldated is==========>", uploadedImage.secure_url);
                }
            }
            let categoryNameArray = []
            let subCategoryNameArray = []
            let serviceSubCategoryId = "5efec53e7949ab30cbe57511"
            let selectSubCategoryName = ''
            let portugueseCategoryName = ''
            let portugueseSubCategoryName = ''
            if (req.body.serviceSubCategoryId == '') {
                selectSubCategoryName = ''
            }
            if (!req.body.serviceSubCategoryId == '') {
                selectSubCategoryName = req.body.selectSubCategoryName
                portugueseSubCategoryName = req.body.portugueseSubCategoryName
                serviceSubCategoryId = req.body.serviceSubCategoryId
            }
            categoryNameArray.push(req.body.selectCategoryName)
            if (req.body.selectSubCategoryName) {
                subCategoryNameArray.push(req.body.selectSubCategoryName)
            }
            let obj = new ServiceModel({
                "pickupLocation": req.body.pickupLocation,
                "selectCategoryName": req.body.selectCategoryName,
                "selectSubCategoryName": selectSubCategoryName,
                "pickupLat": Number(req.body.pickupLat),
                "pickupLong": Number(req.body.pickupLong),
                "seletTime": req.body.seletTime,
                "orderDetails": req.body.orderDetails,
                "orderNumber": orderId,
                "serviceCategoryId": req.body.serviceCategoryId,
                "serviceSubCategoryId": serviceSubCategoryId,
                "orderImages": orderImage,
                "currency": checkAdmin.currency,
                "categoryNameArray": categoryNameArray,
                "subCategoryNameArray": subCategoryNameArray,
                portugueseCategoryName: req.body.portugueseCategoryName,
                portugueseSubCategoryName: portugueseSubCategoryName,
                "location": { "type": "Point", "coordinates": [Number(req.body.pickupLong), Number(req.body.pickupLat)] }
            })
            let result = await obj.save()
            console.log("Order submitted successfully", result)
            return res.send({ status: "SUCCESS", response_message: i18n.__("Order submitted successfully"), Data: result });
        } catch (error) {
            console.log("Error is=========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") })
        }
    },

    //* Api name-Get user details
    //* Features-Token is required 2.userId is required
    //* Request-langCode,userId,token(In headers) Method-Post
    //* Description-This api is used for get the user details

    //===============================================Get user data=======================================//

    getUserDetails: async (req, res) => {

        try {
            console.log("Request for get user details is=============>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            if (!req.body.userId) {
                console.log("User Id is required");
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });
            }
            let query = { $and: [{ "_id": req.body.userId }, { "jwtToken": req.headers.token }] }
            let result = await User.findOne(query)
            if (!result) {
                console.log("User Id is incorrect");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            else if (result.status == 'INACTIVE') {
                console.log("Account disabled");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") + warning })
            }
            console.log("User details found successfully", result);
            return res.send({ status: "SUCCESS", response_message: i18n.__("User details found successfully"), response: result });
        } catch (error) {
            console.log("Error is ===============>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //* Api name-Contact us
    //* Description -Api is used for contact with admin and mail will send on user's registered email

    //=============================================Contact Us===========================================//

    contactUs: async (req, res) => {

        try {
            console.log("Request for contact us is============>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            let query = { $and: [{ "_id": req.body.userId }, { "jwtToken": req.headers.token }] }
            let checkUser = await User.findOne(query)
            if (!checkUser) {
                console.log("User Id is incorrect");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            else if (checkUser.status == 'INACTIVE') {
                console.log("Account disabled");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") + warning })
            }
            let contactObj = new ContactModel({
                "reason": req.body.reason,
                "description": req.body.description,
                "userId": req.body.userId
            })
            let result = await contactObj.save()
            console.log("Thank you for contacting us", result);
            res.send({ status: "SUCCESS", response_message: i18n.__("Thank you for contacting us"), response: result });
            let subject = `Welcome to PaginAzul App`
            let title = `Contact Us Notification`
            let message = `We have received your message and would like to thank you for writing to us. If your inquiry is urgent, please use the telephone number to talk to one of our staff members. Otherwise, we will reply by email as soon as possible.`
            if (checkUser.appLanguage == "Portuguese") {
                subject = `Bem-vindo ao PaginAzul App`
                message = `Recebemos sua mensagem e gostaríamos de agradecer por nos escrever. Se sua pergunta for urgente, por favor, use o número de telefone para falar com um de nossos funcionários. Caso contrário, responderemos por e-mail o mais breve possível.`
                title = "Notificação de contato"
            }
            if (checkUser.email) {
                func.sendHtmlEmail1(checkUser.email, title, message, subject, (err__, succ__) => {
                    if (err__) {
                        console.log("Error is=======>", err__);
                    } else if (succ__) {
                        console.log("Send mail===========>", succ__);

                    }
                })
            }
        } catch (error) {
            console.log("Error is ===============>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //* Api name-Get category list
    //* Features-Get all category list which will added by admin
    //* Request-{} Method-Post
    //* Description-This api is used for get all category for placing a order for professional worker in app.Actually this is service category api

    //=======================================Get Category List=========================================//

    getCategory: async (req, res) => {

        try {
            console.log("Request for get cateory list is==============>", req.body);
            let categoryList = await ServiceCategory.find({ status: 'Active' })
            console.log("Service category found successfully", categoryList);
            return res.send({ status: "SUCCESS", response_message: "Service category found successfully", response: categoryList })
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: "Internal server error" });
        }
    },

    //* Api name-Get sub category list
    //* Request-categoryId Method-Post
    //* Description-This api is used for get subcategory list according to category

    //======================================Get Sub Category===========================================//

    getSubCategory: async (req, res) => {

        try {
            if (!req.body.categoryId) {
                console.log("Field is missing");
                return res.send({ status: "FAILURE", response_message: "Something went wrong" });
            }
            let subCategoryList = await ServiceSubCategory.find({ "categoryId": req.body.categoryId, status: 'Active' })
            console.log("Sub category list found successfully", subCategoryList);
            if (subCategoryList.length == 0) {
                return res.send({ status: "SUCCESS", code: 404, response_message: "No sub-category found", response: [] })
            }
            return res.send({ status: "SUCCESS", response_message: "Sub category list found successfully", response: subCategoryList })

        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: "Internal server error" });
        }
    },

    //* Api name-Get sub(sub) category list
    //* Request-subCategoryId Method-Post
    //* Description-This api is used for get subcategory(sub) list according to sub-category

    //======================================Get sub sub category=======================================//

    getSubSubCategory: async (req, res) => {

        try {
            console.log("Request for get sub category list ==============>", req.body);
            if (!req.body.subCategoryId) {
                console.log("Sub CategoryId Id is required");
                return res.send({ status: "FAILURE", response_message: "Something went wrong" });
            }
            let subsubCategoryList = await ServiceSubSubCategory.find({ "subCategoryId": req.body.subCategoryId })
            console.log("Sub-Sub category list found successfully", subsubCategoryList);
            return res.send({ status: "SUCCESS", response_message: "Sub-Sub category list found successfully", response: subsubCategoryList })
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: "Internal server error" });
        }
    },

    //* Api name-Update user Id
    //* Features-This api is used in app after place a order 
    //* Request -userId,orderId Method-Post
    //* Description-This api is used for update used Id

    //======================================update user Id=============================================//

    updateUserId: async (req, res) => {


        try {
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            console.log("Update user Id is============>", req.body, req.headers.token);
            let query = { $and: [{ "_id": req.body.userId }, { "jwtToken": req.headers.token }] }
            let checkUser = await User.findOne(query)
            if (!checkUser) {
                console.log("User Id is incorrect");
                return res.send({ status: "FAILURE", response_message: "Invalid token" });
            }
            else if (checkUser.status == 'INACTIVE') {
                console.log("Account disabled");
                res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity.") + warning })
            }
            let checkOrder = await ServiceModel.findOne({ _id: req.body.orderId })
            let skipProvider = []
            let latitude = checkOrder.pickupLat
            let longitude = checkOrder.pickupLong
            console.log("Lat long is========>", latitude, longitude);
            let checkAndroidUser = await User.aggregate([
                {
                    $geoNear: {
                        near: { type: "Point", coordinates: [parseFloat(longitude), parseFloat(latitude)] },
                        key: "location",
                        spherical: true,
                        query: { userType: "Provider" },
                        maxDistance: 100000,
                        distanceField: "dist.calculated",
                        includeLocs: "locs",
                    },

                },
                {
                    $match: {
                        $and: [{
                            "userType": "Provider",
                            "dutyStatus": 'Off'
                        },
                        {

                            "status": 'ACTIVE'
                        }]
                    }


                },
                { "$sort": { "dist": -1 } },
                {
                    $project: {
                        "_id": 1
                    }
                }
            ])
            console.log("Duty off user is=============>", checkAndroidUser)
            for (let k = 0; k < checkAndroidUser.length; k++) {
                let obj = {
                    userId: ObjectId(checkAndroidUser[k]._id)
                }
                skipProvider.push(obj)
            }
            let d1 = new Date(),
                d2 = new Date(d1);
            d2.setMinutes(d1.getMinutes() + 20);
            req.body.userId = req.body.userId
            req.body.signupWithNormalPerson = checkUser.signupWithNormalPerson
            req.body.signupWithProfessionalWorker = checkUser.signupWithProfessionalWorker
            req.body.adminVerifyProfessionalWorker = checkUser.adminVerifyProfessionalWorker
            req.body.orderCreatedByName = checkUser.name
            req.body.time = d2
            req.body.skipProvider = skipProvider,
                req.body.popupStatus = 'Show'
            let result = await ServiceModel.findByIdAndUpdate({ "_id": req.body.orderId }, req.body, { new: true })
            if (!result) {
                console.log("Order Id is incorrect");
                return res.send({ status: "FAILURE", response_message: i18n.__("Invalid Token") });
            }
            let notiTitle = `Order Placed Successfully`
            let notiMessage = `Hi ${checkUser.name}! Your new order has been placed successfully.`
            if (checkUser.appLanguage == "Portuguese") {
                notiTitle = `Pedido efetuado com sucesso`
                notiMessage = `Oi ${checkUser.name}! Seu novo pedido foi feito com sucesso`
            }
            let notiObj = new Notification({
                notiTo: req.body.userId,
                notiTime: Date.now(),
                notiMessage: notiMessage,
                notiTitle: notiTitle,
                notificationType: `orderPlacedFor${result.serviceType}`

            })
            let result1 = await notiObj.save()
            console.log("Notification data is===========>", result1);
            console.log("Details updated successfully", result);
            res.send({ status: "SUCCESS", response_message: i18n.__("Details updated successfully") + right1, response: result });
            if (checkUser.deviceType == 'android' && checkUser.normalUserNotification == true) {
                func.sendNotificationForAndroid(checkUser.deviceToken, notiObj.notiTitle, notiObj.notiMessage, "orderPlaced", (error10, result10) => {
                    console.log("Notification Sent");
                })
            }
            if (checkUser.deviceType == 'iOS' && checkUser.normalUserNotification == true) {
                let query2 = { $and: [{ "notiTo": req.body.userId }, { "isSeen": "false" }] }
                let result12 = await Notification.find(query2)
                let badgeCount = result12.length;
                console.log("Badge count is=========>", badgeCount);
                func.sendiosNotification(checkUser.deviceToken, notiObj.notiTitle, notiObj.notiMessage, badgeCount, "orderPlaced", (error10, result10) => {
                    console.log("Notification Sent");
                })
            }
            let notiRequest = {}
            let selectCategoryName = checkOrder.selectCategoryName
            let selectSubCategoryName = checkOrder.selectSubCategoryName
            if (checkOrder.selectSubCategoryName == '') {
                notiRequest = {
                    $and: [{
                        "userType": "Provider",
                        "dutyStatus": 'On'
                    }, {

                        "status": 'ACTIVE'
                    }, { "categoryNameArray.serviceCategory": { $eq: selectCategoryName } },
                    ]
                }

            }
            if (!checkOrder.selectSubCategoryName == '') {
                notiRequest = {
                    $and: [{
                        "userType": "Provider",
                        "dutyStatus": 'On'
                    }, {

                        "status": 'ACTIVE'
                    }, { "categoryNameArray.serviceCategory": { $eq: selectCategoryName } },
                    { "subCategoryNameArray.serviceSubCategory": { $eq: selectSubCategoryName } }]
                }

            }
            let checkNotiUser = await User.aggregate([
                {
                    $geoNear: {
                        near: { type: "Point", coordinates: [parseFloat(longitude), parseFloat(latitude)] },
                        key: "location",
                        spherical: true,
                        query: { userType: "Provider" },
                        maxDistance: 100000,
                        distanceField: "dist.calculated",
                        includeLocs: "locs",
                    },

                },
                {
                    $match: notiRequest

                },
                { "$sort": { "dist": -1 } },
            ])
            console.log("Noti user is========>", checkNotiUser.length)
            if (checkNotiUser.length == 0) {
                console.log("can not send notification to drivers")
                return;
            }
            else {
                for (let i = 0; i < checkNotiUser.length; i++) {
                    console.log("Hi", checkNotiUser[i])
                    let message = `Hi,New order is now available in your area`
                    let title = "New Order Available"
                    if (checkNotiUser[i].appLanguage == "Portuguese") {
                        message = `Oi, Nova proposta já está disponível no número do seu pedido ODD proposto por`
                        title = "Nova ordem disponível"
                    }
                    let notiObj1 = new Notification({
                        notiTo: checkNotiUser[i]._id,
                        notiTitle: title,
                        notiMessage: message,
                        notificationType: "orderAvailableForDelivery"
                    })
                    await notiObj1.save()
                    if (checkNotiUser[i].deviceType == "android" && checkNotiUser[i].normalUserNotification == true) {
                        console.log("Deviec is=======>", checkNotiUser[i].deviceToken)
                        func.sendNotificationForAndroid(checkNotiUser[i].deviceToken, title, message, "orderAvailableForDelivery", (error10, result10) => {
                            if (error10) {
                                console.log("Error 10 is=========>", error10);
                            }
                            else {
                                console.log("Send notification is=============>", result10);
                                return;
                            }
                        })
                    }
                    else if (checkNotiUser[i].deviceType == "iOS" && checkNotiUser[i].normalUserNotification == true) {
                        func.sendiosNotificationProvider(checkNotiUser[i].deviceToken, title, message, 0, "orderAvailableForDelivery", (error10, result10) => {
                            if (error10) {
                                console.log("Error 10 is=========>", error10);
                            }
                            else {
                                console.log("Send notification is=============>", result10);
                            }
                        })
                    }
                }
            }
        } catch (error) {
            console.log("Error is============>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") + cross1 });
        }

    },

    //* Api name-Check mobile number availability
    //* Features-This api is uesd before signup and change mobile number
    //* Request-mobileNumber,countryCode
    //* Description-This api is used for check the mobile number availability

    //===============================================Check availability===================================//

    checkAvailability: async (req, res) => {

        try {
            console.log("Request for mobile number is===========>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            if (!req.body.mobileNumber || !req.body.countryCode) {
                console.log("All fields are required")
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") })
            }
            let query = { $and: [{ "countryCode": req.body.countryCode }, { "mobileNumber": req.body.mobileNumber }] }
            let result = await User.findOne(query)
            if (result) {
                console.log("Mobile number already exist")
                return res.send({ status: "FAILURE", response_message: i18n.__("Mobile number already exist") })
            }
            console.log("Mobile number available")
            return res.send({ status: "SUCCESS", response_message: i18n.__("Mobile number availabler") })
        } catch (error) {
            console.log("Error  is============>", error)
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") })
        }
    },

    //* Api name-Get order details
    //* Request-orderId Method-Post
    //* Description-This api is used for get the order details

    //============================================Get particular order====================================//

    getOrder: async (req, res) => {

        try {
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            let result = await ServiceModel.findOne({ "_id": req.body.orderId })
            if (!result) {
                console.log("Order Id is incorrect");
                return res.send({ status: "FAILURE", response_message: i18n.__("Order Id is incorrect") });
            }
            console.log("Order found successfully", result);
            return res.send({ status: "SUCCESS", response_message: i18n.__("Order found successfully"), response: result });
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //* Api name-Get contact details
    //* Method-Post
    //* Description-This api is used for get the contact details

    //=============================================Get contact details====================================//

    getContactUsDetail: async (req, res) => {

        try {
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            console.log("Request for get contact us detail is============>", req.body);
            let data = await StaticModel.findOne({ "Type": "ContactUs" })
            if (!data) {
                console.log("No data found");
                return res.send({ status: "FAILURE", response_message: i18n.__("No data found") });
            }
            console.log("Data found successfully", data);
            return res.send({ status: "SUCCESS", response_message: i18n.__("Data found successfully"), response: data });
        } catch (error) {
            console.log("Error is==========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },


    //* Api name-Get delivery person details
    //* Request-usedId Method-Post
    //* Description-This api is used for get the delivery person details.

    //===========================================Get delivery details====================================//

    getDeliveryDetails: async (req, res) => {

        try {
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            console.log("Request for get delivery person details is=============>", req.body);
            if (!req.body.userId) {
                console.log("User id is missing");
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });
            }
            let result = await User.findOne({ "_id": req.body.userId }).select('deliveryPAboutUs vehicleType vehicleNumber vehicleLicense insuranceNumber uploadedInsurance deliveryPBankAC deliveryPEmergencyContact deliverPId1 deliveryPId2 deliveryPProfilePic deliveryPersonUniqueId')
            if (!result) {
                console.log("User Id is incorrect");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" })
            }
            if (result.status == 'INACTIVE') {
                console.log("Account disabled");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity.") })
            }
            console.log("User Details found successfully", result);
            return res.send({ status: "SUCCESS", response_message: i18n.__("User Details found successfully"), Data: result });
        } catch (error) {
            console.log("Error is ===============>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //* Api name-Get professional worker details
    //* Request-usedId Method-Post
    //* Description-This api is used for get the professional worker details.

    //===========================================Get professional worker=================================//

    getProfessionalDetails: async (req, res) => {

        try {
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            console.log("Request for get professional worker details is=============>", req.body);
            if (!req.body.userId) {
                console.log("User id is missing");
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });
            }
            let result = await User.findOne({ "_id": req.body.userId })
            if (result.status == 'INACTIVE') {
                console.log("Account disabled");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity.") })
            }
            console.log("User Details found successfully", result);
            return res.send({ status: "SUCCESS", response_message: i18n.__("User Details found successfully"), Data: result });
        } catch (error) {
            console.log("Error is ===============>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //* Api name-Update delivery person details
    //* Request-All fields and files are optional Method-Post
    //* Features-userId is required
    //* Description-This api is used for update the delivery person details

    //=========================================Update delivery person====================================//

    updateDeliveryPerson: async (req, res) => {

        try {
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            console.log("Request for update delivery person is==============>", req.body);
            console.log("Files is===========>", req.files);
            let checkUser = await User.findOne({ _id: req.body.userId })
            if (!checkUser) {
                console.log("User Id is incorrect");
                return res.send({ status: "FAILURE", response_message: i18n.__("Invalid Token") })
            }
            if (req.files.id1) {
                cloudinary.v2.uploader.upload(req.files.id1.path, { resource_type: "image" }, (error1, result1) => {
                    if (error1) {
                        console.log("Err 1 is============>", error1)
                        return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") + cross1 })
                    }
                    else {
                        req.body.deliverPId1 = result1.secure_url;
                        User.findByIdAndUpdate({ "_id": req.body.userId }, req.body, { new: true }, (error6, result6) => {
                            if (error6) {
                                console.log("Error 6 is==========>", error6);
                            }
                            else {
                                console.log("ID1 Uploaded Successfully")
                            }

                        })
                    }
                })
            }
            if (req.files.id2) {
                cloudinary.v2.uploader.upload(req.files.id2.path, { resource_type: "image" }, (error1, result1) => {
                    if (error1) {
                        console.log("Err 1 is============>", error1)
                        return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") + cross1 })
                    }
                    else {
                        req.body.deliveryPId2 = result1.secure_url;
                        User.findByIdAndUpdate({ "_id": req.body.userId }, req.body, { new: true }, (error6, result6) => {
                            if (error6) {
                                console.log("Error 6 is==========>", error6);
                            }
                            else {
                                console.log("ID2 Uploaded Successfully")
                            }
                        })
                    }
                })
            }
            if (req.files.profilePic) {
                cloudinary.v2.uploader.upload(req.files.profilePic.path, { resource_type: "image" }, (error1, result1) => {
                    if (error1) {
                        console.log("Err 1 is============>", error1)
                        return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") + cross1 })
                    }
                    else {
                        req.body.deliveryPProfilePic = result1.secure_url;
                        User.findByIdAndUpdate({ "_id": req.body.userId }, req.body, { new: true }, (error6, result6) => {
                            if (error6) {
                                console.log("Error 6 is==========>", error6);
                            }
                            else {
                                console.log("Profile Uploaded Successfully")
                            }
                        })
                    }
                })
            }
            if (req.files.vehicleLicense) {
                cloudinary.v2.uploader.upload(req.files.vehicleLicense.path, { resource_type: "image" }, (error1, result1) => {
                    if (error1) {
                        console.log("Err 1 is============>", error1)
                        return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") + cross1 })
                    }
                    else {
                        req.body.vehicleLicense = result1.secure_url;
                        User.findByIdAndUpdate({ "_id": req.body.userId }, req.body, { new: true }, (error6, result6) => {
                            if (error6) {
                                console.log("Error 6 is==========>", error6);
                            }
                            else {
                                console.log("License Uploaded Successfully")
                            }
                        })
                    }
                })
            }
            if (req.files.insurance) {
                cloudinary.v2.uploader.upload(req.files.insurance.path, { resource_type: "image" }, (error1, result1) => {
                    if (error1) {
                        console.log("Err 1 is============>", error1)
                        return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") + cross1 })
                    }
                    else {
                        req.body.uploadedInsurance = result1.secure_url;
                        User.findByIdAndUpdate({ "_id": req.body.userId }, req.body, { new: true }, (error6, result6) => {
                            if (error6) {
                                console.log("Error 6 is==========>", error6);
                            }
                            else {
                                console.log("Insurance Uploaded Successfully")
                            }
                        })
                    }
                })
            }
            req.body.deliveryPAboutUs = req.body.aboutUs
            req.body.vehicleType = req.body.vehicleType
            req.body.vehicleNumber = req.body.vehicleNumber
            req.body.deliveryPBankAC = req.body.bankAC
            req.body.deliveryPEmergencyContact = req.body.emergencyContact
            req.body.signupWithDeliveryPerson = "true"
            let updateUser = await User.findByIdAndUpdate({ _id: req.body.userId }, req.body, { new: true })
            console.log("Profile Updated", updateUser)
            return res.send({ status: "SUCCESS", response_message: "Profile Updated", Data: updateUser });
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: "Internal server error" })
        }
    },


    //* Api name-Update professional worker details
    //* Request-All fields and files are optional Method-Post
    //* Features-userId is required
    //* Description-This api is used for update the professional worker details

    //============================================Update professional Person=============================//

    updateProfessionalPerson: async (req, res) => {

        try {
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            console.log("Request for update professional worker is==========>", req.body);
            console.log("Files is==========>", req.files);
            let checkUser = await User.findOne({ _id: req.body.userId })
            if (!checkUser) {
                console.log("User Id is incorrect");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" })
            }
            let identityProof = checkUser.identityProof
            let addressProof = checkUser.addressProof
            let drivingLicence = checkUser.drivingLicence
            let workImage = []
            let professionalProfie = checkUser.professionalProfie
            if (req.files.identityProof) {
                let uploadedImage = await cloudinary.v2.uploader.upload(req.files.identityProof.path, { resource_type: "image" })
                identityProof = uploadedImage.secure_url
            }
            if (req.files.addressProof) {
                let uploadedImage = await cloudinary.v2.uploader.upload(req.files.addressProof.path, { resource_type: "image" })
                addressProof = uploadedImage.secure_url
            }
            if (req.files.workImage) {
                for (let i = 0; i < req.files.workImage.length; i++) {
                    let uploadedImage = await cloudinary.v2.uploader.upload(req.files.workImage[i].path, { resource_type: "image" })
                    workImage.push(uploadedImage.secure_url)
                }
            }
            if (req.files.drivingLicence) {
                let uploadedImage = await cloudinary.v2.uploader.upload(req.files.drivingLicence.path, { resource_type: "image" })
                drivingLicence = uploadedImage.secure_url
            }
            if (req.files.profilePic) {
                let uploadedImage = await cloudinary.v2.uploader.upload(req.files.profilePic.path, { resource_type: "image" })
                professionalProfie = uploadedImage.secure_url
            }
            let obj = {
                identityProof: identityProof,
                addressProof: addressProof,
                workImage: workImage,
                drivingLicence: drivingLicence,
                professionalProfie: professionalProfie,
                transportMode: req.body.transportMode,
                serviceCategory: req.body.serviceCategory,
                serviceSubCategory: req.body.serviceSubCategory,
                signupWithProfessionalWorker: "true",
                userType: 'Provider',
                categoryNameArray: JSON.parse(req.body.categoryNameArray),
                subCategoryNameArray: JSON.parse(req.body.subCategoryNameArray),
            }

            let updateUser = await User.findByIdAndUpdate({ _id: req.body.userId }, { $set: obj }, { new: true })
            console.log("Profile Updated", updateUser)
            return res.send({ status: "SUCCESS", response_message: i18n.__("Profile updated successfully"), Data: updateUser });
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") })
        }
    },


    //* Api name-Get all pending order for normal user
    //* Features-Total offer available ,User data, Total Rating ,Average Rating,Current to pickup and picup to dropoff location calculated
    //* Request-langCode,lat,long,userId,token(In headers) Method-Post
    //* Description-This api is used for get all pending orders for user

    //============================================Get Normal user Pending Order===========================//

    getNormalUserPendingOrder: async (req, res) => {
        try {
            console.log("Request for get pending order list is=============>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            if (!req.body.userId || !req.body.lat || !req.body.long || !req.headers.token) {
                console.log("Field is missing");
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });;
            }
            let query = { $and: [{ "_id": req.body.userId }, { "signupWithNormalPerson": 'true' }, { "jwtToken": req.headers.token }] }
            let checkUser = await User.findOne(query)
            if (!checkUser) {
                console.log("User id is incorrect");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            if (checkUser.status == 'INACTIVE') {
                console.log("Account disabled");
                res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") })
            }
            if (req.body.serviceType == 'DeliveryPersion') {
                let query1 = { $and: [{ "userId": req.body.userId }, { "status": 'Pending' }, { "serviceType": 'DeliveryPersion' }, { deleteStatus: false }] }
                let options = {
                    page: req.body.pageNumber || 1,
                    limit: req.body.limit || 100,
                    lean: true,
                    sort: {
                        createdAt: -1
                    }

                }
                let result = await ServiceModel.paginate(query1, options)
                if (result.docs.length == 0) {
                    console.log("No Data found", result);
                    return res.send({ status: "SUCCESS", response_message: i18n.__("No data found"), Data: result });
                }
                for (let i = 0; i < result.docs.length; i++) {
                    let lon = result.docs[i].location.coordinates[0]
                    let lat = result.docs[i].location.coordinates[1]
                    console.log("Lat and long in float is===============>", parseFloat(req.body.long), parseFloat(req.body.lat))
                    let dist = geodist({ lon: parseFloat(lon), lat: parseFloat(lat) }, { lon: parseFloat(req.body.long), lat: parseFloat(req.body.lat) }, { exact: true, unit: 'km' })
                    let lon1 = result.docs[i].location.coordinates1[0]
                    let lat1 = result.docs[i].location.coordinates1[1]
                    console.log("Lat and long in float for dropoff===============>", parseFloat(lon1), parseFloat(lat1))
                    let dist1 = geodist({ lon: parseFloat(lon), lat: parseFloat(lat) }, { lon: parseFloat(lon1), lat: parseFloat(lat1) }, { exact: true, unit: 'km' });
                    let cToP = (dist).toFixed(2);
                    let pToD = (dist1).toFixed(2);
                    console.log("Current to pickup distance is===========>", cToP);
                    console.log("Pickup to dropoff distance is==============>", pToD)
                    if (cToP.length >= 6) {
                        let cToP1 = cToP.substring(0, 6);
                        result.docs[i].currentToPicupLocation = cToP1;
                        result.docs[i].TotalOffer = result.docs[i].makeOfferByDeliveryPerson.length
                    }
                    else {
                        result.docs[i].currentToPicupLocation = cToP;
                        result.docs[i].TotalOffer = result.docs[i].makeOfferByDeliveryPerson.length

                    }
                    if (pToD.length >= 6) {
                        let pToD1 = pToD.substring(0, 6);
                        result.docs[i].pickupToDropLocation = pToD1;
                        result.docs[i].TotalOffer = result.docs[i].makeOfferByDeliveryPerson.length
                    }
                    else {
                        result.docs[i].pickupToDropLocation = pToD;
                        result.docs[i].TotalOffer = result.docs[i].makeOfferByDeliveryPerson.length
                    }
                }
                console.log("Order List found successfully", result);
                return res.send({ status: 'SUCCESS', response_message: i18n.__("Order List found successfully") + right1, Data: result })
            }
            else if (req.body.serviceType == 'ProfessionalWorker') {
                let query1 = { $and: [{ "userId": req.body.userId }, { "status": 'Pending' }, { "serviceType": 'ProfessionalWorker' }, { deleteStatus: false }] }
                let options = {
                    page: req.body.pageNumber || 1,
                    limit: req.body.limit || 100,
                    lean: true,
                    sort: {
                        createdAt: -1
                    }

                }
                let result = await ServiceModel.paginate(query1, options)
                if (result.docs.length == 0) {
                    console.log("No Data found", result);
                    return res.send({ status: "SUCCESS", response_message: i18n.__("No Data found"), Data: result });
                }
                for (let i = 0; i < result.docs.length; i++) {
                    let lon = result.docs[i].location.coordinates[0]
                    let lat = result.docs[i].location.coordinates[1]
                    console.log("Lat and long in float is===============>", parseFloat(req.body.long), parseFloat(req.body.lat))
                    let dist = geodist({ lon: parseFloat(lon), lat: parseFloat(lat) }, { lon: parseFloat(req.body.long), lat: parseFloat(req.body.lat) }, { exact: true, unit: 'km' })
                    let lon1 = result.docs[i].location.coordinates1[0]
                    let lat1 = result.docs[i].location.coordinates1[1]
                    console.log("Lat and long in float for dropoff===============>", parseFloat(lon1), parseFloat(lat1))
                    let dist1 = geodist({ lon: parseFloat(lon), lat: parseFloat(lat) }, { lon: parseFloat(lon1), lat: parseFloat(lat1) }, { exact: true, unit: 'km' });
                    let cToP = ((dist).toFixed(1)).toString();
                    let pToD = ((dist1).toFixed(1)).toString();
                    console.log("Current to pickup distance is===========>", cToP);
                    console.log("Pickup to dropoff distance is==============>", pToD)
                    result.docs[i].currentToPicupLocation = cToP;
                    result.docs[i].pickupToDropLocation = pToD;
                    result.docs[i].TotalOffer = result.docs[i].makeOfferByDeliveryPerson.length
                }
                console.log("Order List found successfully", result);
                return res.send({ status: 'SUCCESS', response_message: i18n.__("Order List found successfully"), Data: result })
            }
            else {
                console.log("Incorrect service type");
                return res.send({ status: 'FAILURE', response_message: "Something went wrong" })
            }
        } catch (error) {
            console.log("Error is=============>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //* Api name-Get all active order for normal user
    //* Features-Offer Data ,User data, Total Rating ,Average Rating,Current to pickup and picup to dropoff location calculated
    //* Request-langCode,lat,long,userId,token(In headers) Method-Post
    //* Description-This api is used for get all active orders for user

    //===============================================Get Normal user active order===========================//

    getNormalUserActiveOrder: async (req, res) => {

        try {
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            console.log("Request for get active order for normal user is========================>", req.body);
            if (!req.body.userId || !req.body.lat || !req.body.long || !req.headers.token) {
                console.log("User is missing");
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });;
            }
            let query = { $and: [{ "_id": req.body.userId }, { signupWithNormalPerson: 'true' }, { "jwtToken": req.headers.token }] }
            let checkUser = await User.findOne(query)
            if (!checkUser) {
                console.log("User id is incorrect");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            if (checkUser.status == 'INACTIVE') {
                console.log("Account disabled");
                res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") })
            }
            if (req.body.serviceType == 'DeliveryPersion') {
                let result = await ServiceModel.aggregate([
                    {
                        $match: {
                            $and: [
                                {
                                    $or: [
                                        { "status": "Active" },
                                        { "status": "Request" }
                                    ]
                                },
                                {
                                    "userId": ObjectId(req.body.userId)
                                },
                                { "serviceType": "DeliveryPersion" }
                            ]
                        }
                    },
                    {
                        $lookup: {
                            from: "makeaofferdeliverypeoples",
                            localField: "offerId",
                            foreignField: "_id",
                            as: "offerData"
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "offerAcceptedOfId",
                            foreignField: "_id",
                            as: "userData"
                        }
                    },
                    {
                        $unwind: {
                            path: "$userData",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $unwind: {
                            path: "$offerData",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    { "$sort": { "createdAt": -1 } },
                    {
                        "$project": {
                            _id: 1,
                            "status": 1,
                            "location": 1,
                            "userId": 1,
                            "offerId": 1,
                            "offerAcceptedStatus": 1,
                            "offerAcceptedOfId": 1,
                            "signupWithDeliveryPerson": 1,
                            "adminVerifyDeliveryPerson": 1,
                            "service": 1,
                            "serviceType": 1,
                            "pickupLocation": 1,
                            "pickupLat": 1,
                            "pickupLong": 1,
                            "dropOffLocation": 1,
                            "dropOffLat": 1,
                            "dropOffLong": 1,
                            "seletTime": 1,
                            "orderDetails": 1,
                            "orderNumber": 1,
                            "createdAt": 1,
                            "updatedAt": 1,
                            "userData.name": 1,
                            "userData.countryCode": 1,
                            "userData.mobileNumber": 1,
                            "userData.profilePic": 1,
                            "userData.gender": 1,
                            "userData.totalRating": 1,
                            "userData.avgRating": 1,
                            "realOrderId": 1,
                            "orderOwner": 1,
                            "apprxTime": 1,
                            "message": 1,
                            "minimumOffer": 1,
                            "offerMakeByName": 1,
                            "makeOfferById": 1,
                            "deliveryOffer": 1,
                            "tax": 1,
                            "total": 1,
                            "invoiceCreatedAt": 1,
                            "invoiceStatus": 1,
                            "offerData": 1,
                            "goStatus": 1,
                            "arrivedStatus": 1,
                            "workDoneStatus": 1,
                            "invoicePdf": 1,
                            "roomId": 1,
                            "popupStatus": 1,
                            portugueseCategoryName: 1,
                            portugueseSubCategoryName: 1,

                        }
                    },
                ])
                if (result.length == 0) {
                    console.log("No Data found", result);
                    return res.send({ status: "SUCCESS", response_message: i18n.__("No Data found"), Data1: result });
                }
                let data = JSON.stringify(result)
                let customData = JSON.parse(data)
                for (let i = 0; i < customData.length; i++) {
                    let lon = customData[i].location.coordinates[0]
                    let lat = customData[i].location.coordinates[1]
                    console.log("Lat and long in float is===============>", parseFloat(req.body.long), parseFloat(req.body.lat))
                    let dist = geodist({ lon: parseFloat(lon), lat: parseFloat(lat) }, { lon: parseFloat(req.body.long), lat: parseFloat(req.body.lat) }, { exact: true, unit: 'km' })
                    let lon1 = customData[i].location.coordinates1[0]
                    let lat1 = customData[i].location.coordinates1[1]
                    console.log("Lat and long in float is===============>", parseFloat(lon1), parseFloat(lat1))
                    let dist1 = geodist({ lon: parseFloat(lon), lat: parseFloat(lat) }, { lon: parseFloat(lon1), lat: parseFloat(lat1) }, { exact: true, unit: 'km' });
                    let cToP = (dist).toString();
                    let pToD = (dist1).toString();
                    console.log("Current to pickup distance is==============>", cToP);
                    console.log("Pickup to destination distance is===============>", pToD)
                    if (cToP.length >= 6) {
                        let cToP1 = cToP.substring(0, 6);
                        customData[i].currentToPicupLocation = cToP1;
                    }
                    else {
                        customData[i].currentToPicupLocation = cToP;
                    }
                    if (pToD.length >= 6) {
                        let pToD1 = pToD.substring(0, 6);
                        customData[i].pickupToDropLocation = pToD1;
                    }
                    else {
                        customData[i].pickupToDropLocation = pToD;
                    }
                    customData[i].TotalRating = customData[i].userData.totalRating
                    customData[i].AvgRating = customData[i].userData.avgRating
                    customData[i].offerAcceptedOfName = customData[i].userData.name
                    customData[i].offerAcceptedOfCountryCode = customData[i].userData.countryCode
                    customData[i].offerAcceptedOfMobileNumber = customData[i].userData.mobileNumber
                    customData[i].offerAcceptedOfProfilePic = customData[i].userData.profilePic
                    customData[i].offerAcceptedOfGender = customData[i].userData.gender
                    customData[i].minimumOffer = customData[i].offerData.minimumOffer
                    customData[i].message = customData[i].offerData.message
                    customData[i].apprxTime = customData[i].offerData.apprxTime
                    delete (customData[i].userData)
                    delete (customData[i].offerData)
                }
                console.log("Order List found successfully", customData);
                res.send({ status: 'SUCCESS', response_message: i18n.__("Order List found successfully") + right1, Data1: customData });

            }
            else if (req.body.serviceType == 'ProfessionalWorker') {
                let result = await ServiceModel.aggregate([
                    {
                        $match:
                        {
                            $and: [
                                {
                                    $or: [
                                        { "status": "Active" },
                                        { "status": "Request" }
                                    ]
                                },
                                {
                                    "userId": ObjectId(req.body.userId)
                                },
                                { "serviceType": "ProfessionalWorker" }
                            ]
                        }
                    },
                    {
                        $lookup: {
                            from: "makeaofferdeliverypeoples",
                            localField: "offerId",
                            foreignField: "_id",
                            as: "offerData"
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "offerAcceptedOfId",
                            foreignField: "_id",
                            as: "userData"
                        }
                    },
                    {
                        $unwind: {
                            path: "$userData",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $unwind: {
                            path: "$offerData",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    { "$sort": { "createdAt": -1 } },
                    {
                        "$project": {
                            _id: 1,
                            "status": 1,
                            "location": 1,
                            "userId": 1,
                            "offerId": 1,
                            "offerAcceptedStatus": 1,
                            "offerAcceptedOfId": 1,
                            "signupWithDeliveryPerson": 1,
                            "adminVerifyDeliveryPerson": 1,
                            "service": 1,
                            "serviceType": 1,
                            "pickupLocation": 1,
                            "pickupLat": 1,
                            "pickupLong": 1,
                            "dropOffLocation": 1,
                            "dropOffLat": 1,
                            "dropOffLong": 1,
                            "seletTime": 1,
                            "orderDetails": 1,
                            "orderNumber": 1,
                            "createdAt": 1,
                            "updatedAt": 1,
                            "userData.name": 1,
                            "userData.countryCode": 1,
                            "userData.mobileNumber": 1,
                            "userData.profilePic": 1,
                            "userData.gender": 1,
                            "userData.totalRating": 1,
                            "userData.avgRating": 1,
                            "realOrderId": 1,
                            "orderOwner": 1,
                            "apprxTime": 1,
                            "message": 1,
                            "minimumOffer": 1,
                            "offerMakeByName": 1,
                            "makeOfferById": 1,
                            "deliveryOffer": 1,
                            "tax": 1,
                            "total": 1,
                            "invoiceCreatedAt": 1,
                            "invoiceStatus": 1,
                            "offerData": 1,
                            "goStatus": 1,
                            "arrivedStatus": 1,
                            "workDoneStatus": 1,
                            "invoicePdf": 1,
                            "roomId": 1,
                            "currency": 1,
                            "popupStatus": 1,
                            "selectCategoryName": 1,
                            "selectSubCategoryName": 1,
                            "selectSubSubCategoryName": 1,
                            portugueseCategoryName: 1,
                            portugueseSubCategoryName: 1,
                        }
                    },
                ])
                if (result.length == 0) {
                    console.log("No Data found", result);
                    return res.send({ status: "SUCCESS", response_message: i18n.__("No Data found"), Data1: [] });
                }
                console.log("Result is===========>", result)
                let data = JSON.stringify(result)
                let customData = JSON.parse(data)
                for (let i = 0; i < customData.length; i++) {
                    let lon = customData[i].location.coordinates[0]
                    let lat = customData[i].location.coordinates[1]
                    console.log("Lat and long in float is===============>", parseFloat(req.body.long), parseFloat(req.body.lat))
                    let dist = geodist({ lon: parseFloat(lon), lat: parseFloat(lat) }, { lon: parseFloat(req.body.long), lat: parseFloat(req.body.lat) }, { exact: true, unit: 'km' })
                    let lon1 = customData[i].location.coordinates1[0]
                    let lat1 = customData[i].location.coordinates1[1]
                    console.log("Lat and long in float is===============>", parseFloat(lon1), parseFloat(lat1))
                    let dist1 = geodist({ lon: parseFloat(lon), lat: parseFloat(lat) }, { lon: parseFloat(lon1), lat: parseFloat(lat1) }, { exact: true, unit: 'km' });
                    let cToP = ((dist).toFixed(1)).toString();
                    let pToD = ((dist1).toFixed(1)).toString();
                    console.log("Current to pickup distance is==============>", cToP);
                    console.log("Pickup to destination distance is===============>", pToD)
                    customData[i].currentToPicupLocation = cToP;
                    customData[i].pickupToDropLocation = pToD;
                    customData[i].TotalRating = customData[i].userData.totalRating
                    customData[i].AvgRating = customData[i].userData.avgRating
                    customData[i].offerAcceptedOfName = customData[i].userData.name
                    customData[i].offerAcceptedOfCountryCode = customData[i].userData.countryCode
                    customData[i].offerAcceptedOfMobileNumber = customData[i].userData.mobileNumber
                    customData[i].offerAcceptedOfProfilePic = customData[i].userData.profilePic
                    customData[i].offerAcceptedOfGender = customData[i].userData.gender
                    customData[i].minimumOffer = customData[i].offerData.minimumOffer
                    customData[i].message = customData[i].offerData.message
                    customData[i].apprxTime = customData[i].offerData.apprxTime
                    delete (customData[i].userData)
                    delete (customData[i].offerData)
                }
                console.log("Order List found successfully", customData);
                res.send({ status: 'SUCCESS', response_message: i18n.__("Order List found successfully"), Data1: customData });

            }
            else {
                console.log("Incorrect service type");
                return res.send({ status: 'FAILURE', response_message: i18n.__("Something went wrong") })
            }
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //============================================Delivery person apis======================================//

    //* Api name-Get all new order for delivery person
    //* Request-langCode,userId,lat,long,token
    //* Features-Only today order will come.
    //* Description-This api is used for get all new order for delivery person

    //========================================Get new order for delivery persion============================//

    getNewOrderForDeliveryPerson: async (req, res) => {

        try {
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            console.log("Yesterday date is============>", new Date(new Date().setHours(0, 0, 0, 0) - 1));
            console.log("Request for get new order for delivery person is========================>", req.body);
            if (!req.body.userId || !req.body.lat || !req.body.long || !req.headers.token) {
                console.log("Field is missing");
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });;
            }
            let query = { $and: [{ "_id": req.body.userId }, { adminVerifyDeliveryPerson: 'true' }, { signupWithDeliveryPerson: 'true' }, { "jwtToken": req.headers.token }] }
            let checkUser = await User.findOne(query)
            if (!checkUser) {
                console.log("You are not a delivery person");
                return res.send({ status: "FAILURE", response_message: i18n.__("Invalid Token") });
            }
            if (checkUser.status == 'INACTIVE') {
                console.log("Account disabled");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") })
            }
            let result = await ServiceModel.aggregate([
                {
                    $geoNear: {
                        near: { type: "Point", coordinates: [parseFloat(req.body.long), parseFloat(req.body.lat)] },
                        key: "location",
                        spherical: true,
                        maxDistance: 50000000000000000000,
                        distanceField: "dist.calculated",
                        includeLocs: "locs",
                    },

                },
                {
                    $match: {
                        $and: [{ "makeOfferByDeliveryPerson.makeOfferById": { $ne: ObjectId(req.body.userId) } },
                        {
                            "userId": { $ne: ObjectId(req.body.userId) }
                        },
                        { "signupWithNormalPerson": "true" },
                        { "serviceType": "DeliveryPersion" },
                        { "status": "Pending" },
                        { deleteStatus: false }
                        ]
                    }
                },
                { $match: { createdAt: { $gt: new Date(new Date().setHours(0, 0, 0, 0) - 1), $lt: new Date() } } },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "userData"
                    }
                },
                {
                    $unwind: {
                        path: "$userData",
                        preserveNullAndEmptyArrays: true
                    }
                },
                { "$sort": { "createdAt": -1 } },
                {
                    "$project": {
                        _id: 1,
                        "status": 1,
                        "location": 1,
                        "invoiceStatus": 1,
                        "userId": 1,
                        "workDoneStatus": 1,
                        "arrivedStatus": 1,
                        "signupWithNormalPerson": 1,
                        "signupWithProfessionalWorker": 1,
                        "adminVerifyProfessionalWorker": 1,
                        "signupWithDeliveryPerson": 1,
                        "adminVerifyDeliveryPerson": 1,
                        "service": 1,
                        "serviceType": 1,
                        "pickupLocation": 1,
                        "pickupLat": 1,
                        "pickupLong": 1,
                        "dropOffLocation": 1,
                        "dropOffLat": 1,
                        "dropOffLong": 1,
                        "seletTime": 1,
                        "orderDetails": 1,
                        "orderNumber": 1,
                        "createdAt": 1,
                        "updatedAt": 1,
                        "userData.name": 1,
                        "userData.countryCode": 1,
                        "userData.mobileNumber": 1,
                        "userData.profilePic": 1,
                        "userData.gender": 1,
                        "userData.totalRating": 1,
                        "userData.avgRating": 1,
                        "realOrderId": 1
                    }
                },
            ])
            if (result.length == 0) {
                console.log("No Data found", result);
                return res.send({ status: "SUCCESS", response_message: i18n.__("No Data found"), Data1: result });
            }
            let data = JSON.stringify(result)
            let customData = JSON.parse(data)
            for (let i = 0; i < customData.length; i++) {
                let lon = customData[i].location.coordinates[0]
                let lat = customData[i].location.coordinates[1]
                console.log("Lat and long in float is===============>", parseFloat(req.body.long), parseFloat(req.body.lat))
                let dist = geodist({ lon: parseFloat(lon), lat: parseFloat(lat) }, { lon: parseFloat(req.body.long), lat: parseFloat(req.body.lat) }, { exact: true, unit: 'km' })
                let lon1 = customData[i].location.coordinates1[0]
                let lat1 = customData[i].location.coordinates1[1]
                console.log("Lat and long in float is===============>", parseFloat(lon1), parseFloat(lat1))
                let dist1 = geodist({ lon: parseFloat(lon), lat: parseFloat(lat) }, { lon: parseFloat(lon1), lat: parseFloat(lat1) }, { exact: true, unit: 'km' });
                let cToP = (dist).toString();
                let pToD = (dist1).toString();
                console.log("Current to pickup distance is==============>", cToP);
                console.log("Pickup to destination distance is===============>", pToD)
                if (cToP.length >= 6) {
                    let cToP1 = cToP.substring(0, 6);
                    customData[i].currentToPicupLocation = cToP1;
                }
                else {
                    customData[i].currentToPicupLocation = cToP;
                }
                if (pToD.length >= 6) {
                    let pToD1 = pToD.substring(0, 6);
                    customData[i].pickupToDropLocation = pToD1;
                }
                else {
                    customData[i].pickupToDropLocation = pToD;
                }
                customData[i].TotalRating = customData[i].userData.totalRating
                customData[i].AvgRating = customData[i].userData.avgRating
                customData[i].name = customData[i].userData.name
                customData[i].countryCode = customData[i].userData.countryCode
                customData[i].mobileNumber = customData[i].userData.mobileNumber
                customData[i].profilePic = customData[i].userData.profilePic
                customData[i].gender = customData[i].userData.gender
                delete (customData[i].userData)
            }
            console.log("Order List found successfully", customData);
            return res.send({ status: 'SUCCESS', response_message: i18n.__("Order List found successfully") + right1, Data1: customData });
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //* Api name-Get all pending order for delivery person
    //* Request-langCode,userId,lat,long,token
    //* Features-Only offered order will come.
    //* Description-This api is used for get all pending order for delivery person

    //========================================Get pending order for delivery person========================//

    getPendingOrderDeliveryPerson: async (req, res) => {

        try {
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            console.log("Request for get pending order for delivery person is========================>", req.body);
            if (!req.body.userId || !req.body.lat || !req.body.long || !req.headers.token) {
                console.log("Field is missing");
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });;
            }
            let query = { $and: [{ "_id": req.body.userId }, { "adminVerifyDeliveryPerson": 'true' }, { "jwtToken": req.headers.token }] }
            let checkUser = await User.findOne(query)
            if (!checkUser) {
                console.log("You are not a delivery person");
                return res.send({ status: "FAILURE", response_message: i18n.__("Invalid Token") });
            }
            if (checkUser.status == 'INACTIVE') {
                console.log("Account disabled");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") })
            }
            let result = await MakeAOfferDeliveryPerson.aggregate([
                {
                    $match: {
                        $and: [
                            { "makeOfferById": ObjectId(req.body.userId) },
                            { "status": "Pending" },
                            { "serviceType": "DeliveryPersion" }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "orderOwner",
                        foreignField: "_id",
                        as: "userData"
                    }
                },
                {
                    $unwind: {
                        path: "$userData",
                        preserveNullAndEmptyArrays: true
                    }
                },
                { "$sort": { "createdAt": -1 } },
                {
                    "$project": {
                        _id: 1,
                        "status": 1,
                        "location": 1,
                        "signupWithDeliveryPerson": 1,
                        "adminVerifyDeliveryPerson": 1,
                        "service": 1,
                        "serviceType": 1,
                        "pickupLocation": 1,
                        "pickupLat": 1,
                        "pickupLong": 1,
                        "dropOffLocation": 1,
                        "dropOffLat": 1,
                        "dropOffLong": 1,
                        "seletTime": 1,
                        "orderDetails": 1,
                        "orderNumber": 1,
                        "createdAt": 1,
                        "updatedAt": 1,
                        "userData.name": 1,
                        "userData.countryCode": 1,
                        "userData.mobileNumber": 1,
                        "userData.profilePic": 1,
                        "userData.gender": 1,
                        "userData.totalRating": 1,
                        "userData.avgRating": 1,
                        "realOrderId": 1,
                        "orderOwner": 1,
                        "apprxTime": 1,
                        "message": 1,
                        "minimumOffer": 1,
                        "offerMakeByName": 1,
                        "makeOfferById": 1,
                        "deliveryOffer": 1,
                        "tax": 1,
                        "total": 1,
                        "invoiceCreatedAt": 1,
                        "invoiceStatus": 1,
                        "goStatus": 1
                    }
                },
            ])
            if (result.length == 0) {
                console.log("No Data found", result);
                return res.send({ status: "SUCCESS", response_message: i18n.__("No Data found"), Data1: result });
            }
            let data = JSON.stringify(result)
            let customData = JSON.parse(data)
            for (let i = 0; i < customData.length; i++) {
                let lon = customData[i].location.coordinates[0]
                let lat = customData[i].location.coordinates[1]
                console.log("Lat and long in float is===============>", parseFloat(req.body.long), parseFloat(req.body.lat))
                let dist = geodist({ lon: parseFloat(lon), lat: parseFloat(lat) }, { lon: parseFloat(req.body.long), lat: parseFloat(req.body.lat) }, { exact: true, unit: 'km' })
                let lon1 = customData[i].location.coordinates1[0]
                let lat1 = customData[i].location.coordinates1[1]
                console.log("Lat and long in float is===============>", parseFloat(lon1), parseFloat(lat1))
                let dist1 = geodist({ lon: parseFloat(lon), lat: parseFloat(lat) }, { lon: parseFloat(lon1), lat: parseFloat(lat1) }, { exact: true, unit: 'km' });
                let cToP = (dist).toString();
                let pToD = (dist1).toString();
                console.log("Current to pickup distance is==============>", cToP);
                console.log("Pickup to destination distance is===============>", pToD)
                if (cToP.length >= 6) {
                    let cToP1 = cToP.substring(0, 6);
                    customData[i].currentToPicupLocation = cToP1;
                }
                else {
                    customData[i].currentToPicupLocation = cToP;
                }
                if (pToD.length >= 6) {
                    let pToD1 = pToD.substring(0, 6);
                    customData[i].pickupToDropLocation = pToD1;
                }
                else {
                    customData[i].pickupToDropLocation = pToD;
                }
                customData[i].TotalRating = customData[i].userData.totalRating
                customData[i].AvgRating = customData[i].userData.avgRating
                customData[i].name = customData[i].userData.name
                customData[i].countryCode = customData[i].userData.countryCode
                customData[i].mobileNumber = customData[i].userData.mobileNumber
                customData[i].profilePic = customData[i].userData.profilePic
                customData[i].gender = customData[i].userData.gender
                delete (customData[i].userData)
            }
            console.log("Order List found successfully", customData);
            return res.send({ status: 'SUCCESS', response_message: i18n.__("Order List found successfully") + right1, Data1: customData });
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") + cross1 });
        }
    },

    //* Api name-Get all active order for delivery person
    //* Request-langCode,userId,lat,long,token
    //* Features-Only accepted offer by normal user order will come.
    //* Description-This api is used for get all active order for delivery person

    //==============================================Get active order delivery person==========================//

    getActiveOrderDeliveryPerson: async (req, res) => {

        try {
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            console.log("Request for get active order for delivery person is========================>", req.body);
            if (!req.body.userId || !req.body.lat || !req.body.long || !req.headers.token) {
                console.log("Filed is missing");
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });;
            }
            let query = { $and: [{ "_id": req.body.userId }, { adminVerifyDeliveryPerson: 'true' }, { signupWithDeliveryPerson: 'true' }, { "jwtToken": req.headers.token }] }
            let checkUser = await User.findOne(query)
            if (!checkUser) {
                console.log("You are not a delivery person");
                return res.send({ status: "FAILURE", response_message: i18n.__("Invalid Token") });
            }
            if (checkUser.status == 'INACTIVE') {
                console.log("Account disabled");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") })
            }
            let result = await MakeAOfferDeliveryPerson.aggregate([
                {
                    $match:

                    {
                        $and: [
                            {
                                $or: [
                                    {
                                        status: 'Active'
                                    },
                                    {
                                        status: 'Request'
                                    }
                                ]
                            },
                            {
                                makeOfferById: ObjectId(req.body.userId)
                            },
                            {
                                serviceType: 'DeliveryPersion'
                            }

                        ]
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "offerAcceptedById",
                        foreignField: "_id",
                        as: "userData"
                    }
                },
                {
                    $unwind: {
                        path: "$userData",
                        preserveNullAndEmptyArrays: true
                    }
                },
                { "$sort": { "createdAt": -1 } },
                {
                    "$project": {
                        _id: 1,
                        "status": 1,
                        "location": 1,
                        "signupWithDeliveryPerson": 1,
                        "adminVerifyDeliveryPerson": 1,
                        "deliveryOffer": 1,
                        "tax": 1,
                        "total": 1,
                        "invoiceCreatedAt": 1,
                        "invoiceStatus": 1,
                        "service": 1,
                        "serviceType": 1,
                        "pickupLocation": 1,
                        "pickupLat": 1,
                        "pickupLong": 1,
                        "dropOffLocation": 1,
                        "dropOffLat": 1,
                        "dropOffLong": 1,
                        "seletTime": 1,
                        "orderDetails": 1,
                        "orderNumber": 1,
                        "offerMakeByName": 1,
                        "minimumOffer": 1,
                        "message": 1,
                        "apprxTime": 1,
                        "name": 1,
                        "profilePic": 1,
                        "countryCode": 1,
                        "mobileNumber": 1,
                        "createdAt": 1,
                        "updatedAt": 1,
                        "offerAcceptedStatus": 1,
                        "userData.name": 1,
                        "userData.countryCode": 1,
                        "userData.mobileNumber": 1,
                        "userData.profilePic": 1,
                        "userData.gender": 1,
                        "userData.totalRating": 1,
                        "userData.avgRating": 1,
                        "offerAcceptedById": 1,
                        "orderOwner": 1,
                        "realOrderId": 1,
                        "goStatus": 1,
                        "arrivedStatus": 1,
                        "workDoneStatus": 1,
                        "roomId": 1,
                        "popupStatus": 1
                    }
                },
            ])
            if (result.length == 0) {
                console.log("No Data found", result);
                return res.send({ status: "SUCCESS", response_message: i18n.__("No Data found"), Data1: result });
            }
            let data = JSON.stringify(result)
            let customData = JSON.parse(data)
            for (let i = 0; i < customData.length; i++) {
                let lon = customData[i].location.coordinates[0]
                let lat = customData[i].location.coordinates[1]
                console.log("Lat and long in float is===============>", parseFloat(req.body.long), parseFloat(req.body.lat))
                let dist = geodist({ lon: parseFloat(lon), lat: parseFloat(lat) }, { lon: parseFloat(req.body.long), lat: parseFloat(req.body.lat) }, { exact: true, unit: 'km' })
                let lon1 = customData[i].location.coordinates1[0]
                let lat1 = customData[i].location.coordinates1[1]
                console.log("Lat and long in float is===============>", parseFloat(lon1), parseFloat(lat1))
                let dist1 = geodist({ lon: parseFloat(lon), lat: parseFloat(lat) }, { lon: parseFloat(lon1), lat: parseFloat(lat1) }, { exact: true, unit: 'km' });
                let cToP = (dist).toString();
                let pToD = (dist1).toString();
                console.log("Current to pickup distance is==============>", cToP);
                console.log("Pickup to destination distance is===============>", pToD)
                if (cToP.length >= 6) {
                    let cToP1 = cToP.substring(0, 6);
                    customData[i].currentToPicupLocation = cToP1;
                }
                else {
                    customData[i].currentToPicupLocation = cToP;
                }
                if (pToD.length >= 6) {
                    let pToD1 = pToD.substring(0, 6);
                    customData[i].pickupToDropLocation = pToD1;
                }
                else {
                    customData[i].pickupToDropLocation = pToD;
                }
                customData[i].TotalRating = customData[i].userData.totalRating
                customData[i].AvgRating = customData[i].userData.avgRating
                customData[i].offerAcceptedByName = customData[i].userData.name
                customData[i].offerAcceptedByCountryCode = customData[i].userData.countryCode
                customData[i].offerAcceptedByMobileNumber = customData[i].userData.mobileNumber
                customData[i].offerAcceptedByProfilePic = customData[i].userData.profilePic
                customData[i].offerAcceptedByGender = customData[i].userData.gender
                delete (customData[i].userData)
            }
            console.log("Order List found successfully", customData);
            return res.send({ status: 'SUCCESS', response_message: i18n.__("Order List found successfully") + right1, Data1: customData });
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") + cross1 });
        }
    },

    //* Api name-Make offer
    //* Features-This api is uesd for delivery and professional worker both ,Notification will send
    //* Request-langCode,userId,orderId,minimumOffer,message,apprxTime
    //* Description-This api is used for make a offer on normal user's order by delivery and professional worker

    //===========================================Make a offer==================================================//

    makeOffer: async (req, res) => {

        try {
            console.log("Request for make a offer by delivery person is==========>", req.body, req.headers.token);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            if (!req.body.userId || !req.headers.token || !req.body.orderId) {
                console.log("Fields are missing");
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });;
            }
            let result = await ServiceModel.findOne({ "_id": req.body.orderId })
            if (!result) {
                console.log("Order Id is incoorect");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            if (result.status == "Cancel" || result.status == "Complete" || result.status == 'Active' || result.status == 'Request') {
                console.log("Oops! This order has been taken by another captain.");
                return res.send({ status: "FAILURE", response_message: i18n.__("Oops! order is not available at this moment") });
            }
            let query = { $and: [{ "_id": req.body.userId }, { "adminVerifyDeliveryPerson": "true" }, { "jwtToken": req.headers.token }] }
            let result3 = await User.findOne(query)
            if (!result3) {
                console.log("You are not a delivery person");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            if (result3.status == 'INACTIVE') {
                console.log("Account disabled");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") })
            }
            if (Number(req.body.minimumOffer) < 10) {
                console.log("Minimum offer limit not match");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your minimum offer limit is 10") })
            }
            let myQuery = {
                $and: [
                    {
                        $or: [
                            { "status": "Active" },
                            { "status": "Request" }
                        ]
                    },
                    { "makeOfferById": req.body.userId },
                    { "serviceType": 'DeliveryPersion' }
                ]
            }
            let checkCurrentOrder = await MakeAOfferDeliveryPerson.findOne(myQuery)
            if (checkCurrentOrder) {
                console.log("You can not make new offer because you have already a order");
                return res.send({ status: "FAILURE", response_message: i18n.__("You can not make new offer because you have already a active order") })
            }
            let d1 = new Date(),
                d2 = new Date(d1);
            d2.setMinutes(d1.getMinutes() + 20);
            let obj = new MakeAOfferDeliveryPerson({

                "service": result.service,
                "serviceType": result.serviceType,
                "pickupLocation": result.pickupLocation,
                "pickupLat": result.pickupLat,
                "pickupLong": result.pickupLong,
                "dropOffLocation": result.dropOffLocation,
                "dropOffLat": result.dropOffLat,
                "dropOffLong": result.dropOffLong,
                "seletTime": result.seletTime,
                "orderDetails": result.orderDetails,
                "orderNumber": result.orderNumber,
                "price": result.price,
                "location": result.location,
                "makeOfferById": req.body.userId,
                "offerMakeByName": result3.name,
                "minimumOffer": req.body.minimumOffer,
                "message": req.body.message,
                "apprxTime": req.body.apprxTime,
                "orderOwner": result.userId,
                "realOrderId": req.body.orderId,
                "loc": result.loc,
                "time": d2,
                "popupStatus": 'Show',
                "currency": result.currency,
                portugueseCategoryName: result.portugueseCategoryName,
                portugueseSubCategoryName: result.portugueseSubCategoryName,
                selectCategoryName: result.selectCategoryName,
                selectSubCategoryName: result.selectSubCategoryName,
                "deliveryOffer": req.body.minimumOffer,
                "tax": (Number(req.body.minimumOffer) * 0.05).toFixed(2).toString(),
                "total": ((Math.round(Number(req.body.minimumOffer) * 0.05)) + (Number(req.body.minimumOffer))).toFixed(2).toString()
            })
            let result4 = await obj.save()
            console.log("Result 4 is==========>", result4)
            let obj1 = [{
                "makeOfferById": req.body.userId,
                "minimumOffer": req.body.minimumOffer,
                "message": req.body.message,
                "apprxTime": req.body.apprxTime,

            }]
            let result5 = await ServiceModel.findByIdAndUpdate({ "_id": req.body.orderId }, { $push: { makeOfferByDeliveryPerson: obj1 } }, { new: true })
            let result2 = await User.findOne({ "_id": result5.userId })
            if (!result2) {
                console.log("Offer submitted successfully");
                return res.send({ status: "SUCCESS", response_message: i18n.__("Offer submitted successfully"), Data: result4 })
            }
            console.log("Offer submitted successfully");
            res.send({ status: "SUCCESS", response_message: i18n.__("Offer submitted successfully"), Data: result4 })
            let notiTitle = "New Offer Available"
            let notiMessage = `Hi ${result2.name}! New Offer is now available on your order number ${result.orderNumber} offered by ${result3.name}.`
            if (result2.appLanguage == "Portuguese") {
                notiTitle = "Nova Oferta Disponível"
                notiMessage = `Oi ${result2.name}! Foi enviada uma proposta para o seu pedido ${result.orderNumber} proposto por ${result3.name}.`
            }
            let notiobj = new Notification({
                notiTo: result5.userId,
                notiTitle: notiTitle,
                notiMessage: notiMessage,
                notiTime: Date.now(),
                notificationType: `makeOfferByDeliveryPerson`

            })
            let result6 = await notiobj.save()
            console.log("Notification data is===========>", result6);
            let notiType = ''
            if (result.serviceType == 'DeliveryPersion') {
                notiType = "offerAvailable"
            }
            if (result.serviceType == "ProfessionalWorker") {
                notiType = "offerAvailableProfessional"
            }
            if (result2.deviceType == 'android' && result2.normalUserNotification == true) {
                func.sendNotificationForAndroid(result2.deviceToken, notiobj.notiTitle, notiobj.notiMessage, notiType, (error10, result10) => {
                    console.log("Notification Sent");
                    return;
                })
            }
            if (result2.deviceType == 'iOS' && result2.normalUserNotification == true) {
                let query2 = { $and: [{ "notiTo": result5.userId }, { "isSeen": "false" }] }
                Notification.find(query2, (error12, result12) => {
                    if (error12) {
                        console.log("Error 12 is=========>", error12);
                    }
                    else {
                        let badgeCount = result12.length;
                        console.log("Badge count is=========>", badgeCount);
                        func.sendiosNotificationProvider(result2.deviceToken, notiobj.notiTitle, notiobj.notiMessage, badgeCount, notiType, (error10, result10) => {
                            console.log("Notification Sent");
                            return;
                        })
                    }
                })
            }


        } catch (error) {
            console.log("Error is==========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") + cross1 });
        }
    },

    //* Api name-Work done by delivery person
    //* Features-This api is used for work done by delivery person and professional worker,Notification will send
    //* Request-langCode,userId,token,orderId
    //* Description-This api is used for work done by delivery and professional worker

    //===========================================Work done by delivery person======================================//

    workDoneByDeliveryPerson: async (req, res) => {

        try {
            console.log("Request for work done by delivery person is=====================>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            if (!req.body.userId || !req.headers.token || !req.body.orderId) {
                console.log("User is missing");
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });;
            }
            let query = { $and: [{ "_id": req.body.userId }, { "adminVerifyDeliveryPerson": "true" }, { "jwtToken": req.headers.token }] }
            let result1 = await User.findOne(query)
            if (!result1) {
                console.log("User id is incorrect");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            if (result1.status == 'INACTIVE') {
                console.log("Account disabled");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") })
            }
            let query1 = {
                $and: [
                    {
                        $or: [
                            { "status": "Active" },
                            { "status": "Request" }
                        ]
                    },
                    { "_id": req.body.orderId }
                ]
            }
            let result2 = await MakeAOfferDeliveryPerson.findOne(query1)
            if (!result2) {
                console.log("Order id is incorrect");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            let currentOrder = await ServiceModel.findOne({ _id: result2.realOrderId })
            if (currentOrder.status == 'Cancel') {
                let updateOffer = await MakeAOfferDeliveryPerson.findByIdAndUpdate({ _id: req.body.orderId }, { $set: { status: 'Cancel' } }, { new: true })
                console.log("Offer update==========>", updateOffer)
                console.log("Oops! order is not available at this moment.");
                return res.send({ status: "FAILURE", response_message: i18n.__("Oops! order is not available at this moment") });
            }
            let d1 = new Date(),
                d2 = new Date(d1);
            d2.setMinutes(d1.getMinutes() + 240);
            let query2 = {
                $and: [
                    {
                        $or: [
                            { "status": "Active" },
                            { "status": "Request" }
                        ]
                    },
                    { "_id": result2.realOrderId }
                ]
            }
            let result4 = await ServiceModel.findOneAndUpdate(query2, { $set: { status: "Complete", workDoneById: req.body.userId, "minimumOffer": result2.minimumOffer, workDoneStatus: "true", pastOrderTime: d2 } }, { new: true })
            if (!result4) {
                console.log("Order is not active");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            let k1 = new Date(),
                k2 = new Date(k1);
            k2.setMinutes(k1.getMinutes() + 240);
            let result3 = await MakeAOfferDeliveryPerson.findOneAndUpdate(query1, { $set: { status: "Complete", workDoneStatus: "true", pastOrderTime: k2 } }, { new: true })
            console.log("Result 3 is==============>", result3);
            let result6 = await User.findOne({ "_id": result4.userId })
            if (!result6) {
                console.log("Congratulation! Work done", result4);
                return res.send({ status: "SUCCESS", response_message: i18n.__("Congratulation! Work done") + right1, response: result4 })
            }
            let notiTitle = 'Work done'
            let notiMessage = `Hi, Congratulation ! Your order number ${result4.orderNumber} has been delivered now by ${result1.name}.Please submit your feedback for better service`
            if (result6.appLanguage == "Portuguese") {
                notiTitle = 'Trabalho feito'
                notiMessage = `Olá, parabéns! Seu trabalho relativo o pedido número ${result4.orderNumber} foi concluído agora por ${result1.name}.Envie sua opinião para melhorarmos os serviços oferecido`
            }

            let notiobj = new Notification({
                notiTo: result4.userId,
                notiTitle: notiTitle,
                notiMessage: notiMessage,
                notiTime: Date.now(),
                notificationType: `workDoneByDeliveryPerson`

            })
            let result5 = await notiobj.save()
            let obj = {
                deliveryUserId: req.body.userId,
                orderId: req.body.orderId,
                type: 'Delivery'
            }
            console.log("Notification data is============>", result5);
            console.log("Congratulation! Work done", result4);
            res.send({ status: "SUCCESS", response_message: i18n.__("Congratulation! Work done") + right1, response: result4 })
            if (result6.deviceType == 'android' && result6.normalUserNotification == true) {
                func.sendNotificationForAndroidWorkDone(result6.deviceToken, notiTitle, notiMessage, "workDoneByDP", `${req.body.userId}`, `${req.body.orderId}`, (error10, result10) => {
                    console.log("Notification Sent");
                    return;
                })
            }
            if (result6.deviceType == 'iOS' && result6.normalUserNotification == true) {
                let query2 = { $and: [{ "notiTo": result4.userId }, { "isSeen": "false" }] }
                Notification.find(query2, (error12, result12) => {
                    if (error12) {
                        console.log("Error 12 is=========>", error12);
                    }
                    else {
                        let badgeCount = result12.length;
                        console.log("Badge count is=========>", badgeCount);
                        func.sendiosNotificationWorkDone(result6.deviceToken, notiTitle, notiMessage, badgeCount, "workDoneByDP", obj, (error10, result10) => {
                            console.log("Notification Sent");
                            return;
                        })
                    }
                })
            }
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") + cross1 });
        }
    },

    //* Api name-Order cancel
    //* Features-Api is for normal user,delivery person and professional worker also,Notification will be send
    //* Request-langCode,userId,orderId,orderIssueMessage,orderIssueReason
    //* Description-This api is used for cancel order by all users

    //==============================================Order Cancel==========================================//

    orderCancel: (req, res) => {

        console.log("Request for order cancel by normal user or delivery person is=============>", req.body);
        var i18n = new i18n_module(req.body.langCode, configs.langFile);
        if (!req.body.userId || !req.headers.token || !req.body.orderId) {
            console.log("User is missing");
            return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });;
        }
        else {
            let query2 = { $and: [{ "_id": req.body.userId }, { "jwtToken": req.headers.token }] }
            User.findOne(query2, (error, result) => {
                if (error) {
                    console.log("Error is==========>", error);
                    return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
                }
                else if (!result) {
                    console.log("Invalid user Id");
                    return res.send({ status: "FAILURE", response_message: i18n.__("Invalid Token") });
                }
                else if (result.status == 'INACTIVE') {
                    console.log("Account disabled");
                    return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") })
                }
                else {
                    let query = { $and: [{ "_id": req.body.orderId }, { "userId": req.body.userId }] }
                    ServiceModel.findOne(query, (error1, result1) => {
                        if (error1) {
                            console.log("Error 1 is==========>", error1);
                            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
                        }
                        else if (!result1) {
                            let query1 = { $and: [{ "_id": req.body.orderId }, { "makeOfferById": req.body.userId }] }
                            MakeAOfferDeliveryPerson.findOne(query1, (error1, result1) => {
                                if (error1) {
                                    console.log("Error 1 is==========>", error1);
                                    return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });

                                }
                                else if (!result1) {
                                    console.log("Order id is incorrect");
                                    return res.send({ status: "FAILURE", response_message: "Invalid Token" });
                                }
                                else {
                                    MakeAOfferDeliveryPerson.findByIdAndUpdate({ "_id": req.body.orderId }, { $set: { "status": 'Cancel', "orderCanelReason": req.body.orderCanelReason, "orderCancelMessage": req.body.orderCancelMessage } }, { new: true }, (error2, result2) => {
                                        if (error2) {
                                            console.log("Error 2 is=============>", error2);
                                            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
                                        }
                                        else {
                                            if (result1.status == 'Pending') {
                                                ServiceModel.findOneAndUpdate({ "_id": result2.realOrderId, "makeOfferByDeliveryPerson.makeOfferById": req.body.userId }, { $pull: { makeOfferByDeliveryPerson: { makeOfferById: req.body.userId } } }, { safe: true, new: true }, (error3, result3) => {
                                                    if (error3) {
                                                        console.log("Error is==========>", error3)
                                                        return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") })
                                                    }
                                                    else {
                                                        User.findOne({ "_id": result2.orderOwner }, (error5, result5) => {
                                                            if (error5) {
                                                                console.log("Error 5 is=========>", error5);
                                                                return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
                                                            }
                                                            else {

                                                                let notiTitle = "Oops ! Order Cancelled"
                                                                let notiMessage = `Hi, your order number ${result2.orderNumber} has been cancelled successfully.`
                                                                if (result5.appLanguage == "Portuguese") {
                                                                    notiTitle = "Opa! Pedido foi cancelado"
                                                                    notiMessage = `Oi, Seu número de pedido ${result2.orderNumber} foi cancelado com sucesso.`
                                                                }
                                                                let notiObj = new Notification({
                                                                    "notiTo": result2.orderOwner,
                                                                    "notiTitle": notiTitle,
                                                                    "notiTime": Date.now(),
                                                                    "notiMessage": notiMessage
                                                                })
                                                                notiObj.save((error4, result4) => {
                                                                    if (error4) {
                                                                        console.log("Error 4 is===========>", error4);
                                                                        return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });

                                                                    }
                                                                    else {
                                                                        console.log("Notification data is===========>", result4);
                                                                        console.log("Order canceled successfully", result2);
                                                                        console.log("Pull data is============>", result3);
                                                                        res.send({ status: 'SUCCESS', response_message: i18n.__("Order canceled successfully") + right1, response: result2 });
                                                                        if (result5.deviceType == 'android' && result5.normalUserNotification == true) {
                                                                            func.sendNotificationForAndroid(result5.deviceToken, notiObj.notiTime, notiObj.notiMessage, "orderCancel", (error10, result10) => {
                                                                                if (error10) {
                                                                                    console.log("Error 10 is=========>", error10);
                                                                                }
                                                                                else {
                                                                                    console.log("Send notification is=============>", result10);
                                                                                }
                                                                            })
                                                                        }
                                                                        if (result5.deviceType == 'iOS' && result5.normalUserNotification == true) {
                                                                            let query2 = { $and: [{ "notiTo": result2.orderOwner }, { "isSeen": "false" }] }
                                                                            Notification.find(query2, (error12, result12) => {
                                                                                if (error12) {
                                                                                    console.log("Error 12 is=========>", error12);
                                                                                }
                                                                                else {
                                                                                    let badgeCount = result12.length;
                                                                                    console.log("Badge count is=========>", badgeCount);
                                                                                    func.sendiosNotificationProvider(result5.deviceToken, notiObj.notiTitle, notiObj.notiMessage, badgeCount, "orderCancel", (error10, result10) => {
                                                                                        if (error10) {
                                                                                            console.log("Error 10 is=========>", error10);
                                                                                        }
                                                                                        else {
                                                                                            console.log("Send notification is=============>", result10);
                                                                                        }
                                                                                    })
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
                                                ServiceModel.findByIdAndUpdate({ "_id": result2.realOrderId }, { $set: { status: "Cancel", "orderCanelReason": req.body.orderCanelReason, "orderCancelMessage": req.body.orderCancelMessage } }, { new: true }, (error3, result3) => {
                                                    if (error3) {
                                                        console.log("Error is==========>", error3)
                                                        return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") + cross1 })

                                                    }
                                                    else {
                                                        User.findOne({ "_id": result2.orderOwner }, (error5, result5) => {
                                                            if (error5) {
                                                                console.log("Error 5 is=========>", error5);
                                                                return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") + cross1 });
                                                            }
                                                            else {

                                                                let notiTitle = "Oops ! Order Cancelled"
                                                                let notiMessage = `Hi, your order number ${result2.orderNumber} has been cancelled successfully.`
                                                                if (result5.appLanguage == "Portuguese") {
                                                                    notiTitle = "Opa! Pedido foi cancelado"
                                                                    notiMessage = `Oi, Seu número de pedido ${result2.orderNumber} foi cancelado com sucesso.`
                                                                }

                                                                let notiObj = new Notification({
                                                                    "notiTo": result2.orderOwner,
                                                                    "notiTitle": notiTitle,
                                                                    "notiTime": Date.now(),
                                                                    "notiMessage": notiMessage
                                                                })
                                                                notiObj.save((error4, result4) => {
                                                                    if (error4) {
                                                                        console.log("Error 4 is===========>", error4);
                                                                        return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") + cross1 });

                                                                    }
                                                                    else {
                                                                        console.log("Notification data is===========>", result4);
                                                                        console.log("Order canceled successfully", result2);
                                                                        res.send({ status: 'SUCCESS', response_message: i18n.__("Order canceled successfully") + right1, response: result2 });
                                                                        if (result5.deviceType == 'android' && result5.normalUserNotification == true) {
                                                                            func.sendNotificationForAndroid(result5.deviceToken, notiObj.notiTitle, notiObj.notiMessage, "orderCancel", (error10, result10) => {
                                                                                if (error10) {
                                                                                    console.log("Error 10 is=========>", error10);
                                                                                }
                                                                                else {
                                                                                    console.log("Send notification is=============>", result10);
                                                                                }
                                                                            })
                                                                        }
                                                                        if (result5.deviceType == 'iOS' && result5.normalUserNotification == true) {
                                                                            let query2 = { $and: [{ "notiTo": result2.orderOwner }, { "isSeen": "false" }] }
                                                                            Notification.find(query2, (error12, result12) => {
                                                                                if (error12) {
                                                                                    console.log("Error 12 is=========>", error12);
                                                                                }
                                                                                else {
                                                                                    let badgeCount = result12.length;
                                                                                    console.log("Badge count is=========>", badgeCount);
                                                                                    func.sendiosNotificationProvider(result5.deviceToken, notiObj.notiTitle, notiObj.notiMessage, badgeCount, "orderCancel", (error10, result10) => {
                                                                                        if (error10) {
                                                                                            console.log("Error 10 is=========>", error10);
                                                                                        }
                                                                                        else {
                                                                                            console.log("Send notification is=============>", result10);
                                                                                        }
                                                                                    })
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
                        }
                        else {
                            if (result1.status == 'Complete') {
                                console.log("Oops! order is not available at this moment.");
                                return res.send({ status: "FAILURE", response_message: i18n.__("This order has been already delivered.") });
                            }
                            if (result1.status == 'Active') {

                                ServiceModel.findByIdAndUpdate({ "_id": req.body.orderId }, { $set: { status: 'Cancel', "orderCanelReason": req.body.orderCanelReason, "orderCancelMessage": req.body.orderCancelMessage } }, { new: true }, (error2, result2) => {
                                    if (error2) {
                                        console.log("Error 2 is=============>", error2);
                                        return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") + cross1 });
                                    }
                                    else {

                                        MakeAOfferDeliveryPerson.findByIdAndUpdate({ "_id": result2.offerId }, { $set: { status: 'Cancel', "orderCanelReason": req.body.orderCanelReason, "orderCancelMessage": req.body.orderCancelMessage, orderCancelledBy: req.body.userId } }, { new: true }, (error6, result6) => {
                                            if (error6) {
                                                console.log("Error 6 is===========>", error6);
                                                return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") + cross1 });
                                            }
                                            else {
                                                User.findOne({ "_id": result2.offerAcceptedOfId }, (error8, result8) => {
                                                    if (error8) {
                                                        console.log("Error 8 is===========>", error8);
                                                        return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") + cross1 });
                                                    }
                                                    else {

                                                        let notiTitle = "Oops ! Order Cancelled"
                                                        let notiMessage = `Hi, your order number ${result2.orderNumber} has been cancelled successfully.`
                                                        if (result8.appLanguage == "Portuguese") {
                                                            notiTitle = "Opa! Pedido foi cancelado"
                                                            notiMessage = `Oi, Seu número de pedido ${result2.orderNumber} foi cancelado com sucesso.`
                                                        }

                                                        let notiObj = new Notification({
                                                            "notiTo": result2.offerAcceptedOfId,
                                                            "notiTime": Date.now(),
                                                            "notiTitle": notiTitle,
                                                            "notiMessage": notiMessage
                                                        })
                                                        notiObj.save((error7, result7) => {
                                                            if (error7) {
                                                                console.log("Error 4 is===========>", error7);
                                                                return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") + cross1 });

                                                            }
                                                            else {
                                                                console.log("Notification data is============>", result7);
                                                                console.log("Order canceled successfully", result2);
                                                                res.send({ status: 'SUCCESS', response_message: i18n.__("Order canceled successfully") + right1, response: result2 });
                                                                if (result8.deviceType == 'android' && result8.normalUserNotification == true) {
                                                                    func.sendNotificationForAndroid(result8.deviceToken, notiObj.notiTitle, notiObj.notiMessage, "orderCancel", (error10, result10) => {
                                                                        if (error10) {
                                                                            console.log("Error 10 is=========>", error10);
                                                                        }
                                                                        else {
                                                                            console.log("Send notification is=============>", result10);
                                                                        }
                                                                    })
                                                                }
                                                                if (result8.deviceType == 'iOS' && result8.normalUserNotification == true) {
                                                                    let query2 = { $and: [{ "notiTo": result2.offerAcceptedOfId }, { "isSeen": "false" }] }
                                                                    Notification.find(query2, (error12, result12) => {
                                                                        if (error12) {
                                                                            console.log("Error 12 is=========>", error12);
                                                                        }
                                                                        else {
                                                                            let badgeCount = result12.length;
                                                                            console.log("Badge count is=========>", badgeCount);
                                                                            func.sendiosNotification(result8.deviceToken, notiObj.notiTitle, notiObj.notiMessage, badgeCount, "orderCancel", (error10, result10) => {
                                                                                if (error10) {
                                                                                    console.log("Error 10 is=========>", error10);
                                                                                }
                                                                                else {
                                                                                    console.log("Send notification is=============>", result10);
                                                                                }
                                                                            })
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
                                console.log("Cancel status is===============>", result1.status)
                                ServiceModel.findByIdAndUpdate({ "_id": req.body.orderId }, { $set: { status: 'Cancel', "orderCanelReason": req.body.orderCanelReason, "orderCancelMessage": req.body.orderCancelMessage } }, { new: true }, (error2, result2) => {
                                    if (error2) {
                                        console.log("Error 2 is=============>", error2);
                                        return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") + cross1 });
                                    }
                                    else {

                                        let notiTitle = "Oops ! Order Cancelled"
                                        let notiMessage = `Hi, your order number ${result2.orderNumber} has been cancelled successfully.`
                                        if (result.appLanguage == "Portuguese") {
                                            notiTitle = "Opa! Pedido foi cancelado"
                                            notiMessage = `Oi, Seu número de pedido ${result2.orderNumber} foi cancelado com sucesso.`
                                        }

                                        let notiObj = new Notification({
                                            "notiTo": req.body.userId,
                                            "notiTitle": notiTitle,
                                            "notiTime": Date.now(),
                                            "notiMessage": notiMessage
                                        })
                                        notiObj.save((error4, result4) => {
                                            if (error4) {
                                                console.log("Error 4 is===========>", error4);
                                                return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") + cross1 });

                                            }
                                            else {
                                                let notificationType = ''
                                                if (result2.serviceType == 'DeliveryPersion') {
                                                    notificationType = `orderCancelByUserDeliveryOrder`
                                                }
                                                if (result2.serviceType == 'ProfessionalWorker') {
                                                    notificationType = `orderCancelByUserProfessionalOrder`
                                                }
                                                console.log("Notification data is============>", result4);
                                                console.log("Order canceled successfully", result2);
                                                res.send({ status: 'SUCCESS', response_message: i18n.__("Order canceled successfully") + right1, response: result2 });
                                                let offerQuery = { $and: [{ realOrderId: result2._id }, { status: 'Pending' }] }
                                                MakeAOfferDeliveryPerson.find(offerQuery, (errorOfferList, offerList) => {
                                                    if (errorOfferList) {
                                                        console.log("Error is========>", errorOfferList);
                                                    }
                                                    else {
                                                        console.log("User list is===========>", offerList)
                                                        if (offerList.length == 0) {
                                                            console.log("Can not send notification from cancel")
                                                        }
                                                        for (let i = 0; i < offerList.length; i++) {
                                                            User.findOne({ _id: offerList[i].makeOfferById }, (errorGetUser, getUser) => {
                                                                if (errorGetUser) {
                                                                    console.log(errorGetUser);
                                                                }
                                                                else {
                                                                    if (getUser.deviceType == 'android' && getUser.normalUserNotification == true) {
                                                                        func.sendNotificationForAndroid(getUser.deviceToken, notiObj.notiTitle, notiObj.notiMessage, notificationType, (error10, result10) => {
                                                                            if (error10) {
                                                                                console.log("Error 10 is=========>", error10);
                                                                            }
                                                                            else {
                                                                                console.log("Send notification is=============>", result10);
                                                                            }
                                                                        })
                                                                    }
                                                                    if (getUser.deviceType == 'iOS' && getUser.normalUserNotification == true) {
                                                                        let query2 = { $and: [{ "notiTo": offerList[i].makeOfferById }, { "isSeen": "false" }] }
                                                                        Notification.find(query2, (error12, result12) => {
                                                                            if (error12) {
                                                                                console.log("Error 12 is=========>", error12);
                                                                            }
                                                                            else {
                                                                                let badgeCount = result12.length;
                                                                                console.log("Badge count is=========>", badgeCount);
                                                                                func.sendiosNotification(getUser.deviceToken, notiObj.notiTitle, notiObj.notiMessage, badgeCount, notificationType, (error10, result10) => {
                                                                                    if (error10) {
                                                                                        console.log("Error 10 is=========>", error10);
                                                                                    }
                                                                                    else {
                                                                                        console.log("Send notification is=============>", result10);
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
                                                if (result.deviceType == 'android' && result.normalUserNotification == true) {
                                                    func.sendNotificationForAndroid(result.deviceToken, notiTitle, notiMessage, "orderCancel", (error10, result10) => {
                                                        if (error10) {
                                                            console.log("Error 10 is=========>", error10);
                                                        }
                                                        else {
                                                            console.log("Send notification is=============>", result10);
                                                        }
                                                    })
                                                }
                                                if (result.deviceType == 'iOS' && result.normalUserNotification == true) {
                                                    let query2 = { $and: [{ "notiTo": req.body.userId }, { "isSeen": "false" }] }
                                                    Notification.find(query2, (error12, result12) => {
                                                        if (error12) {
                                                            console.log("Error 12 is=========>", error12);
                                                        }
                                                        else {
                                                            let badgeCount = result12.length;
                                                            console.log("Badge count is=========>", badgeCount);
                                                            func.sendiosNotification(result.deviceToken, notiTitle, notiMessage, badgeCount, "orderCancel", (error10, result10) => {
                                                                if (error10) {
                                                                    console.log("Error 10 is=========>", error10);
                                                                }
                                                                else {
                                                                    console.log("Send notification is=============>", result10);
                                                                }
                                                            })
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
            })
        }
    },

    //* Api name-Order report
    //* Features-Api is for delivery person and professional worker also
    //* Request-langCode,userId,orderId,orderCanelReason,orderCancelMessage
    //* Description-This api is used for report order by delivery and professional worker

    //==============================================Order Cancel==========================================//

    orderReport: async (req, res) => {

        try {
            console.log("Request for order report by delivery person is=============>", req.body, req.headers.token);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            if (!req.body.userId || !req.headers.token || !req.body.orderId) {
                console.log("User is missing");
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });;
            }
            let query2 = { $and: [{ "_id": req.body.userId }, { "jwtToken": req.headers.token }] }
            let result = await User.findOne(query2)
            if (!result) {
                console.log("Invalid user Id");
                return res.send({ status: "FAILURE", response_message: i18n.__("Invalid Token") });
            }
            if (result.status == 'INACTIVE') {
                console.log("Account disabled");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") + warning })
            }
            let query = { $and: [{ "_id": req.body.orderId }, { "makeOfferById": req.body.userId }] }
            let result1 = await MakeAOfferDeliveryPerson.findOne(query)
            if (!result1) {
                console.log("Order is incorrect");
                return res.send({ status: "FAILURE", response_message: i18n.__("Invalid Token") });
            }
            let reportObj = new Report({
                reportResaon: req.body.orderIssueReason,
                reportMessage: req.body.orderIssueMessage,
                orderId: result1.realOrderId,
                reportBy: req.body.userId
            })
            let reportData = await reportObj.save()
            console.log("Report data is=========>", reportData);

            let notiTitle = `Order Reported Successfully`
            let notiMessage = `Hi, your report for order number ${result2.orderNumber} have been submitted successfully.`
            if (result.appLanguage == "Portuguese") {
                notiTitle = `Pedido reportado com sucesso`
                notiMessage = `Olá, seu relatório para pedido número ${result2.orderNumber} foram enviados com sucesso.`
            }

            let notiObj = new Notification({
                notiTo: req.body.userId,
                notiTitle: notiTitle,
                notiTime: Date.now(),
                notiMessage: notiMessage
            })
            let result3 = await notiObj.save()
            console.log("Notification data is==========>", result3);
            res.send({ status: 'SUCCESS', response_message: i18n.__("Order reported successfully") + right1, response: reportData })
            if (result.deviceType == 'android' && result.normalUserNotification == true) {
                func.sendNotificationForAndroid(result.deviceToken, notiObj.notiTitle, notiObj.notiMessage, "orderReport", (error10, result10) => {
                    if (error10) {
                        console.log("Error 10 is=========>", error10);
                    }
                    else {
                        console.log("Send notification is=============>", result10);
                    }
                })
            }
            if (result.deviceType == 'iOS' && result.normalUserNotification == true) {
                let query2 = { $and: [{ "notiTo": req.body.userId }, { "isSeen": "false" }] }
                Notification.find(query2, (error12, result12) => {
                    if (error12) {
                        console.log("Error 12 is=========>", error12);
                    }
                    else {
                        let badgeCount = result12.length;
                        console.log("Badge count is=========>", badgeCount);

                        if (result.userType == "User") {
                            func.sendiosNotification(result.deviceToken, notiObj.notiTitle, notiObj.notiMessage, badgeCount, "orderReport", (error10, result10) => {
                                if (error10) {
                                    console.log("Error 10 is=========>", error10);
                                }
                                else {
                                    console.log("Send notification is=============>", result10);
                                }
                            })
                        }
                        if (result.userType == "Provider") {
                            func.sendiosNotificationProvider(result.deviceToken, notiObj.notiTitle, notiObj.notiMessage, badgeCount, "orderReport", (error10, result10) => {
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
        } catch (error) {
            console.log("Error is==========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //* Api name-Get offer list
    //* Features-This api is used for only normal user ,Offer list will be delivery and professional both
    //* Request-langCode,orderId,lat,long
    //* Description-This api is used for get offer list for normal user

    //============================================Get Offer List==========================================//

    getOfferList: async (req, res) => {

        try {
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            console.log("Request for get offer list is========================>", req.body);
            if (!req.body.orderId || !req.body.lat || !req.body.long) {
                console.log("Field is missing");
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });;
            }
            let result = await MakeAOfferDeliveryPerson.aggregate([
                {
                    $match: {
                        $and: [{
                            realOrderId: ObjectId(req.body.orderId)
                        }, {
                            status: 'Pending'
                        }, { deleteStatus: false }]
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "makeOfferById",
                        foreignField: "_id",
                        as: "userData"
                    }
                },
                {
                    $unwind: {
                        path: "$userData",
                        preserveNullAndEmptyArrays: true
                    }
                },
                { "$sort": { "createdAt": -1 } },
                {
                    "$project": {
                        _id: 1,
                        "status": 1,
                        "location": 1,
                        "signupWithDeliveryPerson": 1,
                        "adminVerifyDeliveryPerson": 1,
                        "deliveryOffer": 1,
                        "tax": 1,
                        "total": 1,
                        "invoiceCreatedAt": 1,
                        "invoiceStatus": 1,
                        "goStatus": 1,
                        "service": 1,
                        "serviceType": 1,
                        "pickupLocation": 1,
                        "pickupLat": 1,
                        "pickupLong": 1,
                        "dropOffLocation": 1,
                        "dropOffLat": 1,
                        "dropOffLong": 1,
                        "seletTime": 1,
                        "orderDetails": 1,
                        "orderNumber": 1,
                        "offerMakeByName": 1,
                        "minimumOffer": 1,
                        "message": 1,
                        "apprxTime": 1,
                        "name": 1,
                        "profilePic": 1,
                        "countryCode": 1,
                        "mobileNumber": 1,
                        "createdAt": 1,
                        "updatedAt": 1,
                        "offerAcceptedStatus": 1,
                        "userData.name": 1,
                        "userData.countryCode": 1,
                        "userData.mobileNumber": 1,
                        "userData.profilePic": 1,
                        "userData.gender": 1,
                        "userData.totalRating": 1,
                        "userData.avgRating": 1,
                        "userData.transportMode": 1,
                        "userData.location": 1,
                        "userData.workImage": 1,
                        "offerAcceptedById": 1,
                        "orderOwner": 1,
                        "realOrderId": 1,
                        "makeOfferById": 1,
                        "currency": 1,
                        selectCategoryName: 1,
                        selectSubCategoryName: 1,
                        portugueseCategoryName: 1,
                        portugueseSubCategoryName: 1,
                    }
                },
            ])
            if (result.length == 0) {
                console.log("No Data found", result);
                return res.send({ status: "SUCCESS", response_message: i18n.__("No Data found"), Data1: result });
            }
            let data = JSON.stringify(result)
            let customData = JSON.parse(data)
            for (let i = 0; i < customData.length; i++) {
                let lon = customData[i].location.coordinates[0]
                let lat = customData[i].location.coordinates[1]
                console.log("Lat and long in float is===============>", parseFloat(req.body.long), parseFloat(req.body.lat))
                let dist = geodist({ lon: parseFloat(lon), lat: parseFloat(lat) }, { lon: parseFloat(req.body.long), lat: parseFloat(req.body.lat) }, { exact: true, unit: 'km' })
                let lon1 = customData[i].location.coordinates1[0]
                let lat1 = customData[i].location.coordinates1[1]
                console.log("Lat and long in float is===============>", parseFloat(lon1), parseFloat(lat1))
                let dist1 = geodist({ lon: parseFloat(lon), lat: parseFloat(lat) }, { lon: parseFloat(lon1), lat: parseFloat(lat1) }, { exact: true, unit: 'km' });
                let cToP = ((dist).toFixed(1)).toString();
                let pToD = ((dist1).toFixed(1)).toString();
                console.log("Current to pickup distance is==============>", cToP);
                console.log("Pickup to destination distance is===============>", pToD)
                customData[i].pickupToDropLocation = pToD;
                customData[i].currentToPicupLocation = cToP;
                customData[i].TotalRating = customData[i].userData.totalRating
                customData[i].AvgRating = customData[i].userData.avgRating
                customData[i].offerAcceptedByName = customData[i].userData.name
                customData[i].offerAcceptedByCountryCode = customData[i].userData.countryCode
                customData[i].offerAcceptedByMobileNumber = customData[i].userData.mobileNumber
                customData[i].offerAcceptedByProfilePic = customData[i].userData.profilePic
                customData[i].offerAcceptedByGender = customData[i].userData.gender
                customData[i].transportMode = customData[i].userData.transportMode
                customData[i].locationProvider = customData[i].userData.location
                customData[i].workImage = customData[i].userData.workImage
                delete (customData[i].userData)
            }
            console.log("Offer List found successfully", customData);
            return res.send({ status: 'SUCCESS', response_message: i18n.__("Offer List found successfully"), Data1: customData });
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },


    //* Api name-Check user type
    //* Features-all status like adminverify delivery person will come
    //* Request-langCode,token,userId
    //* Description-This api is used for get all status of user

    //=========================================Check user Type=============================================//

    checkUserType: async (req, res) => {

        try {
            console.log("Request for check user type=============>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            if (!req.body.userId) {
                console.log("User is missing");
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });;
            }
            let query2 = { $and: [{ "_id": req.body.userId }, { "jwtToken": req.headers.token }] }
            let result = await User.findOne(query2)
            if (!result) {
                console.log("User Id is incorrect");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" })
            }
            else if (result.status == 'INACTIVE') {
                console.log("Account disabled");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") })
            }
            console.log("User status found successfully", result);
            return res.send({ status: "SUCCESS", response_message: i18n.__("User status found successfully"), signupWithNormalPerson: result.signupWithNormalPerson, adminVerifyProfessionalWorker: result.adminVerifyProfessionalWorker, profilePic: result.profilePic, signupWithProfessionalWorker: result.signupWithProfessionalWorker, professionalProfile: result.professionalProfie, name: result.name, dutyStatus: result.dutyStatus });
        } catch (error) {
            console.log("Error is ===============>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //* Api name-Accept offer
    //* Features-Api for accept offer of delivery and professional worker also,Notification will be send ,Order will go in active statge
    //* Request-langCode,token,userId
    //* Description-This api is used for get all status of user

    //=================================================Accept Offer========================================//

    acceptOffer: async (req, res) => {

        try {

            console.log("Request for accept offer is=========>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            let query1 = { $and: [{ "jwtToken": req.headers.token }, { '_id': req.body.userId }] }
            let checkUser = await User.findOne(query1)
            if (!checkUser) {
                console.log("Invalid Token");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" })
            }
            if (checkUser.status == 'INACTIVE') {
                console.log("Account disabled");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") })
            }
            let checkOrder = await ServiceModel.findOne({ "_id": req.body.orderId })
            if (!checkOrder) {
                console.log("Order Id is incorrect");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            let checkOffer = await MakeAOfferDeliveryPerson.findOne({ "_id": req.body.offerId })
            if (!checkOffer) {
                console.log("Offer Id is incorrect");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            let tax = (Number(checkOffer.minimumOffer) * 0.05).toFixed(2).toString()
            let total = (Math.round((Number(checkOffer.minimumOffer) * 0.05 + Number(checkOffer.minimumOffer)).toFixed(2))).toString()
            let obj = {
                $set: {
                    offerAcceptedOfId: checkOffer.makeOfferById,
                    offerId: req.body.offerId,
                    offerAcceptedStatus: true,
                    status: 'Active',
                    deliveryOffer: Number(checkOffer.minimumOffer),
                    tax: tax,
                    total: total,
                    roomId: req.body.orderId + req.body.offerId,
                    invoiceCreatedAt: new Date()
                }
            }
            await ServiceModel.findOneAndUpdate({ "_id": req.body.orderId }, obj, { new: true })
            let obj1 = {
                $set: {
                    offerAcceptedById: req.body.userId,
                    offerAcceptedStatus: true,
                    status: 'Active',
                    roomId: req.body.orderId + req.body.offerId,
                    invoiceCreatedAt: new Date()
                }
            }
            let updateOffer = await MakeAOfferDeliveryPerson.findByIdAndUpdate({ "_id": req.body.offerId }, obj1, { new: true })
            let checkOfferBy = await User.findOne({ "_id": updateOffer.makeOfferById })

            let notiTitle = `Woo-hoo! Order Accepted`
            let notiMessage = `Hi ${checkOfferBy.name}!, Your offer for order number ${checkOrder.orderNumber} has been accepted by ${checkUser.name}. Please check your tracking.`
            let detail = `Order detail`
            let cost = `Cost`
            let orderTime = `Order time`
            let chatMessage = `${checkUser.name}! You are welcome. My name is ${checkOfferBy.name}. Plz. send confirm.`
            if (checkOfferBy.appLanguage == "Portuguese") {
                detail = `Detalhe do pedido`
                cost = `Custo`
                orderTime = `Hora`
                chatMessage = `${checkUser.name}! Seja bem vindo. Meu nome é ${checkOfferBy.name}. Por favor confirme.`
                notiTitle = `Woo-hoo! Pedido aceite`
                notiMessage = ` Olá ${checkOfferBy.name} !, sua proposta para o pedido número ${checkOrder.orderNumber} foi aceita pelo ${checkUser.name}. Por favor, verifique sua caixa de mensagens.`
            }
            let notiObj = new Notification({
                notiTo: checkOffer.makeOfferById,
                notiTitle: notiTitle,
                notiTime: Date.now(),
                notiMessage: notiMessage,
                roomId: req.body.orderId + req.body.offerId,
                notificationType: `offerAcceptOf${checkOrder.serviceType}`
            })
            await notiObj.save();
            let pickupLocation = await urlMetadata(`https://www.google.com/maps?q=\(${checkOrder.pickupLat}),\(${checkOrder.pickupLong})&z=17&hl=en')`)

            let chatObj = [{
                roomId: req.body.orderId + req.body.offerId,
                senderId: checkOffer.makeOfferById,
                receiverId: req.body.userId,
                messageType: 'Text',
                message: `${detail}- ${checkOrder.orderDetails}`
            }, {
                roomId: req.body.orderId + req.body.offerId,
                senderId: checkOffer.makeOfferById,
                receiverId: req.body.userId,
                messageType: 'Location',
                message: pickupLocation.image,
                locationType: 'Dropoff',
                url: `https://www.google.com/maps?q=\(${checkOrder.pickupLat}),\(${checkOrder.pickupLong})&z=17&hl=en')`
            },
            {
                roomId: req.body.orderId + req.body.offerId,
                senderId: checkOffer.makeOfferById,
                receiverId: req.body.userId,
                messageType: 'Text',
                message: `${cost}- ${total} ${checkOrder.currency}, ${orderTime}- ${checkOrder.seletTime}`,
            },
            {
                roomId: req.body.orderId + req.body.offerId,
                senderId: checkOffer.makeOfferById,
                receiverId: req.body.userId,
                messageType: 'Text',
                message: chatMessage,
            }]
            let chatSave = await ChatHistory.insertMany(chatObj)
            console.log("Chat save for professional is==========>", chatSave);
            console.log("Offer accepted successfully", updateOffer);
            res.send({ status: "SUCCESS", response_message: i18n.__("Offer accepted successfully") + right1, Data: updateOffer });
            if (checkOfferBy.deviceType == 'android' && checkOfferBy.normalUserNotification == true) {
                let type1 = "offerAcceptOfProfessional"
                func.sendNotificationForAndroid(checkOfferBy.deviceToken, notiObj.notiTitle, notiObj.notiMessage, type1, (error10, result10) => {
                    console.log("Notification Sent")
                })
            }
            if (checkOfferBy.deviceType == 'iOS' && checkOfferBy.normalUserNotification == true) {
                let query2 = { $and: [{ "notiTo": checkOffer.makeOfferById }, { "isSeen": "false" }] }
                let result12 = await Notification.find(query2)
                let badgeCount = result12.length;
                console.log("Badge count is=========>", badgeCount);
                let type1 = "offerAcceptOfProfessional"
                func.sendiosNotificationProvider(checkOfferBy.deviceToken, notiObj.notiTitle, notiObj.notiMessage, badgeCount, type1, (error10, result10) => {
                    console.log("Notification sent")
                })
            }
            let query5 = { $and: [{ "realOrderId": req.body.orderId }, { "status": 'Pending' }] }
            let checkPendingOffer = await MakeAOfferDeliveryPerson.find(query5)
            console.log("Check pending offer is=========>", checkPendingOffer);
            if (checkPendingOffer.length == 0) {
                console.log("No pending offer now");
                return;
            }
            let notiType = 'orderUnavailableForProfessional'
            for (let i = 0; i < checkPendingOffer.length; i++) {
                let notiUser = await User.findOne({ _id: checkPendingOffer[i].makeOfferById })
                console.log("Noti user is=========>", notiUser);
                let updateOfferOfdel = await MakeAOfferDeliveryPerson.findOne({ _id: checkPendingOffer[i]._id })
                if (updateOfferOfdel) {
                    await MakeAOfferDeliveryPerson.findByIdAndUpdate({ _id: updateOfferOfdel._id }, { $set: { deleteStatus: true } }, { new: true })
                    console.log("Offer deleted=========>", updateOfferOfdel);
                }
                let message = "Oops! Order Unavailable Now"
                let title = "Hi your offer can not be accept by user due to maximum offers or user has take another offer."
                if (notiUser.appLanguage == "Portuguese") {
                    title = "Opa! Pedido indisponível agora"
                    message = "Olá, sua proposta não foi aceite por exceder o valor máximo ou o usuário recebeu outra oferta."
                }
                if (notiUser.deviceType == "android" && notiUser.normalUserNotification == true) {
                    func.sendNotificationForAndroid(notiUser.deviceToken, title, message, notiType, (error10, result10) => {
                        console.log("Notification sent")
                    })
                }
                else if (notiUser.deviceType == "iOS" && notiUser.normalUserNotification == true) {
                    func.sendiosNotificationProvider(notiUser.deviceToken, title, message, 0, notiType, (error10, result10) => {
                        console.log("Notification sent")
                    })
                }
            }


        } catch (error) {
            console.log("Error is==========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") + cross1 });
        }
    },

    //=============================================Rating Apis============================================//

    //* Api name-Rating
    //* Features-Rating data will be store in orderRating schema also
    //* Request-langCode,token,ratingBy,ratingTo,ratingByType,ratingToType,ratingMessage,comments,rate
    //* Description-This api is used for give rating by normal user ,delivery person and professional worker also

    //=================================================Rating=================================================//

    rating: async (req, res) => {

        try {
            console.log("Request for add rating is============>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            let query1 = { $and: [{ "jwtToken": req.headers.token }, { '_id': req.body.ratingBy }] }
            let checkUser = await User.findOne(query1)
            if (!checkUser) {
                console.log("Rating By Id is incorrect");
                return res.send({ response_code: 501, response_message: "Invalid Token" });
            }
            if (checkUser.status == 'INACTIVE') {
                console.log("Account disabled");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") })
            }
            let checkRatingToUser = await User.findOne({ _id: req.body.ratingTo })
            if (!checkRatingToUser) {
                console.log("Rating To Id is incorrect");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            let obj = new RatingModel({

                "ratingBy": req.body.ratingBy,
                "ratingTo": req.body.ratingTo,
                "ratingByType": req.body.ratingByType,
                "ratingToType": req.body.ratingToType,
                "ratingMessage": req.body.ratingMessage,
                "comments": req.body.comments,
                "rate": Number(req.body.rate),
                "ratingByName": checkUser.name,
                "ratingToName": checkRatingToUser.name,

            })
            let ratingData = await obj.save()
            console.log("User Rating data is=========>", ratingData)
            let totalRating = await RatingModel.aggregate([
                {
                    $match: {
                        ratingTo: ObjectId(req.body.ratingTo)
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
            await User.findByIdAndUpdate({ "_id": req.body.ratingTo }, { $set: { "totalRating": totalRating[0].total, "avgRating": (totalRating[0].average).toFixed(1) } })
            let checkOrderRating = await OrderRating.findOne({ "orderId": req.body.orderId })
            console.log("Rating data is========>", checkOrderRating);
            let obj2 = new OrderRating({
                "orderId": req.body.orderId,
                "ratingMessage": req.body.ratingMessage,
                "comments": req.body.comments,
                "rate": Number(req.body.rate)
            })
            let ratingData1 = await obj2.save()
            console.log("Rating 1 is===========>", ratingData1);
            let notiTitle = `Hi! ${checkUser.name} has rated you.`
            let notiMessage = `Hi! ${checkUser.name} has rated you.`
            if (checkRatingToUser.appLanguage == "Portuguese") {
                notiTitle = `${checkUser.name} Classificou você`
                notiMessage = `Hi! ${checkUser.name} classificou você.`
            }
            let notiObj = new Notification({
                notiTo: req.body.ratingTo,
                notiMessage: notiMessage,
                notiTime: Date.now(),
                notiTitle: notiTitle,
                notificationType: `rating`
            })
            await notiObj.save()
            res.send({ status: "SUCCESS", response_message: i18n.__("Thank you for rating") + right1 });
            if (checkRatingToUser.deviceType == 'android' && checkRatingToUser.normalUserNotification == true) {
                func.sendNotificationForAndroid(checkRatingToUser.deviceToken, notiObj.notiTitle, notiObj.notiMessage, "rating", (error10, result10) => {
                    console.log("Notification Sent");
                    return;
                })
            }
            if (checkRatingToUser.deviceType == 'iOS' && checkRatingToUser.normalUserNotification == true) {
                let query2 = { $and: [{ "notiTo": req.body.notiTo }, { "isSeen": "false" }] }
                Notification.find(query2, (error12, result12) => {
                    if (error12) {
                        console.log("Error 12 is=========>", error12);
                    }
                    else {
                        let badgeCount = result12.length;
                        console.log("Badge count is=========>", badgeCount);
                        if (checkRatingToUser.userType == "Provider") {
                            func.sendiosNotificationProvider(checkRatingToUser.deviceToken, notiObj.notiTitle, notiObj.notiMessage, badgeCount, "rating", (error10, result10) => {
                                console.log("Notification Sent");
                                return;
                            })
                        }
                        if (checkRatingToUser.userType == "User") {
                            func.sendiosNotification(checkRatingToUser.deviceToken, notiObj.notiTitle, notiObj.notiMessage, badgeCount, "rating", (error10, result10) => {
                                console.log("Notification Sent");
                                return;
                            })
                        }

                    }
                })

            }
        } catch (error) {
            console.log("Error is============>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") + cross1 });
        }
    },

    //* Api name-Get all ratings
    //* Features-Api is for get rating list of particular normal user/delivery person/professional worker ,Total rating and average rating will come also
    //* Request-langCode,userId  Method-Post
    //* Description-This api is used for get avg ,toatl and rating list for a user

    //=================================================Get All Ratings========================================//

    getAllRating: async (req, res) => {

        try {
            console.log("Request for get all rating is============>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            let result1 = await User.findOne({ "_id": req.body.userId })
            if (!result1) {
                console.log("User id is incorrect");
                return res.send({ response_code: 501, response_message: "Invalid Token" });
            }
            if (result1.status == 'INACTIVE') {
                console.log("Account disabled");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") })
            }
            let result = await RatingModel.aggregate([
                {
                    $match: {
                        $and: [{
                            ratingTo: ObjectId(req.body.userId)
                        },
                        { 'ratingBy': { $ne: ObjectId(req.body.userId) } },
                        ]
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "ratingBy",
                        foreignField: "_id",
                        as: "userData"
                    }
                },
                {
                    $unwind: {
                        path: "$userData",
                        preserveNullAndEmptyArrays: true
                    }
                },
                { "$sort": { "createdAt": -1 } },
                {
                    "$project": {
                        _id: 1,
                        "status": 1,
                        "location": 1,
                        "ratingBy": 1,
                        "ratingTo": 1,
                        "ratingByType": 1,
                        "ratingToType": 1,
                        "ratingMessage": 1,
                        "comments": 1,
                        "rate": 1,
                        "ratingByName": 1,
                        "ratingToName": 1,
                        "createdAt": 1,
                        "updatedAt": 1,
                        "userData": 1

                    }
                },
            ])
            if (result.length == 0) {
                console.log("Rating list found", result);
                return res.send({ status: "SUCCESS", response_message: i18n.__("No data found "), Data1: result, name: result1.name, gender: result1.gender, profilePic: result1.profilePic, TotalRating: result1.totalRating, AvgRating: result1.avgRating });
            }
            let data = JSON.stringify(result)
            let customData = JSON.parse(data)
            for (let i = 0; i < customData.length; i++) {
                customData[i].ratingBy1 = customData[i].userData.name
                delete (customData[i].userData)
            }
            console.log("Rating list found", customData);
            return res.send({ status: "SUCCESS", response_message: i18n.__("Rating List found successfully "), Data1: customData, name: result1.name, gender: result1.gender, profilePic: result1.profilePic, TotalRating: result1.totalRating, AvgRating: result1.avgRating });
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //=============================================Professioanl Worker=============================================//

    //* Api name-Work done by professional worker
    //* Features-This api is used for work done by professional worker and order will go in past,Notification will send
    //* Request-langCode,userId,token,orderId
    //* Description-This api is used for work done by only professional worker

    //===========================================Work done by professional worker==================================//

    workDoneByProfessionalWorker: async (req, res) => {

        try {
            console.log("Request for work done by professional person is=====================>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            if (!req.body.userId || !req.headers.token || !req.body.orderId) {
                console.log("User is missing");
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });;
            }
            let query = { $and: [{ "_id": req.body.userId }, { "adminVerifyProfessionalWorker": "true" }, { "jwtToken": req.headers.token }] }
            let result1 = await User.findOne(query)
            if (!result1) {
                console.log("User id is incorrect");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            if (result1.status == 'INACTIVE') {
                console.log("Account disabled");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") })
            }
            let query1 = {
                $and: [
                    {
                        $or: [
                            { "status": "Active" },
                            { "status": "Request" }
                        ]
                    },
                    { "_id": req.body.orderId }
                ]
            }
            let result2 = await MakeAOfferDeliveryPerson.findOne(query1)
            if (!result2) {
                console.log("Order id is incorrect");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            let currentOrder = await ServiceModel.findOne({ _id: result2.realOrderId })
            if (currentOrder.status == 'Cancel') {
                let updateOffer = await MakeAOfferDeliveryPerson.findByIdAndUpdate({ _id: req.body.orderId }, { $set: { status: 'Cancel' } }, { new: true })
                console.log("Offer update==========>", updateOffer)
                console.log("Oops! order is not available at this moment.");
                return res.send({ status: "FAILURE", response_message: i18n.__("Oops! order is not available at this moment") });
            }
            let d1 = new Date(),
                d2 = new Date(d1);
            d2.setMinutes(d1.getMinutes() + 240);
            let query2 = {
                $and: [
                    {
                        $or: [
                            { "status": "Active" },
                            { "status": "Request" }
                        ]
                    },
                    { "_id": result2.realOrderId }
                ]
            }
            let result4 = await ServiceModel.findOneAndUpdate(query2, { $set: { status: "Complete", workDoneById: req.body.userId, "minimumOffer": result2.minimumOffer, workDoneStatus: "true", pastOrderTime: d2 } }, { new: true })
            if (!result4) {
                console.log("Order is not active");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }

            let k1 = new Date(),
                k2 = new Date(k1);
            k2.setMinutes(k1.getMinutes() + 240);
            let result3 = await MakeAOfferDeliveryPerson.findOneAndUpdate(query1, { $set: { status: "Complete", workDoneStatus: "true", pastOrderTime: k2 } }, { new: true })
            console.log("Result 3 is==============>", result3);
            let result6 = await User.findOne({ "_id": result4.userId })
            if (!result6) {
                console.log("Congratulation! Work done", result4);
                return res.send({ status: "SUCCESS", response_message: i18n.__("Congratulation! Work done"), response: result4 })
            }
            let notiTitle = `Congratulation! Work Done`
            let notiMessage = `Hi, Congratulation ! Your work for order number ${result4.orderNumber} has been completed now by ${result1.name}. Please submit your feedback for better service`
            if (result6.appLanguage == "Portuguese") {
                notiTitle = `Parabéns! Trabalho feito`
                notiMessage = `Olá, parabéns! Seu trabalho relativo o pedido número ${result4.orderNumber} foi concluído agora por ${result1.name}. Envie sua opinião para melhorarmos os serviços oferecido`
            }
            let notiobj = new Notification({

                notiTo: result4.userId,
                notiTitle: notiTitle,
                notiMessage: notiMessage,
                notiTime: Date.now(),
                notificationType: `workDoneByProfessionalWorker`

            })
            let result5 = await notiobj.save()
            let obj = {
                deliveryUserId: req.body.userId,
                orderId: req.body.orderId,
                type: 'Professional'
            }
            console.log("Notification data is============>", result5);
            console.log("Congratulation! Work done", result4);
            res.send({ status: "SUCCESS", response_message: i18n.__("Congratulation! Work done") + right1, response: result4 })
            if (result6.deviceType == 'android' && result6.normalUserNotification == true) {
                func.sendNotificationForAndroidWorkDone(result6.deviceToken, notiobj.notiTitle, notiobj.notiMessage, "workDoneByPW", `${req.body.userId}`, `${req.body.orderId}`, (error10, result10) => {
                    console.log("Notification Sent");
                    return;
                })
            }
            if (result6.deviceType == 'iOS' && result6.normalUserNotification == true) {
                let query2 = { $and: [{ "notiTo": result4.userId }, { "isSeen": "false" }] }
                let result12 = await Notification.find(query2)
                let badgeCount = result12.length;
                console.log("Badge count is=========>", badgeCount);
                func.sendiosNotificationWorkDone(result6.deviceToken, notiobj.notiTitle, notiobj.notiMessage, badgeCount, "workDoneByPW", obj, (error10, result10) => {
                    console.log("Notification Sent");
                    return;
                })
            }
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") + cross1 });
        }
    },

    //* Api name-Make offer by professional worker
    //* Features-This api is uesd for professional worker ,Notification will send
    //* Request-langCode,userId,orderId,minimumOffer,message,apprxTime
    //* Description-This api is used for make a offer on normal user's order by professional worker
    //=======================================Make a offer by professional worker=================================//

    makeAOfferByProfessionalWorker: async (req, res) => {

        try {
            console.log("Request for make a offer by delivery person is==========>", req.body, req.headers.token);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            if (!req.body.userId || !req.headers.token || !req.body.orderId) {
                console.log("Fields are missing");
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });;
            }
            let result = await ServiceModel.findOne({ "_id": req.body.orderId })
            if (!result) {
                console.log("Order Id is incoorect");
                return res.send({ status: "FAILURE", response_message: i18n.__("Invalid Token") });
            }
            if (result.status == "Cancel" || result.status == "Complete" || result.status == 'Active' || result.status == 'Request') {
                console.log("Oops! This order has been taken by another worker.");
                return res.send({ status: "FAILURE", response_message: i18n.__("Oops! order is not available at this moment") });
            }
            let query = { $and: [{ "_id": req.body.userId }, { "adminVerifyProfessionalWorker": "true" }, { "jwtToken": req.headers.token }] }
            let result3 = await User.findOne(query)
            if (!result3) {
                console.log("You are not a delivery person");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            if (result3.status == 'INACTIVE') {
                console.log("Account disabled");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") })
            }
            if (Number(req.body.minimumOffer) < 10) {
                console.log("Minimum offer limit not match");
                return res.send({ status: "FAILURE", response_message: i18n.__(`Your minimum offer limit is 10`) })
            }
            let myQuery = {
                $and: [
                    {
                        $or: [
                            { "status": "Active" },
                            { "status": "Request" }
                        ]
                    },
                    { "makeOfferById": req.body.userId },
                    { "serviceType": 'ProfessionalWorker' }
                ]
            }
            let checkCurrentOrder = await MakeAOfferDeliveryPerson.findOne(myQuery)
            if (checkCurrentOrder) {
                console.log("You can not make new offer because you have already a order");
                return res.send({ status: "FAILURE", response_message: i18n.__("You can not make new offer because you have already a active order") })
            }
            let d1 = new Date(),
                d2 = new Date(d1);
            d2.setMinutes(d1.getMinutes() + 20);
            let query2 = { $and: [{ "realOrderId": req.body.orderId }, { "makeOfferById": req.body.userId }, { status: 'Pending' }] }
            let pastOffer = await MakeAOfferDeliveryPerson.findOne(query2)
            if (!pastOffer) {
                let obj = new MakeAOfferDeliveryPerson({

                    "service": result.service,
                    "serviceType": result.serviceType,
                    "pickupLocation": result.pickupLocation,
                    "pickupLat": result.pickupLat,
                    "pickupLong": result.pickupLong,
                    "dropOffLocation": result.dropOffLocation,
                    "dropOffLat": result.dropOffLat,
                    "dropOffLong": result.dropOffLong,
                    "seletTime": result.seletTime,
                    "orderDetails": result.orderDetails,
                    "orderNumber": result.orderNumber,
                    "price": result.price,
                    "location": result.location,
                    "makeOfferById": req.body.userId,
                    "offerMakeByName": result3.name,
                    "currency": result.currency,
                    "minimumOffer": req.body.minimumOffer,
                    "message": req.body.message,
                    "apprxTime": req.body.apprxTime,
                    "orderOwner": result.userId,
                    "realOrderId": req.body.orderId,
                    "loc": result.loc,
                    "time": d2,
                    "popupStatus": 'Show',
                    "deliveryOffer": req.body.minimumOffer,
                    "tax": (Number(req.body.minimumOffer) * 0.05).toFixed(2).toString(),
                    "total": ((Math.round(Number(req.body.minimumOffer) * 0.05)) + (Number(req.body.minimumOffer))).toFixed(2).toString()
                })
                let result4 = await obj.save()
                let obj1 = [{
                    "makeOfferById": req.body.userId,
                    "minimumOffer": req.body.minimumOffer,
                    "message": req.body.message,
                    "apprxTime": req.body.apprxTime,

                }]
                let result5 = await ServiceModel.findByIdAndUpdate({ "_id": req.body.orderId }, { $push: { makeOfferByDeliveryPerson: obj1 } }, { new: true })
                let result2 = await User.findOne({ "_id": result5.userId })
                if (!result2) {
                    console.log("Offer submitted successfully");
                    return res.send({ status: "SUCCESS", response_message: i18n.__("Offer submitted successfully"), Data: result4 })
                }
                console.log("Offer submitted successfully");
                res.send({ status: "SUCCESS", response_message: i18n.__("Offer submitted successfully"), Data: result4 })
                let notiTitle = `New Offer Available`
                let notiMessage = `Hi, New offer is now available on your order number ${result.orderNumber} offered by ${result3.name}`
                if (result2.appLanguage == "Portuguese") {
                    notiTitle = `Nova Oferta Disponível`
                    notiMessage = `Olá, Nova oferta já está disponível no número do seu pedido ${result.orderNumber} proposto por ${result3.name}`
                }
                let notiobj = new Notification({
                    notiTo: result5.userId,
                    notiTitle: notiTitle,
                    notiMessage: notiMessage,
                    notiTime: Date.now(),
                    notificationType: `makeOfferByProfessionalWorker`
                })
                let result6 = await notiobj.save()
                console.log("Notification data is===========>", result6);
                if (result2.deviceType == 'android' && result2.normalUserNotification == true) {
                    func.sendNotificationForAndroid(result2.deviceToken, notiTitle, notiMessage, "offerAvailableProfessional", (error10, result10) => {
                        if (error10) {
                            console.log("Error 10 is=========>", error10);
                        }
                        else {
                            console.log("Send notification is=============>", result10);
                            return;
                        }
                    })
                }
                if (result2.deviceType == 'iOS' && result2.normalUserNotification == true) {
                    let query2 = { $and: [{ "notiTo": result5.userId }, { "isSeen": "false" }] }
                    Notification.find(query2, (error12, result12) => {
                        if (error12) {
                            console.log("Error 12 is=========>", error12);
                        }
                        else {
                            let badgeCount = result12.length;
                            console.log("Badge count is=========>", badgeCount);
                            func.sendiosNotification(result2.deviceToken, notiTitle, notiMessage, badgeCount, "offerAvailableProfessional", (error10, result10) => {
                                if (error10) {
                                    console.log("Error 10 is=========>", error10);
                                }
                                else {
                                    console.log("Send notification is=============>", result10);
                                    return;
                                }
                            })
                        }
                    })
                }
            }
            else {
                let tax = (Number(req.body.minimumOffer) * 0.05).toFixed(2).toString()
                let total = ((Math.round(Number(req.body.minimumOffer) * 0.05)) + (Number(req.body.minimumOffer))).toString()
                let updateOfferResult = await MakeAOfferDeliveryPerson.findByIdAndUpdate({ _id: pastOffer._id }, { $set: { minimumOffer: req.body.minimumOffer, apprxTime: req.body.apprxTime, message: req.body.message, deliveryOffer: req.body.minimumOffer, tax: tax, total: total } }, { new: true })
                let checkOwner = await User.findOne({ _id: pastOffer.orderOwner })
                if (!checkOwner) {
                    console.log("Offer Updated Successfully", updateOfferResult);
                    return res.send({ status: "SUCCESS", response_message: i18n.__("Offer Updated Successfully"), Data: updateOfferResult })
                }

                let notiTitle = `Updated Offer Available`
                let notiMessage = `Hi, Updated offer is now available on your order number ${pastOffer.orderNumber} offered by ${result3.name}`
                if (result2.appLanguage == "Portuguese") {
                    notiTitle = `Proposta atualizada disponível`
                    notiMessage = `Olá, a proposta atualizada já está disponível o seu pedido número ${result.orderNumber} proposto por ${result3.name}`
                }

                let notiobj = new Notification({

                    notiTo: pastOffer.orderOwner,
                    notiTitle: "Updated Offer Available",
                    notiMessage: notiMessage,
                    notiTime: Date.now(),
                    notificationType: `updateOfferByProfessionalWorker`

                })
                let result6 = await notiobj.save()
                console.log("Notification data is===========>", result6);
                console.log("Offer Updated Successfully", updateOfferResult);
                res.send({ status: "SUCCESS", response_message: i18n.__("Offer Updated Successfully"), Data: updateOfferResult })
                if (checkOwner.deviceType == 'android' && checkOwner.normalUserNotification == true) {
                    func.sendNotificationForAndroid(checkOwner.deviceToken, notiTitle, notiMessage, "offerAvailableProfessional", (error10, result10) => {
                        if (error10) {
                            console.log("Error 10 is=========>", error10);
                        }
                        else {
                            console.log("Send notification is=============>", result10);
                        }
                    })
                }
                if (checkOwner.deviceType == 'iOS' && checkOwner.normalUserNotification == true) {
                    let query2 = { $and: [{ "notiTo": pastOffer.orderOwner }, { "isSeen": "false" }] }
                    Notification.find(query2, (error12, result12) => {
                        if (error12) {
                            console.log("Error 12 is=========>", error12);
                        }
                        else {
                            let badgeCount = result12.length;
                            console.log("Badge count is=========>", badgeCount);
                            func.sendiosNotificationProvider(checkOwner.deviceToken, notiTitle, notiMessage, "offerAvailableProfessional", (error10, result10) => {
                                if (error10) {
                                    console.log("Error 10 is=========>", error10);
                                }
                                else {
                                    console.log("Send notification is=============>", result10);
                                }
                            })
                        }
                    })
                }
            }

        } catch (error) {
            console.log("Error is==========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") + cross1 });
        }

    },

    //* Api name-Get all new order for professional worker
    //* Request-langCode,userId,lat,long,token
    //* Features-Only today order will come.
    //* Description-This api is used for get all new order for professional worker

    //======================================Get new order for professional worker===================================//

    getNewOrderForProfessionalWorker: async (req, res) => {

        try {
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            console.log("Request for get new order for professional worker is========================>", req.body, req.headers.token);
            if (!req.body.userId || !req.body.lat || !req.body.long || !req.headers.token) {
                console.log("Fields are missing");
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });;
            }
            let categoryName = []
            let subcategoryName = []
            let query = { $and: [{ "_id": req.body.userId }, { adminVerifyProfessionalWorker: 'true' }, { signupWithProfessionalWorker: 'true' }, { "jwtToken": req.headers.token }] }
            let checkUser = await User.findOne(query)
            if (!checkUser) {
                console.log("You are not a professional worker");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            if (checkUser.status == 'INACTIVE') {
                console.log("This user is blocked by admin");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity.") });
            }
            for (let k = 0; k < checkUser.categoryNameArray.length; k++) {
                categoryName.push(checkUser.categoryNameArray[k].serviceCategory)
            }
            for (let l = 0; l < checkUser.subCategoryNameArray.length; l++) {
                subcategoryName.push(checkUser.subCategoryNameArray[l].serviceSubCategory)
            }
            console.log("Category name is==========>", categoryName)
            console.log("Sub-Category name is==========>", subcategoryName)
            let request = {
                $and: [
                    // {
                    //     $or: [
                    { categoryNameArray: { $in: categoryName } },
                    { subCategoryNameArray: { $in: subcategoryName } },
                    //     ]
                    // },
                    { "makeOfferByDeliveryPerson.makeOfferById": { $ne: ObjectId(req.body.userId) } },
                    {
                        "userId": { $ne: ObjectId(req.body.userId) }
                    },
                    { "status": "Pending" },
                    { deleteStatus: false },
                    // { "userId": { $exists: true, $ne: null } },
                    {
                        "skipProvider.userId": { $ne: ObjectId(req.body.userId) },
                    },
                ]
            }
            let result = await ServiceModel.aggregate([
                {
                    $geoNear: {
                        near: { type: "Point", coordinates: [parseFloat(req.body.long), parseFloat(req.body.lat)] },
                        key: "location",
                        spherical: true,
                        maxDistance: 100000,
                        distanceField: "dist.calculated",
                        includeLocs: "locs",
                    },

                },
                {
                    $match: request
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "userData"
                    }
                },
                {
                    $unwind: {
                        path: "$userData",
                        preserveNullAndEmptyArrays: true
                    }
                },
                { "$sort": { "createdAt": -1 } },
                {
                    "$project": {
                        _id: 1,
                        "status": 1,
                        "location": 1,
                        "invoiceStatus": 1,
                        "userId": 1,
                        "signupWithNormalPerson": 1,
                        "signupWithProfessionalWorker": 1,
                        "adminVerifyProfessionalWorker": 1,
                        "signupWithDeliveryPerson": 1,
                        "adminVerifyDeliveryPerson": 1,
                        "service": 1,
                        "serviceType": 1,
                        "pickupLocation": 1,
                        "pickupLat": 1,
                        "pickupLong": 1,
                        "dropOffLocation": 1,
                        "dropOffLat": 1,
                        "dropOffLong": 1,
                        "seletTime": 1,
                        "orderDetails": 1,
                        "orderNumber": 1,
                        "createdAt": 1,
                        "updatedAt": 1,
                        "userData.name": 1,
                        "userData.countryCode": 1,
                        "userData.mobileNumber": 1,
                        "userData.profilePic": 1,
                        "userData.gender": 1,
                        "userData.totalRating": 1,
                        "userData.avgRating": 1,
                        "arrivedStatus": 1,
                        "workDoneStatus": 1,
                        "realOrderId": 1,
                        "currency": 1,
                        "selectCategoryName": 1,
                        "selectSubCategoryName": 1,
                        "orderImages": 1,
                        portugueseCategoryName: 1,
                        portugueseSubCategoryName: 1,
                    }
                },
            ])
            if (result.length == 0) {
                console.log("No Data found", result);
                return res.send({ status: "SUCCESS", response_message: i18n.__("No Data found"), Data1: result });
            }
            console.log("Dataa is============>", result)
            let data = JSON.stringify(result)
            let customData = JSON.parse(data)
            for (let i = 0; i < customData.length; i++) {
                let lon = customData[i].location.coordinates[0]
                let lat = customData[i].location.coordinates[1]
                console.log("Lat and long in float is===============>", parseFloat(req.body.long), parseFloat(req.body.lat))
                let dist = geodist({ lon: parseFloat(lon), lat: parseFloat(lat) }, { lon: parseFloat(req.body.long), lat: parseFloat(req.body.lat) }, { exact: true, unit: 'km' })
                let cToD = ((dist).toFixed(1)).toString();
                console.log("Current to drop off distnace is==============>", cToD);
                customData[i].currentToPicupLocation = cToD;
                customData[i].TotalRating = customData[i].userData.totalRating
                customData[i].AvgRating = customData[i].userData.avgRating
                customData[i].name = customData[i].userData.name
                customData[i].countryCode = customData[i].userData.countryCode
                customData[i].mobileNumber = customData[i].userData.mobileNumber
                customData[i].profilePic = customData[i].userData.profilePic
                delete (customData[i].userData)
            }
            console.log("Order List found successfully", customData);
            return res.send({ status: 'SUCCESS', response_message: i18n.__("Order List found successfully"), Data1: customData });
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },


    //* Api name-Get all pending order for professional worker
    //* Request-langCode,userId,lat,long,token
    //* Features-Only offered order will come.
    //* Description-This api is used for get all pending order for  professional worker

    //===================================Get pending order professional worker====================================//

    getPendingOrderProfessionalWorker: async (req, res) => {

        try {
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            console.log("Request for get pending order for professional worker is========================>", req.body);
            if (!req.body.userId || !req.body.lat || !req.body.long || !req.headers.token) {
                console.log("User is missing");
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });;
            }
            let query = { $and: [{ "_id": req.body.userId }, { "adminVerifyProfessionalWorker": 'true' }, { "jwtToken": req.headers.token }] }
            let checkUser = await User.findOne(query)
            if (!checkUser) {
                console.log("You are not a professional woker");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            if (checkUser.status == 'INACTIVE') {
                console.log("This user is blocked by admin");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") });
            }
            let result = await MakeAOfferDeliveryPerson.aggregate([
                {
                    $match: {

                        $and: [
                            { "makeOfferById": ObjectId(req.body.userId) },
                            { "status": "Pending" },
                            { "serviceType": "ProfessionalWorker" }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "orderOwner",
                        foreignField: "_id",
                        as: "userData"
                    }
                },
                {
                    $unwind: {
                        path: "$userData",
                        preserveNullAndEmptyArrays: true
                    }
                },
                { "$sort": { "createdAt": -1 } },
                {
                    "$project": {
                        _id: 1,
                        "status": 1,
                        "location": 1,
                        "service": 1,
                        "serviceType": 1,
                        "pickupLocation": 1,
                        "pickupLat": 1,
                        "pickupLong": 1,
                        "dropOffLocation": 1,
                        "dropOffLat": 1,
                        "dropOffLong": 1,
                        "seletTime": 1,
                        "orderDetails": 1,
                        "orderNumber": 1,
                        "createdAt": 1,
                        "updatedAt": 1,
                        "userData.name": 1,
                        "userData.countryCode": 1,
                        "userData.mobileNumber": 1,
                        "userData.profilePic": 1,
                        "userData.gender": 1,
                        "userData.totalRating": 1,
                        "userData.avgRating": 1,
                        "realOrderId": 1,
                        "orderOwner": 1,
                        "apprxTime": 1,
                        "message": 1,
                        "minimumOffer": 1,
                        "offerMakeByName": 1,
                        "makeOfferById": 1,
                        "deliveryOffer": 1,
                        "tax": 1,
                        "total": 1,
                        "invoiceCreatedAt": 1,
                        "invoiceStatus": 1,
                        "goStatus": 1,
                        "currency": 1,
                        "selectCategoryName": 1,
                        "selectSubCategoryName": 1,
                        "orderImages": 1,
                        portugueseCategoryName: 1,
                        portugueseSubCategoryName: 1,
                    }
                },
            ])
            if (result.length == 0) {
                console.log("No Data found", result);
                return res.send({ status: "SUCCESS", response_message: i18n.__("No Data found"), Data1: result });
            }
            let data = JSON.stringify(result)
            let customData = JSON.parse(data)
            for (let i = 0; i < customData.length; i++) {
                let lon = customData[i].location.coordinates[0]
                let lat = customData[i].location.coordinates[1]
                console.log("Lat and long in float is===============>", parseFloat(req.body.long), parseFloat(req.body.lat))
                let dist = geodist({ lon: parseFloat(lon), lat: parseFloat(lat) }, { lon: parseFloat(req.body.long), lat: parseFloat(req.body.lat) }, { exact: true, unit: 'km' })
                let cToD = ((dist).toFixed(1)).toString();
                console.log("Current to drop off distnace is==============>", cToD);
                customData[i].currentToPicupLocation = cToD;
                customData[i].TotalRating = customData[i].userData.totalRating
                customData[i].AvgRating = customData[i].userData.avgRating
                customData[i].name = customData[i].userData.name
                customData[i].countryCode = customData[i].userData.countryCode
                customData[i].mobileNumber = customData[i].userData.mobileNumber
                customData[i].profilePic = customData[i].userData.profilePic
                delete (customData[i].userData)
            }
            console.log("Order List found successfully", customData);
            return res.send({ status: 'SUCCESS', response_message: i18n.__("Order List found successfully"), Data1: customData });
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //* Api name-Get all active order for professional worker
    //* Request-langCode,userId,lat,long,token
    //* Features-Only accepted offer by normal user order will come.
    //* Description-This api is used for get all active order for professional worker

    //=======================================Get active order professional worker================================//

    getActiveOrderProfessionalWorker: async (req, res) => {

        try {
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            console.log("Request for get active order for professional worker is=======================>", req.body);
            if (!req.body.userId || !req.body.lat || !req.body.long || !req.headers.token) {
                console.log("Field is missing");
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });;
            }
            let query = { $and: [{ "_id": req.body.userId }, { adminVerifyProfessionalWorker: 'true' }, { signupWithProfessionalWorker: 'true' }, { "jwtToken": req.headers.token }] }
            let checkUser = await User.findOne(query)
            if (!checkUser) {
                console.log("You are not a professional worker");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            if (checkUser.status == 'INACTIVE') {
                console.log("This user is blocked by admin");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") });
            }
            let result = await MakeAOfferDeliveryPerson.aggregate([
                {
                    $match:
                    {
                        $and: [
                            {
                                $or: [
                                    { status: "Active" },
                                    { status: "Request" }
                                ]
                            },
                            {
                                makeOfferById: ObjectId(req.body.userId)
                            },
                            {
                                serviceType: 'ProfessionalWorker'
                            }
                        ]
                    }

                },
                {
                    $lookup: {
                        from: "users",
                        localField: "offerAcceptedById",
                        foreignField: "_id",
                        as: "userData"
                    }
                },
                {
                    $unwind: {
                        path: "$userData",
                        preserveNullAndEmptyArrays: true
                    }
                },
                { "$sort": { "createdAt": -1 } },
                {
                    "$project": {
                        _id: 1,
                        "status": 1,
                        "location": 1,
                        "signupWithDeliveryPerson": 1,
                        "adminVerifyDeliveryPerson": 1,
                        "deliveryOffer": 1,
                        "tax": 1,
                        "total": 1,
                        "invoiceCreatedAt": 1,
                        "invoiceStatus": 1,
                        "service": 1,
                        "serviceType": 1,
                        "pickupLocation": 1,
                        "pickupLat": 1,
                        "pickupLong": 1,
                        "dropOffLocation": 1,
                        "dropOffLat": 1,
                        "dropOffLong": 1,
                        "seletTime": 1,
                        "orderDetails": 1,
                        "orderNumber": 1,
                        "offerMakeByName": 1,
                        "minimumOffer": 1,
                        "message": 1,
                        "apprxTime": 1,
                        "name": 1,
                        "profilePic": 1,
                        "countryCode": 1,
                        "mobileNumber": 1,
                        "createdAt": 1,
                        "updatedAt": 1,
                        "offerAcceptedStatus": 1,
                        "userData.name": 1,
                        "userData.countryCode": 1,
                        "userData.mobileNumber": 1,
                        "userData.profilePic": 1,
                        "userData.gender": 1,
                        "userData.totalRating": 1,
                        "userData.avgRating": 1,
                        "offerAcceptedById": 1,
                        "orderOwner": 1,
                        "realOrderId": 1,
                        "goStatus": 1,
                        "arrivedStatus": 1,
                        "workDoneStatus": 1,
                        "roomId": 1,
                        "popupStatus": 1,
                        "currency": 1,
                        portugueseCategoryName: 1,
                        portugueseSubCategoryName: 1,
                    }
                },
            ])
            if (result.length == 0) {
                console.log("No Data found", result);
                return res.send({ status: "SUCCESS", response_message: i18n.__("No Data found"), Data1: result });
            }
            let data = JSON.stringify(result)
            let customData = JSON.parse(data)
            for (let i = 0; i < customData.length; i++) {
                let lon = customData[i].location.coordinates[0]
                let lat = customData[i].location.coordinates[1]
                console.log("Lat and long in float is===============>", parseFloat(req.body.long), parseFloat(req.body.lat))
                let dist = geodist({ lon: parseFloat(lon), lat: parseFloat(lat) }, { lon: parseFloat(req.body.long), lat: parseFloat(req.body.lat) }, { exact: true, unit: 'km' })
                let cToD = ((dist).toFixed(1)).toString();
                console.log("Current to drop off distnace is==============>", cToD);
                customData[i].currentToPicupLocation = cToD;
                customData[i].TotalRating = customData[i].userData.totalRating
                customData[i].AvgRating = customData[i].userData.avgRating
                customData[i].offerAcceptedByName = customData[i].userData.name
                customData[i].offerAcceptedByCountryCode = customData[i].userData.countryCode
                customData[i].offerAcceptedByMobileNumber = customData[i].userData.mobileNumber
                customData[i].offerAcceptedByProfilePic = customData[i].userData.profilePic
                customData[i].offerAcceptedByGender = customData[i].userData.gender
                delete (customData[i].userData)
            }
            console.log("Order List found successfully", customData);
            return res.send({ status: 'SUCCESS', response_message: i18n.__("Order List found successfully"), Data1: customData });
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //* Api name-Order cancel by professional worker
    //* Features-Api is for only professional worker also,Notification will be send
    //* Request-langCode,userId,orderId,orderIssueMessage,orderIssueReason
    //* Description-This api is used for cancel order by professsional worker


    //==========================================Order cancel by professiobnal worker===============================//

    orderCancelByProfessionalWorker: async (req, res) => {

        try {
            console.log("Requestb for cancel order by professional worker is==================>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            let checkUser = await User.findOne({ "_id": req.body.userId })
            if (!checkUser) {
                console.log("Invalid user Id");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            if (checkUser.status == 'INACTIVE') {
                console.log("Account disabled");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") })
            }
            let query1 = { $and: [{ "_id": req.body.orderId }, { "makeOfferById": req.body.userId }] }
            let checkOffer = await MakeAOfferDeliveryPerson.findOne(query1)
            if (!checkOffer) {
                console.log("Offer Id is incorrect");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            let updateOffer = await MakeAOfferDeliveryPerson.findByIdAndUpdate({ "_id": req.body.orderId }, { $set: { "status": 'Cancel', "orderCanelReason": req.body.orderCanelReason, "orderCancelMessage": req.body.orderCancelMessage } }, { new: true })
            if (checkOffer.status == 'Pending') {
                let updateOrder = await ServiceModel.findOneAndUpdate({ "_id": updateOffer.realOrderId, "makeOfferByDeliveryPerson.makeOfferById": req.body.userId }, { $pull: { makeOfferByDeliveryPerson: { makeOfferById: req.body.userId } } }, { safe: true, new: true })
                let checkOrderOwner = await User.findOne({ "_id": updateOffer.orderOwner })

                let notiTitle = "Oops ! Offer Cancelled"
                let notiMessage = `Hi! Offer on Your Order ${checkOffer.orderNumber} has been cancelled by ${checkUser.name}`
                if (checkOrderOwner.appLanguage == "Portuguese") {
                    notiTitle = "Opa! Pedido foi cancelado"
                    notiMessage = `Olá! Opa! Proposta cancelada ${checkOffer.orderNumber} foi cancelado por ${checkUser.name}`
                }
                let notiObj = new Notification({
                    "notiTo": updateOffer.orderOwner,
                    "notiTitle": notiTitle,
                    "notiTime": Date.now(),
                    "notiMessage": notiMessage
                })
                console.log("Order cancelled", updateOffer);
                res.send({ status: 'SUCCESS', response_message: i18n.__("Order canceled successfully") + right1, response: updateOffer });
                if (checkOrderOwner.deviceType == 'android' && checkOrderOwner.normalUserNotification == true) {
                    func.sendNotificationForAndroid(checkOrderOwner.deviceToken, notiObj.notiTitle, notiObj.notiMessage, "cancelOrderByProfessional", (error10, result10) => {
                        console.log("Notification Sent");
                        return;
                    })
                }
                if (checkOrderOwner.deviceType == 'iOS' && checkOrderOwner.normalUserNotification == true) {
                    let query2 = { $and: [{ "notiTo": updateOffer.orderOwner }, { "isSeen": "false" }] }
                    Notification.find(query2, (error12, result12) => {
                        if (error12) {
                            console.log("Error 12 is=========>", error12);
                        }
                        else {
                            let badgeCount = result12.length;
                            console.log("Badge count is=========>", badgeCount);
                            func.sendiosNotification(checkOrderOwner.deviceToken, notiObj.notiTitle, notiObj.notiMessage, badgeCount, "cancelOrderByProfessional", (error10, result10) => {
                                console.log("Notification Sent");
                                return;
                            })
                        }
                    })
                }
            }
            else {
                let updateOrder = await ServiceModel.findByIdAndUpdate({ "_id": updateOffer.realOrderId }, { $set: { status: "Cancel", "orderCanelReason": req.body.orderCanelReason, "orderCancelMessage": req.body.orderCancelMessage } }, { new: true })
                let checkOrderOwner = await User.findOne({ "_id": updateOffer.orderOwner })

                let notiTitle = "Oops ! Order Cancelled"
                let notiMessage = `Hi, your order number ${checkOffer.orderNumber} has been cancelled by ${checkUser.name}`
                if (checkOrderOwner.appLanguage == "Portuguese") {
                    notiTitle = "Opa! Pedido foi cancelado"
                    notiMessage = `Olá! Seu número de ordem ${checkOffer.orderNumber} foi cancelado por ${checkUser.name}`
                }
                let notiObj = new Notification({

                    "notiTo": updateOffer.orderOwner,
                    "notiTitle": notiTitle,
                    "notiTime": Date.now(),
                    "notiMessage": notiMessage,
                })
                console.log("Order canceled successfully", updateOffer);
                res.send({ status: 'SUCCESS', response_message: i18n.__("Order canceled successfully") + right1, response: updateOffer });
                if (checkOrderOwner.deviceType == 'android' && checkOrderOwner.normalUserNotification == true) {
                    func.sendNotificationForAndroid(checkOrderOwner.deviceToken, notiObj.notiTitle, notiObj.notiMessage, "cancelOrderByProfessional", (error10, result10) => {
                        console.log("Notification Sent");
                        return;
                    })
                }
                if (checkOrderOwner.deviceType == 'iOS' && checkOrderOwner.normalUserNotification == true) {
                    let query2 = { $and: [{ "notiTo": updateOffer.orderOwner }, { "isSeen": "false" }] }
                    Notification.find(query2, (error12, result12) => {
                        if (error12) {
                            console.log("Error 12 is=========>", error12);
                        }
                        else {
                            let badgeCount = result12.length;
                            console.log("Badge count is=========>", badgeCount);
                            func.sendiosNotification(checkOrderOwner.deviceToken, notiObj.notiTitle, notiObj.notiMessage, badgeCount, "cancelOrderByProfessional", (error10, result10) => {
                                console.log("Notification Sent");
                                return;
                            })
                        }
                    })
                }
            }
        } catch (error) {
            console.log("Error is==========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") + cross1 });
        }
    },

    //* Api name-Order report by professional worker
    //* Features-Api is for professional worker
    //* Request-langCode,userId,orderId,orderCanelReason,orderCancelMessage
    //* Description-This api is used for report order by professional worker

    //==========================================Order report by professional worker================================//

    orderReportByProfessionalWorker: async (req, res) => {

        try {
            console.log("Request for order report by professional worker is=================>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            if (!req.body.userId || !req.headers.token || !req.body.orderId) {
                console.log("User is missing");
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });;
            }
            let query2 = { $and: [{ "_id": req.body.userId }, { "jwtToken": req.headers.token }] }
            let result = await User.findOne(query2)
            if (!result) {
                console.log("Invalid user Id");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            if (result.status == 'INACTIVE') {
                console.log("Account disabled");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") })
            }
            let query = { $and: [{ "_id": req.body.orderId }, { "makeOfferById": req.body.userId }] }
            let result1 = await MakeAOfferDeliveryPerson.findOne(query)
            if (!result1) {
                console.log("Order is incorrect");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            let reportObj = new Report({
                reportResaon: req.body.orderIssueReason,
                reportMessage: req.body.orderIssueMessage,
                orderId: result1.realOrderId,
                reportBy: req.body.userId
            })
            let reportData = await reportObj.save()
            console.log("Report data is=========>", reportData);

            let notiTitle = `Order Reported Successfully`
            let notiMessage = `Hi, your report for order number ${result2.orderNumber} have been submitted successfully.`
            if (result.appLanguage == "Portuguese") {
                notiTitle = `Pedido reportado com sucesso`
                notiMessage = `Olá, seu relatório para pedido número ${result2.orderNumber} foram enviados com sucesso.`
            }
            let notiObj = new Notification({
                notiTo: req.body.userId,
                notiTitle: notiTitle,
                notiTime: Date.now(),
                notiMessage: notiMessage
            })
            let result3 = await notiObj.save()
            console.log("Notification data is==========>", result3);
            res.send({ status: 'SUCCESS', response_message: i18n.__("Order reported successfully"), response: reportData })
            if (result.deviceType == 'android' && result.normalUserNotification == true) {
                func.sendNotificationForAndroid(result.deviceToken, notiTitle, notiMessage, "orderReport", (error10, result10) => {
                    if (error10) {
                        console.log("Error 10 is=========>", error10);
                    }
                    else {
                        console.log("Send notification is=============>", result10);
                    }
                })
            }
            if (result.deviceType == 'iOS' && result.normalUserNotification == true) {
                let query2 = { $and: [{ "notiTo": req.body.userId }, { "isSeen": "false" }] }
                Notification.find(query2, (error12, result12) => {
                    if (error12) {
                        console.log("Error 12 is=========>", error12);
                    }
                    else {
                        let badgeCount = result12.length;
                        console.log("Badge count is=========>", badgeCount);
                        func.sendiosNotificationProvider(result.deviceToken, notiTitle, notiMessage, badgeCount, "orderReport", (error10, result10) => {
                            if (error10) {
                                console.log("Error 10 is=========>", error10);
                            }
                            else {
                                console.log("Send notification is=============>", result10);
                            }
                        })
                    }
                })
            }
        } catch (error) {
            console.log("Error is==========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }

    },

    //* Api name-Order report by normal user
    //* Features-Api is for professional worker
    //* Request-langCode,userId,orderId,orderCanelReason,orderCancelMessage
    //* Description-This api is used for report order by normal user

    //========================================Order Report by normal user==========================================//

    orderReportByNormalUser: async (req, res) => {

        try {
            console.log("Request for order report by normal user is=============>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            if (!req.body.userId || !req.headers.token || !req.body.orderId) {
                console.log("User is missing");
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });;
            }
            let query2 = { $and: [{ "_id": req.body.userId }, { "jwtToken": req.headers.token }] }
            let result = await User.findOne(query2)
            if (!result) {
                console.log("Invalid user Id");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            if (result.status == 'INACTIVE') {
                console.log("Account disabled");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") })
            }
            let query = { $and: [{ "_id": req.body.orderId }, { "userId": req.body.userId }] }
            let result1 = await ServiceModel.findOne(query)
            if (!result1) {
                console.log("Order is incorrect");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            let reportObj = new Report({
                reportResaon: req.body.orderIssueReason,
                reportMessage: req.body.orderIssueMessage,
                orderId: req.body.orderId,
                reportBy: req.body.userId
            })
            let reportData = await reportObj.save()
            console.log("Report data is=========>", reportData);
            let notiTitle = `Order Reported Successfully`
            let notiMessage = `Hi, your report for order number ${result2.orderNumber} have been submitted successfully.`
            if (result.appLanguage == "Portuguese") {
                notiTitle = `Pedido reportado com sucesso`
                notiMessage = `Olá, seu relatório para pedido número ${result2.orderNumber} foram enviados com sucesso.`
            }
            let notiObj = new Notification({
                notiTo: req.body.userId,
                notiTitle: notiTitle,
                notiTime: Date.now(),
                notiMessage: notiMessage
            })
            let result3 = await notiObj.save()
            console.log("Notification data is==========>", result3);
            res.send({ status: 'SUCCESS', response_message: i18n.__("Order reported successfully") + right1, response: reportData })
            if (result.deviceType == 'android' && result.normalUserNotification == true) {
                func.sendNotificationForAndroid(result.deviceToken, notiTitle, notiMessage, "orderReport", (error10, result10) => {
                    if (error10) {
                        console.log("Error 10 is=========>", error10);
                    }
                    else {
                        console.log("Send notification is=============>", result10);
                    }
                })
            }
            if (result.deviceType == 'iOS' && result.normalUserNotification == true) {
                let query2 = { $and: [{ "notiTo": req.body.userId }, { "isSeen": "false" }] }
                Notification.find(query2, (error12, result12) => {
                    if (error12) {
                        console.log("Error 12 is=========>", error12);
                    }
                    else {
                        let badgeCount = result12.length;
                        console.log("Badge count is=========>", badgeCount);
                        func.sendiosNotification(result.deviceToken, notiTitle, notiMessage, badgeCount, "orderReport", (error10, result10) => {
                            if (error10) {
                                console.log("Error 10 is=========>", error10);
                            }
                            else {
                                console.log("Send notification is=============>", result10);
                            }
                        })
                    }
                })
            }
        } catch (error) {
            console.log("Error is==========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //* Api name-Create invoice by delivery and professional worker
    //* Features-Invoice will be craeetd and show on normal user dashboard
    //* Request-userId,token,orderId,totalPrice,invoiceImage
    //* Description-This api is used for create invoice

    //=========================================Create Invoice=======================================================//    

    createInvoiceByDeliveryPerson: (req, res) => {


        var multiparty = require('multiparty');
        let form = new multiparty.Form();
        form.parse(req, (err, fields, files) => {
            if (err) {
                console.log("Unsupported content-type", err)
                return res.send({ status: "FAILURE", response_message: "Unsupported content-type" });
            }
            else {
                if (!fields) {
                    console.log("Fields are missing");
                    return res.send({ status: "FAILURE", response_message: "Fields are missing" });
                }
                else {
                    var i18n = new i18n_module(fields.langCode[0], configs.langFile);
                    console.log("Fields are==============>", fields);
                    console.log("Files are===============>", files);
                    if (!fields.userId[0] || !fields.orderId[0]) {
                        console.log("Fields are missing");
                        return res.send({ status: "FAILURE", response_message: "Fields are missing" });
                    }
                    User.findOne({ "_id": fields.userId[0] }, (error1, result1) => {
                        if (error1) {
                            console.log("Error 1 is==============>", error1);
                        }
                        else if (!result1) {
                            console.log("You are not a delivery person");
                            return res.send({ status: "FAILURE", response_message: "Invalid Token" });
                        }
                        else {
                            MakeAOfferDeliveryPerson.findOne({ "_id": fields.orderId[0] }, (error, result) => {
                                if (error) {
                                    console.log("Error is==========>", error);
                                    return res.send({ status: "FAILURE", response_message: "Internal server error" });
                                }
                                else if (!result) {
                                    console.log("Invalid user Id");
                                    return res.send({ status: "FAILURE", response_message: "Invalid Token" });
                                }
                                else {
                                    let currency = result.currency
                                    User.findOne({ "_id": result.orderOwner }, (error3, result3) => {
                                        if (error3) {
                                            return res.send({ status: "FAILURE", response_message: "Internal server error" });
                                        }
                                        else if (!result3) {
                                            console.log("Can not generate invoice");
                                            return res.send({ status: "FAILURE", response_message: "Can not generate invoice" });
                                        }
                                        else {
                                            let date = new Date(result.createdAt);
                                            let nwDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
                                            let invoiceTitle = "INVOICE"
                                            let invoiceDate = "Order Created on"
                                            let locationTitle = "Location"
                                            let costTitle = "Total Cost"
                                            let noteTitle = "Note"
                                            let desMes = "This invoice was created by the service provider. If you have any query please contact PaginAzul on 923283618."
                                            let frndMes = "Please be aware of fraudulent calls & messages."
                                            let cardMes = "PaginAzul never asks for bank & debit or credit card detail"
                                            let buttonMes = "Download The Invoice"
                                            let copyMes = "If download doesn´t work, please copy this link on browser."
                                            let noMes = "No Receipt Available"
                                            let signMes = "This is system generated Invoice. No signature is required"
                                            if (result3.appLanguage == "Portuguese") {
                                                invoiceTitle = "FACTURA"
                                                invoiceDate = "Pedido Criado"
                                                locationTitle = "Localização"
                                                costTitle = "Custo Total"
                                                noteTitle = "Nota"
                                                desMes = "Esta factura foi criada pelo prestador do serviço. Se tiver alguma dúvida, por favor entrar em contato com a equipe PaginAzul pelo telefone 923283618."
                                                frndMes = "Fique em alerta as chamadas e mensagens fraudulentas."
                                                cardMes = "A PaginAzul nunca pede dados bancários e nem de cartões débito ou crédito"
                                                buttonMes = "Baixe a fatura"
                                                copyMes = "Se o download não funcionar, copie este link no navegador."
                                                noMes = "Nenhum recibo disponível"
                                                signMes = "Esta factura foi gerada pelo sistema. Não requer assinatura "
                                            }
                                            if (files.invoiceImage) {
                                                if (!result.invoiceImage) {
                                                    result.invoiceImage = 'No Receipt Available'
                                                    if (result3.appLanguage == "Portuguese") {
                                                        result.invoiceImage = 'Nenhum recibo disponível'
                                                    }
                                                }
                                                cloudinary.v2.uploader.upload(files.invoiceImage[0].path, { resource_type: "image" }, (error4, result4) => {
                                                    if (error4) {
                                                        console.log("Error 4 is============>", error4)
                                                        return res.send({ status: "FAILURE", response_message: "Internal server error" })
                                                    }
                                                    else {

                                                        let tax = Number(result.minimumOffer) * 5 / 100;
                                                        console.log("Tax is========>", tax);
                                                        let total = Math.round(Number(result.minimumOffer) + tax + Number(fields.amount[0]))
                                                        console.log("Total is=========>", total)
                                                        var options = { format: 'Letter' };
                                                        var fileName = Date.now() + '.pdf';
                                                        var link = 'http://3.129.47.202:3000/api/v1/admin/getReceipt/' + fileName;
                                                        console.log("Link is=====>", link);
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
                                                        <body  style="box-sizing:border-box;margin:0;padding:0;width:100%;word-break:break-word;-webkit-font-smoothing:antialiased;">
                                                        <center>
                                                        <div class="content-wrapper">
                                                        <tr style="margin:0;padding:0">
                                                <td width="600" height="130" valign="top" class="" style="background-image:url(${result.invoiceImage});background-repeat:no-repeat;background-position:top center;">
                                                    <table width="460" height="50" class="" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto">
                                                        <tbody>
                                                        </tbody>
                                                    </table>
                                                   
                                                </td>
                                            </tr> 
                                                         
                                                <!-- Content Header (Page header) -->
                                                <section class="content-header">
                                                  <h2>
                                                    ${invoiceTitle}
                                                    <small># ${result.orderNumber}</small>
                                                  </h2> 
                                                  <b>${result3.name}</b><br/>
                                                  <b>${result3.email}</b><br/>
                                                </section>
                                                <!-- Main content -->
                                                <section class="invoice">
                                                  <!-- title row -->
                                                  <div class="row">
                                                    <div class="col-xs-12">
                                                      <h3 class="page-header">
                                                        <i class="fa fa-globe"></i>${invoiceDate} -
                                                        <small class="pull-right">${nwDate}</small>
                                                      </h3>
                                                    </div><!-- /.col -->
                                                  </div>
                                                  <!-- info row -->
                                                  <div class="row invoice-info">
                                                    <div class="col-sm-4 invoice-col">
                                                      <b><u>${locationTitle}</u></b>
                                                      <address>${result.pickupLocation}</address>
                                                    </div><!-- /.col -->
                                                   
                                                    <br>
                                                  </div><!-- /.row -->
                                                  <!-- Table row -->
                                                  <br>
                                                  <div class="row"> 
                                                    <div class="col-xs-6">
                                                      <div class="table-responsive">
                                                        <table class="table">
                                                          <tr>
                                                            <th style="width:50%">${costTitle}:</th>
                                                            <td>${total} ${currency}</td>
                                                          </tr>
                                                        </table>
                                                      </div>
                                                    </div><!-- /.col -->
                                                  </div><!-- /.row -->
                                                  <div class="pad margin no-print">
                               
                                                  <div class="callout callout-info" style="margin-bottom: 0!important;">                                                
                                                    <h3><i class="fa fa-info"></i>${noteTitle}:</h3>
                                                    <p style="margin:0 30px;color:#272c73!important;margin-bottom:20p">${desMes}</p>
                                                    <p style="margin:0 30px;color:#333366"><h5>${frndMes}</h5></p>
                                                    <p style="margin:0 30px;color:#333366"><h5>${cardMes}</h5></p>
                                                  </div>
                                                </div>
                                                <tr style="margin:0;padding:0">
                                                <td bgcolor="#ffffff" style="font-family:'Open Sans',Open Sans,Verdana,sans-serif;font-size:14px;line-height:1.5;color:#3a4161;text-align:center;font-weight:300">
                                                    <p><a style="display: block; background: #4E9CAF; text-align: center; border-radius: 5px; color: white; font-weight: bold;" href=` + result4.secure_url + `>${buttonMes}</a></p>
                                                    <p style="margin:0 30px;color:#333366"><h5>${copyMes}</h5></p> 
                                                    <p><a href=${result4.secure_url}>${result4.secure_url}</a>                                            
                                                </td>
                                                </tr>
                                                <div class="pad margin no-print">
                                                <div class="callout callout-info" style="margin-bottom: 0!important;">                                                
                                                  <p style="margin:0 30px;color:#0645AD"><h5>${signMes}</h5></p>
                                                </div>
                                              </div>
                                                </section><!-- /.content -->
                                                <div class="clearfix"></div>
                                              </div><!-- /.content-wrapper -->
                                              </center>
                                                   </body>
                                                   </html>`
                                                        pdf.create(html, options).toFile('./Receipt/' + fileName, function (err11, res11) {
                                                            if (err11) {
                                                                console.log("Error 11 is==========>", err11);
                                                                return res.send({ status: "FAILURE", response_message: "Internal server error" })
                                                            }
                                                            else {

                                                                MakeAOfferDeliveryPerson.findByIdAndUpdate({ "_id": fields.orderId[0] }, {
                                                                    $set:
                                                                        { invoicePdf: link, invoiceStatus: "true", invoiceSubtoatl: Number(fields.amount[0]), invoiceTax: tax, total: total, invoiceTotal: result.minimumOffer, invoiceImage: result4.secure_url }
                                                                }, (error5, result5) => {
                                                                    if (error5) {
                                                                        console.log("Error 5 is==============>", error5);
                                                                        return res.send({ status: "FAILURE", response_message: "Internal server error" })

                                                                    }
                                                                    else {
                                                                        console.log("Result 5 is===========>", result5);
                                                                        let d = new Date();
                                                                        let invoiceMonth = d.getMonth() + 1;
                                                                        let invoiceYear = d.getFullYear();
                                                                        console.log("Invoice month and year===========>", invoiceMonth, invoiceYear);
                                                                        ServiceModel.findByIdAndUpdate({ "_id": result.realOrderId }, { $set: { invoicePdf: link, invoiceStatus: "true", total: total, invoiceSubtoatl: Number(fields.amount[0]), invoiceTax: tax, invoiceTotal: result.minimumOffer, invoiceImage: result4.secure_url, invoiceCreatedAt: new Date(), invoiceMonth: invoiceMonth, invoiceYear: invoiceYear } }, { new: true }, (error6, result6) => {
                                                                            if (error6) {
                                                                                console.log("Error 6 is==========>", error6);
                                                                                return res.send({ status: "FAILURE", response_message: "Internal server error" })
                                                                            }
                                                                            else {
                                                                                let chatObj = new ChatHistory({
                                                                                    "senderId": fields.userId[0],
                                                                                    "receiverId": result.orderOwner,
                                                                                    "media": result4.secure_url,
                                                                                    "messageType": "Media",
                                                                                    "roomId": result.realOrderId + fields.orderId[0]
                                                                                })
                                                                                chatObj.save((error8, result8) => {
                                                                                    if (error8) {
                                                                                        console.log("Error 8 is=============>", error8);
                                                                                        return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") + cross1 })
                                                                                    }
                                                                                    else {
                                                                                        let notiTitle = "Invoice Available"
                                                                                        let notiMessage = `Hi, new invoice created by ${result1.name} for order number ${result.orderNumber}. Please check your invoice.`
                                                                                        if (result3.appLanguage == "Portuguese") {
                                                                                            notiTitle = "Fatura disponível"
                                                                                            notiMessage = `Olá, nova fatura criada por ${result1.name} para número do pedido ${result.orderNumber}. Verifique sua fatura.`
                                                                                        }
                                                                                        let notiObj = new Notification({
                                                                                            "notiTo": result.orderOwner,
                                                                                            "notiTime": Date.now(),
                                                                                            "notiTitle": notiTitle,
                                                                                            "notiMessage": notiMessage,
                                                                                            "notificationType": `invoiceAvailable`,
                                                                                            "roomId": result.realOrderId + fields.orderId[0]
                                                                                        })
                                                                                        notiObj.save((error9, result9) => {
                                                                                            if (error9) {
                                                                                                console.log("Error 8 is==========>", error9);
                                                                                            }
                                                                                            else {
                                                                                                console.log("Chat data is===========>", result8);
                                                                                                console.log("Notification data is=============>", result9);
                                                                                                console.log("url is==========>", result6);
                                                                                                res.send({ status: "SUCCESS", response_message: i18n.__("Invoice created"), Data: result6 });
                                                                                                let notificationType = 'professionalAction'
                                                                                                if (result3.deviceType == 'android' && result3.normalUserNotification == true) {
                                                                                                    func.sendNotificationForAndroid(result3.deviceToken, notiTitle, notiMessage, notificationType, (error10, result10) => {
                                                                                                        console.log("Notification Sent");
                                                                                                        return;
                                                                                                    })
                                                                                                }
                                                                                                if (result3.deviceType == 'iOS' && result3.normalUserNotification == true) {
                                                                                                    let query7 = { $and: [{ "notiTo": result.orderOwner }, { "isSeen": "false" }] }
                                                                                                    Notification.find(query7, (error12, result12) => {
                                                                                                        if (error12) {
                                                                                                            console.log("Error 12 is=========>", error12);
                                                                                                        }
                                                                                                        else {
                                                                                                            let badgeCount = result12.length;
                                                                                                            console.log("Badge count is=========>", badgeCount);
                                                                                                            func.sendiosNotification(result3.deviceToken, notiTitle, notiMessage, badgeCount, notificationType, (error11, result11) => {
                                                                                                                console.log("Notification Sent");
                                                                                                                return;
                                                                                                            })
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
                                            else {
                                                if (!result.invoiceImage) {
                                                    result.invoiceImage = 'No Receipt Available'
                                                    if (result3.appLanguage == "Portuguese") {
                                                        result.invoiceImage = 'Nenhum recibo disponível'
                                                    }
                                                }
                                                let tax = Number(result.minimumOffer) * 5 / 100;
                                                console.log("Tax is========>", tax);
                                                let total = Math.round(Number(result.minimumOffer) + tax + Number(fields.amount[0]))
                                                console.log("Total is=========>", total)
                                                var options = { format: 'Letter' };
                                                var fileName = Date.now() + '.pdf';
                                                var link = 'http://3.129.47.202:3000/api/v1/admin/getReceipt/' + fileName;
                                                console.log("Link is=====>", link);
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
                                                <body  style="box-sizing:border-box;margin:0;padding:0;width:100%;word-break:break-word;-webkit-font-smoothing:antialiased;">
                                                <center>
                                                <div class="content-wrapper">
                                                <tr style="margin:0;padding:0">
                                        <td width="600" height="130" valign="top" class="" style="background-image:url(${result.invoiceImage});background-repeat:no-repeat;background-position:top center;">
                                            <table width="460" height="50" class="" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto">
                                                <tbody>
                                                </tbody>
                                            </table>
                                           
                                        </td>
                                    </tr>          
                                        <!-- Content Header (Page header) -->
                                        <section class="content-header">
                                          <h2>
                                            ${invoiceTitle}
                                            <small># ${result.orderNumber}</small>
                                          </h2> 
                                          <b>${result3.name}</b><br/>
                                          <b>${result3.email}</b><br/>
                                        </section>
                                        <!-- Main content -->
                                        <section class="invoice">
                                          <!-- title row -->
                                          <div class="row">
                                            <div class="col-xs-12">
                                              <h3 class="page-header">
                                                <i class="fa fa-globe"></i>${invoiceDate} -
                                                <small class="pull-right">${nwDate}</small>
                                              </h3>
                                            </div><!-- /.col -->
                                          </div>
                                          <!-- info row -->
                                          <div class="row invoice-info">
                                          <div class="col-sm-4 invoice-col">
                                          <b>${locationTitle}</b>
                                          <address>${result.pickupLocation}</address>
                                        </div><!-- /.col -->
                                            <br>
                                          </div><!-- /.row -->
                                          <!-- Table row -->
                                          <br>
                                          <div class="row"> 
                                            <div class="col-xs-6">
                                              <div class="table-responsive">
                                                <table class="table">
                                                  <tr>
                                                    <th style="width:50%">${costTitle}:</th>
                                                    <td>${total} ${currency}</td>
                                                  </tr>
                                                </table>
                                              </div>
                                            </div><!-- /.col -->
                                          </div><!-- /.row -->
                                          <div class="pad margin no-print">
                       
                                          <div class="callout callout-info" style="margin-bottom: 0!important;">                                                
                                            <h3><i class="fa fa-info"></i>${noteTitle}:</h3>
                                            <p style="margin:0 30px;color:#272c73!important;margin-bottom:20p">${desMes}</p>
                                            <p style="margin:0 30px;color:#333366"><h5>${frndMes}</h5></p>
                                            <p style="margin:0 30px;color:#333366"><h5>${cardMes}</h5></p>
                                          </div>
                                        </div>
                                        <tr style="margin:0;padding:0">
                                        <td bgcolor="#ffffff" style="font-family:'Open Sans',Open Sans,Verdana,sans-serif;font-size:14px;line-height:1.5;color:#3a4161;text-align:center;font-weight:300">
                                            <p><a style="display: block; background: #4E9CAF; text-align: center; border-radius: 5px; color: white; font-weight: bold;" href=` + result.invoiceImage + `>${buttonMes}</a></p>
                                            <p style="margin:0 30px;color:#333366"><h5>${copyMes}</h5></p> 
                                            <p><a href=${result.invoiceImage}>${result.invoiceImage}</a>                                            
                                        </td>
                                        </tr>
                                        <div class="pad margin no-print">
                                        <div class="callout callout-info" style="margin-bottom: 0!important;">                                                
                                          <p style="margin:0 30px;color:#0645AD"><h5>${signMes}</h5></p>
                                        </div>
                                      </div>
                                        </section><!-- /.content -->
                                        <div class="clearfix"></div>
                                      </div><!-- /.content-wrapper -->
                                      </center>
                                           </body>
                                           </html>`
                                                pdf.create(html, options).toFile('./Receipt/' + fileName, function (err11, res11) {
                                                    if (err11) {
                                                        console.log("Error 11 is==========>", err11);
                                                        return res.send({ status: "FAILURE", response_message: "Internal server error" })
                                                    }
                                                    else {

                                                        MakeAOfferDeliveryPerson.findByIdAndUpdate({ "_id": fields.orderId[0] }, {
                                                            $set:
                                                                { invoicePdf: link, invoiceStatus: "true", invoiceSubtoatl: Number(fields.amount[0]), invoiceTax: tax, total: total, invoiceTotal: result.minimumOffer }
                                                        }, (error5, result5) => {
                                                            if (error5) {
                                                                console.log("Error 5 is==============>", error5);
                                                                return res.send({ status: "FAILURE", response_message: "Internal server error" })

                                                            }
                                                            else {
                                                                let d = new Date();
                                                                let invoiceMonth = d.getMonth() + 1;
                                                                let invoiceYear = d.getFullYear();
                                                                console.log("Invoice month and year===========>", invoiceMonth, invoiceYear);
                                                                ServiceModel.findByIdAndUpdate({ "_id": result.realOrderId }, { $set: { invoicePdf: link, invoiceStatus: "true", total: total, invoiceSubtoatl: Number(fields.amount[0]), invoiceTax: tax, invoiceTotal: result.minimumOffer, invoiceCreatedAt: new Date(), invoiceMonth: invoiceMonth, invoiceYear: invoiceYear } }, { new: true }, (error6, result6) => {
                                                                    if (error6) {
                                                                        console.log("Error 6 is==========>", error6);
                                                                        return res.send({ status: "FAILURE", response_message: "Internal server error" })
                                                                    }
                                                                    else {

                                                                        let notiTitle = "Invoice Available"
                                                                        let notiMessage = `Hi, new invoice created by ${result1.name} for order number ${result.orderNumber}. Please check your invoice.`
                                                                        if (result3.appLanguage == "Portuguese") {
                                                                            notiTitle = "Fatura disponível"
                                                                            notiMessage = `Olá, nova fatura criada por ${result1.name} para número do pedido ${result.orderNumber}. Verifique sua fatura.`
                                                                        }

                                                                        let notiObj = new Notification({

                                                                            "notiTo": result.orderOwner,
                                                                            "notiTime": Date.now(),
                                                                            "notiTitle": notiTitle,
                                                                            "notiMessage": notiMessage,
                                                                            "notificationType": `invoiceAvailable`,
                                                                            "roomId": result.realOrderId + fields.orderId[0]
                                                                        })
                                                                        notiObj.save((error9, result9) => {
                                                                            if (error9) {
                                                                                console.log("Error 8 is==========>", error9);
                                                                            }
                                                                            else {

                                                                                console.log("Notification data is=============>", result9);
                                                                                console.log("url is==========>", result6);
                                                                                res.send({ status: "SUCCESS", response_message: i18n.__("Invoice created"), Data: result6 });
                                                                                var notificationType = 'professionalAction'
                                                                                if (result3.deviceType == 'android' && result3.normalUserNotification == true) {
                                                                                    func.sendNotificationForAndroid(result3.deviceToken, notiTitle, notiMessage, notificationType, (error10, result10) => {
                                                                                        console.log("Notification Sent");
                                                                                        return;
                                                                                    })
                                                                                }
                                                                                if (result3.deviceType == 'iOS' && result3.normalUserNotification == true) {
                                                                                    let query7 = { $and: [{ "notiTo": result.orderOwner }, { "isSeen": "false" }] }
                                                                                    Notification.find(query7, (error12, result12) => {
                                                                                        if (error12) {
                                                                                            console.log("Error 12 is=========>", error12);
                                                                                        }
                                                                                        else {
                                                                                            let badgeCount = result12.length;
                                                                                            console.log("Badge count is=========>", badgeCount);
                                                                                            func.sendiosNotification(result3.deviceToken, notiTitle, notiMessage, badgeCount, notificationType, (error11, result11) => {
                                                                                                console.log("Notification Sent");
                                                                                                return;
                                                                                            })
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
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            }
        })
    },

    //* Api name-Get Invoice details for update invoice
    //* Features-orderId is mandatory
    //* Request-orderId Method-Post
    //* Description-This api is used for get invoice details for update the details

    //==========================================Get invoice details==============================================//

    getInvoiceDetails: async (req, res) => {

        try {
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            console.log("Request for get invoive details is==================>", req.body);
            let result = await MakeAOfferDeliveryPerson.findOne({ "_id": req.body.orderId }).select('invoiceStatus invoiceSubtoatl invoiceTax invoiceTotal invoiceImage invoicePdf deliveryOffer tax total')
            if (!result) {
                console.log("Order id is incorrect");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            console.log("Invoice details found", result);
            return res.send({ status: "SUCCESS", response_message: i18n.__("Invoice details found"), result });
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },


    //* Api name-Go status 
    //* Features-Api used for change the tracking status by delivery and professional worker
    //* Request-orderId,langCode Method-Post
    //* Description-This api is used for update the tracking status for normal user by delivery person and professional worker

    //=========================================Go status========================================================//

    goStatus: async (req, res) => {

        try {
            console.log("Request for go status is=============>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            let result = await MakeAOfferDeliveryPerson.findByIdAndUpdate({ "_id": req.body.orderId }, { $set: { goStatus: "true" } })
            if (!result) {
                console.log("Order Id is incorrect");
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });
            }
            let result1 = await ServiceModel.findByIdAndUpdate({ "_id": result.realOrderId }, { $set: { goStatus: "true" } }, { new: true })
            if (!result1) {
                console.log("You are ready for ride");
                return res.send({ status: "SUCCESS", response_message: i18n.__("You are ready for ride") });
            }
            if (result1.status == 'Cancel') {
                let updateOffer = await MakeAOfferDeliveryPerson.findByIdAndUpdate({ _id: req.body.orderId }, { $set: { status: 'Cancel' } }, { new: true })
                console.log("Offer update==========>", updateOffer)
                console.log("Oops! order is not available at this moment.");
                return res.send({ status: "FAILURE", response_message: i18n.__("Oops! order is not available at this moment") });
            }
            let result4 = await User.findOne({ "_id": result.orderOwner })
            let notiTitle = ''
            let notiMessage = ''
            let chatMessage = ''
            if (result4.appLanguage == "English") {
                chatMessage = `Yes! I'm on the way.`
                notiTitle = `Worker is on the way`
                notiMessage = `Hi ${result4.name}!, Worker is on the way to provide service. Please check your tracking continuously.`
            }
            if (result4.appLanguage == "Portuguese") {
                chatMessage = 'Sim! eu estou a caminho'
                notiTitle = `O profissional está a caminho`
                notiMessage = ` Oi ${result4.name} !, O profissional está a caminho. Por favor, verifique a área de mensagens regularmente.`
            }
            let chatObj = new ChatHistory({
                senderId: result.makeOfferById,
                receiverId: result.orderOwner,
                messageType: 'Text',
                roomId: result.roomId,
                message: chatMessage
            })
            await chatObj.save()
            let notiObj = new Notification({

                "notiTo": result.orderOwner,
                "notiTitle": notiTitle,
                "notiTime": Date.now(),
                "notiMessage": notiMessage,
                "notificationType": `goStatusProfessionalWorker`,
                "roomId": result.roomId
            })
            let result2 = await notiObj.save()
            console.log("Notification data is===========>", result2);
            console.log("You are ready for ride");
            res.send({ status: "SUCCESS", response_message: i18n.__("You are ready for ride") + right1 });
            let notificationType = 'professionalAction'
            if (result4.deviceToken && result4.normalUserNotification == true) {
                func.sendNotificationForAndroid(result4.deviceToken, notiObj.notiTitle, notiObj.notiMessage, notificationType, (error3, result3) => {
                    if (error3) {
                        console.log("Error 3 is=========>", error3);
                    }
                    else {
                        console.log("Send notification is=============>", result3);

                    }
                })
            }
            if (result4.deviceType == 'iOS' && result4.normalUserNotification == true) {
                let query7 = { $and: [{ "notiTo": result.orderOwner }, { "isSeen": "false" }] }
                Notification.find(query7, (error12, result12) => {
                    if (error12) {
                        console.log("Error 12 is=========>", error12);
                    }
                    else {
                        let badgeCount = result12.length;
                        console.log("Badge count is=========>", badgeCount);
                        func.sendiosNotification(result4.deviceToken, notiObj.notiTitle, notiObj.notiMessage, badgeCount, notificationType, (error11, result11) => {
                            if (error11) {
                                console.log("Error 3 is=========>", error11);
                            }
                            else {
                                console.log("Send notification is=============>", result11);
                            }
                        })
                    }
                })
            }
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") + cross1 });
        }
    },

    //* Api name-Get rating for my rate section of app
    //* Features-Get total and average rating according to userType
    //* Request-userId,ratingToType Method-Post
    //* Description- This api is used for get total and average rating given by normal user ,delivery person and professional worker

    //==============================================Get rate===================================================//

    getRate: async (req, res) => {

        try {
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            console.log("Request for get all rate=============>", req.body);
            let options = {
                page: req.body.pageNumber || 1,
                limit: req.body.limit || 1000,
                sort: {
                    createdAt: -1
                }
            }
            let result = await RatingModel.paginate({ "ratingTo": req.body.userId }, options)
            if (result.docs.length == 0) {
                result.TotalRating = result.docs.length
                result.AvgRating = 0
                console.log("Rating list found", result);
                return res.send({ status: "SUCCESS", response_message: i18n.__("Rating List found successfully"), Data: result });
            }
            let totalRating = await RatingModel.aggregate([
                {
                    $match: {
                        ratingTo: ObjectId(req.body.userId)
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
            result.TotalRating = totalRating[0].total
            result.AvgRating = (totalRating[0].average).toFixed(1)
            console.log("Rating list found", result);
            return res.send({ status: "SUCCESS", response_message: i18n.__("Rating List found successfully"), Data: result });
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //* Api name- Get past order for delivery worker
    //* Features-Rating data will be added in response of past order
    //* Request-langCode,token(In headers),userId
    //* Description- This api is used for get all past of delivery worker with rating

    //============================================Get past order aggregate======================================//


    getPastOrderDeliveryPerson1: async (req, res) => {

        try {
            console.log("Request for get past order for delivery person is========================>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            if (!req.body.userId || !req.headers.token) {
                console.log("Fields are missing");
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });
            }
            let query = { $and: [{ "_id": req.body.userId }, { adminVerifyDeliveryPerson: 'true' }, { signupWithDeliveryPerson: 'true' }, { "jwtToken": req.headers.token }] }
            let checkUser = await User.findOne(query)
            if (!checkUser) {
                console.log("You are not a delivery person");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            if (checkUser.status == 'INACTIVE') {
                console.log("This user is blocked by admin");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") });
            }
            let result = await MakeAOfferDeliveryPerson.aggregate([
                {
                    $match: {
                        $and: [{
                            makeOfferById: ObjectId(req.body.userId)
                        }, {
                            status: 'Complete'
                        }, {
                            serviceType: 'DeliveryPersion'
                        }, {
                            deleteStatus: false
                        }]
                    }
                },
                {
                    $lookup: {
                        from: "rrderratings",
                        localField: "_id",
                        foreignField: "orderId",
                        as: "ratingData"
                    }
                },
                { "$sort": { "createdAt": -1 } },
                {
                    "$project": {
                        _id: 1,
                        "status": 1,
                        "location": 1,
                        "signupWithDeliveryPerson": 1,
                        "adminVerifyDeliveryPerson": 1,
                        "deliveryOffer": 1,
                        "tax": 1,
                        "total": 1,
                        "invoiceCreatedAt": 1,
                        "invoiceStatus": 1,
                        "goStatus": 1,
                        "service": 1,
                        "serviceType": 1,
                        "pickupLocation": 1,
                        "pickupLat": 1,
                        "pickupLong": 1,
                        "dropOffLocation": 1,
                        "dropOffLat": 1,
                        "dropOffLong": 1,
                        "seletTime": 1,
                        "orderDetails": 1,
                        "orderNumber": 1,
                        "offerMakeByName": 1,
                        "minimumOffer": 1,
                        "message": 1,
                        "apprxTime": 1,
                        "createdAt": 1,
                        "updatedAt": 1,
                        "offerAcceptedStatus": 1,
                        "offerAcceptedById": 1,
                        "orderOwner": 1,
                        "realOrderId": 1,
                        "ratingData": 1,
                        "invoiceSubtoatl": 1,
                        "invoiceTax": 1,
                        "invoiceTotal": 1,

                    }
                },
            ])
            console.log("Order List found successfully", result);
            return res.send({ status: 'SUCCESS', response_message: i18n.__("Order List found successfully"), Data1: result });
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //* Api name-Get all past order for normal user
    //* Features-1.Rating data will be added in response of past order 2.This api is used according service type
    //* Request-langCode,userId,token(In headers),serviceType-DeliveryPerson/ProfessionalWoker
    //* Description- This api is used for get all past order of normal user according to service type

    //=========================================Get past normal aggregate========================================//

    getPastOrderForNormalUser1: async (req, res) => {

        try {
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            console.log("Request for get past order for normal user is========================>", req.body);
            if (!req.body.userId || !req.headers.token) {
                console.log("Fields are missing");
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });
            }
            let query = { $and: [{ "_id": req.body.userId }, { signupWithNormalPerson: 'true' }, { "jwtToken": req.headers.token }] }
            let checkUser = await User.findOne(query)
            if (!checkUser) {
                console.log("You are not a normal user");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            if (checkUser.status == 'INACTIVE') {
                console.log("This user is blocked by admin");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") + warning });
            }
            if (req.body.serviceType == 'ProfessionalWorker') {
                let result = await ServiceModel.aggregate([
                    {
                        $match: {
                            $and: [{
                                userId: ObjectId(req.body.userId)
                            }, {
                                status: 'Complete'
                            }, {
                                serviceType: 'ProfessionalWorker'
                            }]
                        }
                    },
                    {
                        $lookup: {
                            from: "rrderratings",
                            localField: "_id",
                            foreignField: "orderId",
                            as: "ratingData"
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "offerAcceptedOfId",
                            foreignField: "_id",
                            as: "userData"
                        }
                    },
                    {
                        $unwind: {
                            path: "$userData",
                            preserveNullAndEmptyArrays: true
                        }
                    },

                    { "$sort": { "createdAt": -1 } },
                    {
                        "$project": {
                            _id: 1,
                            "status": 1,
                            "location": 1,
                            "adminVerifyProfessionalWorker": 1,
                            "signupWithProfessionalWorker": 1,
                            "adminVerifyDeliveryPerson": 1,
                            "signupWithDeliveryPerson": 1,
                            "signupWithNormalPerson": 1,
                            "selectCategoryName": 1,
                            "selectSubCategoryName": 1,
                            "selectSubSubCategoryName": 1,
                            "userId": 1,
                            "offerAcceptedOfId": 1,
                            "offerId": 1,
                            "offerAcceptedStatus": 1,
                            "deliveryOffer": 1,
                            "tax": 1,
                            "total": 1,
                            "workDoneById": 1,
                            "minimumOffer": 1,
                            "createdAt": 1,
                            "updatedAt": 1,
                            "makeOfferByDeliveryPerson": 1,
                            "invoiceStatus": 1,
                            "goStatus": 1,
                            "service": 1,
                            "serviceType": 1,
                            "pickupLocation": 1,
                            "pickupLat": 1,
                            "pickupLong": 1,
                            "dropOffLocation": 1,
                            "dropOffLat": 1,
                            "dropOffLong": 1,
                            "seletTime": 1,
                            "orderDetails": 1,
                            "orderNumber": 1,
                            "offerMakeByName": 1,
                            "minimumOffer": 1,
                            "message": 1,
                            "apprxTime": 1,
                            "ratingData": 1,
                            "invoiceCreatedAt": 1,
                            "invoiceSubtoatl": 1,
                            "invoiceTax": 1,
                            "currency": 1,
                            "invoiceTotal": 1,
                            "userData.name": 1,
                            "userData.profilePic": 1,
                            "currency": 1,
                            portugueseCategoryName: 1,
                            portugueseSubCategoryName: 1,

                        }
                    },
                ])
                console.log("Order List found successfully", result);
                return res.send({ status: 'SUCCESS', response_message: i18n.__("Order List found successfully"), Data1: result });

            }
            else {
                console.log("Incorrect service type");
                return res.send({ status: 'FAILURE', response_message: "Provide valid service type" })
            }

        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //* Api name- Get past order for professional worker
    //* Features-Rating data will be added in response of past order
    //* Request-langCode,token(In headers),userId
    //* Description- This api is used for get all past of professional worker with rating

    //========================================Get past order for professional worker=============================//


    getPastOrderForProfessionalWorker1: async (req, res) => {

        try {
            console.log("Request for get past order for professional worker is========================>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            if (!req.body.userId || !req.headers.token) {
                console.log("Fields are missing");
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });
            }
            let query = { $and: [{ "_id": req.body.userId }, { adminVerifyProfessionalWorker: 'true' }, { signupWithProfessionalWorker: 'true' }, { "jwtToken": req.headers.token }] }
            let checkUser = await User.findOne(query)
            if (!checkUser) {
                console.log("You are not a normal user");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            if (checkUser.status == 'INACTIVE') {
                console.log("This user is blocked by admin");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") });
            }
            let result = await MakeAOfferDeliveryPerson.aggregate([
                {
                    $match: {
                        $and: [{
                            makeOfferById: ObjectId(req.body.userId)
                        }, {
                            status: 'Complete'
                        }, {
                            serviceType: 'ProfessionalWorker'
                        }]
                    }
                },
                {
                    $lookup: {
                        from: "rrderratings",
                        localField: "_id",
                        foreignField: "orderId",
                        as: "ratingData"
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "offerAcceptedById",
                        foreignField: "_id",
                        as: "userData"
                    }
                },
                {
                    $unwind: {
                        path: "$userData",
                        preserveNullAndEmptyArrays: true
                    }
                },
                { "$sort": { "createdAt": -1 } },
                {
                    "$project": {
                        _id: 1,
                        "status": 1,
                        "location": 1,
                        "adminVerifyProfessionalWorker": 1,
                        "signupWithProfessionalWorker": 1,
                        "adminVerifyDeliveryPerson": 1,
                        "signupWithDeliveryPerson": 1,
                        "signupWithNormalPerson": 1,
                        "selectCategoryName": 1,
                        "selectSubCategoryName": 1,
                        "selectSubSubCategoryName": 1,
                        "userId": 1,
                        "offerAcceptedOfId": 1,
                        "offerId": 1,
                        "offerAcceptedStatus": 1,
                        "deliveryOffer": 1,
                        "tax": 1,
                        "total": 1,
                        "workDoneById": 1,
                        "minimumOffer": 1,
                        "createdAt": 1,
                        "updatedAt": 1,
                        "makeOfferByDeliveryPerson": 1,
                        "invoiceStatus": 1,
                        "goStatus": 1,
                        "service": 1,
                        "serviceType": 1,
                        "pickupLocation": 1,
                        "pickupLat": 1,
                        "pickupLong": 1,
                        "dropOffLocation": 1,
                        "dropOffLat": 1,
                        "dropOffLong": 1,
                        "seletTime": 1,
                        "orderDetails": 1,
                        "orderNumber": 1,
                        "offerMakeByName": 1,
                        "minimumOffer": 1,
                        "message": 1,
                        "apprxTime": 1,
                        "ratingData": 1,
                        "realOrderId": 1,
                        "currency": 1,
                        "offerAcceptedById": 1,
                        "invoiceCreatedAt": 1,
                        "invoiceSubtoatl": 1,
                        "invoiceTax": 1,
                        "invoiceTotal": 1,
                        "userData.name": 1,
                        "userData.profilePic": 1,
                        portugueseCategoryName: 1,
                        portugueseSubCategoryName: 1,
                    }
                },
            ])
            console.log("Order List found successfully", result);
            return res.send({ status: 'SUCCESS', response_message: i18n.__("Order List found successfully"), Data1: result });
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //* Api name-Delivery and professional worker arrived
    //* Features-Notification will be send on android user or ios user
    //* Request-langCode,orderId Method-Post
    //* Description -This api is used for change the normal user tracking status by delivery persoon or professional worker on user active order dashboad

    //=========================================Arrived status changed============================================//

    arrivedStatus: async (req, res) => {

        try {
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            let result = await MakeAOfferDeliveryPerson.findByIdAndUpdate({ "_id": req.body.orderId }, { $set: { arrivedStatus: "true" } }, { new: true })
            if (!result) {
                console.log("Order Id is incorrect");
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });
            }
            let result1 = await ServiceModel.findByIdAndUpdate({ "_id": result.realOrderId }, { $set: { arrivedStatus: "true" } }, { new: true })
            if (!result1) {
                console.log("You are ready for ride");
                return res.send({ status: "SUCCESS", response_message: i18n.__("You are ready for ride") });
            }
            if (result1.status == 'Cancel') {
                let updateOffer = await MakeAOfferDeliveryPerson.findByIdAndUpdate({ _id: req.body.orderId }, { $set: { status: 'Cancel' } }, { new: true })
                console.log("Offer update==========>", updateOffer)
                console.log("Oops! order is not available at this moment.");
                return res.send({ status: "FAILURE", response_message: i18n.__("Oops! order is not available at this moment") });
            }
            let result4 = await User.findOne({ "_id": result.orderOwner })
            let notiMessage = 'Worker Arrived'
            let notiTitle = `Hi!, Worker has been arrived. Please contact him.`
            let chatMessage = `Yes! I've been arrived.`
            if (result4.appLanguage == "Portuguese") {
                chatMessage = `Sim! Cheguei`
                notiTitle = `Trabalhador chegou`
                notiMessage = `Oi !, Profissional chegou. Entre em contato com ele.`
            }
            if (!result4) {
                console.log("You are ready for ride");
                return res.send({ status: "SUCCESS", response_message: i18n.__("You are ready for ride") });
            }
            let notiObj = new Notification({

                "notiTo": result.orderOwner,
                "notiTitle": notiTitle,
                "notiTime": Date.now(),
                "notiMessage": notiMessage,
                "notificationType": `arrivedStatusProfessionalWorker`,
                "roomId": result.roomId
            })
            await notiObj.save()
            let chatObj = new ChatHistory({
                senderId: result.makeOfferById,
                receiverId: result.orderOwner,
                messageType: 'Text',
                roomId: result.roomId,
                message: chatMessage
            })
            await chatObj.save()
            console.log("You are ready for ride");
            res.send({ status: "SUCCESS", response_message: i18n.__("You are ready for ride") });
            let notificationType = 'professionalAction'
            if (result4.deviceType == 'android' && result4.normalUserNotification == true) {
                func.sendNotificationForAndroid(result4.deviceToken, notiObj.notiTitle, notiObj.notiMessage, notificationType, (error3, result3) => {
                    console.log("Notification Sent");
                    return;
                })
            }
            if (result4.deviceType == 'iOS' && result4.normalUserNotification == true) {
                let query7 = { $and: [{ "notiTo": result.orderOwner }, { "isSeen": "false" }] }
                Notification.find(query7, (error12, result12) => {
                    if (error12) {
                        console.log("Error 12 is=========>", error12);
                    }
                    else {
                        let badgeCount = result12.length;
                        console.log("Badge count is=========>", badgeCount);
                        func.sendiosNotification(result4.deviceToken, notiObj.notiTitle, notiObj.notiMessage, badgeCount, notificationType, (error11, result11) => {
                            console.log("Notification Sent");
                            return;
                        })
                    }
                })
            }
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") + cross1 });
        }
    },

    //* Api name- Get notification list
    //* Features-Used for get the notification list
    //* Request-userId,langCode
    //* Description- This api is used for get notification list

    //=========================================Get notification list=============================================//

    getNotificationList: async (req, res) => {

        try {
            console.log("Request for get notification list is============>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            let options = {
                page: req.body.pageNumber || 1,
                limit: req.body.limit || 30,
                sort: { createdAt: -1 },
            }
            let query = { $and: [{ notiTo: req.body.userId }, { 'notiBy': { $ne: req.body.userId } }] }
            let result = await Notification.paginate(query, options)
            console.log("Notification list found successfully", result);
            res.send({ status: "SUCCESS", response_message: i18n.__("Notification list found successfully"), Data: result })
            await Notification.update({ "notiTo": req.body.userId }, { $set: { isSeen: true } }, { new: true })
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") + cross1 });
        }
    },

    //* Api name- Get chat history
    //* Features-1.Get chat history by unique roomId 2.Sender data is provide in response
    //* Request-roomId Method-Post
    //* Description-This api is used for get chat history for normal user or a worker

    //========================================Chat history=======================================================//

    getChatHistory: async (req, res) => {

        try {
            console.log("Request for get chat history is=================>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            let result = await ChatHistory.aggregate([
                {
                    $match: {
                        "roomId": req.body.roomId
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
                    $unwind: {
                        path: "$senderData",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    "$project": {
                        "_id": 1,
                        "time": 1,
                        "senderId": 1,
                        "receiverId": 1,
                        "message": 1,
                        "roomId": 1,
                        "createdAt": 1,
                        "updatedAt": 1,
                        "messageType": 1,
                        "media": 1,
                        "from": 1,
                        "senderData.profilePic": 1,
                        "url": 1,
                        "locationType": 1


                    }
                },
            ])
            if (result.length == 0) {
                console.log("No Data found", result);
                return res.send({ status: "SUCCESS", response_message: i18n.__("No Data found"), Data1: result });
            }
            let data = JSON.stringify(result)
            let customData = JSON.parse(data)
            for (let i = 0; i < customData.length; i++) {
                customData[i].profilePic = customData[i].senderData.profilePic
                delete (customData[i].senderData)
            }
            console.log("Chat history found successfully", customData);
            return res.send({ status: "SUCCESS", response_message: i18n.__("Chat history found successfully "), Data1: customData })
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //* Api name-Notifications seen
    //* Features-Seen all ios notification for badge count
    //* Request-userId Method-Post
    //* Description- This api is used for seen all the notification of ios device.

    //========================================Notification seen==================================================//

    notificationSeen: async (req, res) => {

        try {
            console.log("Request for notification seen is=============>", req.body);
            let result1 = await Notification.find({ "notiTo": req.body.userId })
            if (result1.length == 0) {
                return res.send({ status: "SUCCESS", response_message: "Done" });
            }
            for (i = 0; i < result1.length; i++) {
                let result = await Notification.findByIdAndUpdate({ "_id": result1[i]._id }, { $set: { isSeen: "true" } })
                console.log("Notification seen", result);
            }
            return res.send({ status: "SUCCESS", response_message: "Done" });
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: "Internal server error" });
        }
    },

    //* Api name- Update location by delivery and professional worker
    //* Features-Update lat long of delivery person and profesional worker
    //* Request-landCode,userId,token(In headers),lat long
    //* Description-This api is used for upadte lat long at home screen of app

    //============================================Update Location================================================//

    updateLocation: async (req, res) => {

        try {
            console.log("Request for update location is============>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            req.body.location = { "type": "Point", "coordinates": [Number(req.body.longitude), Number(req.body.latitude)] }
            let result1 = await User.findByIdAndUpdate({ "_id": req.body.userId }, req.body, { new: true })
            if (!result1) {
                console.log("Invalid Token");
                return res.send({ status: "FAILURE", response_message: i18n.__("Invalid Token") });
            }
            console.log("Location Updated", result1);
            return res.send({ status: "SUCCESS", response_message: i18n.__("Location Updated "), Data: result1 })
        } catch (error) {
            console.log("error is============>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },


    //* Api name-Get total delivery and professioanl worker with range
    //* Features-1.lat long is required 2.User type is also required
    //* Request-lat,long,userType-DeliveryPerson/ProfessionalWoker,distance
    //* Description- This api is used for get all deliverya nd professional worker within range.

    //========================================Get Total delivery and professional worker==========================//

    getTotal: async (req, res) => {

        try {
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            console.log("Request for get total delivery and professional worker in range is==========>", req.body);
            if (req.body.userType == 'DeliveryPerson') {
                let dis = parseFloat(req.body.distance)
                let dist = dis * 1000;
                console.log("Distance is meter is===========>", dist);
                let result = await User.aggregate([

                    {
                        $geoNear: {
                            near: { type: "Point", coordinates: [parseFloat(req.body.long), parseFloat(req.body.lat)] },
                            key: "location",
                            spherical: true,
                            query: { adminVerifyDeliveryPerson: "true" },
                            maxDistance: dist,
                            distanceField: "dist.calculated",
                            includeLocs: "locs",
                        },

                    },
                    {
                        $match: {
                            "adminVerifyDeliveryPerson": "true"
                        }
                    },
                    { "$sort": { "dist": -1 } },
                ])
                console.log("Delivery person count is==============>", result.length);
                return res.send({ status: "SUCCESS", response_message: i18n.__("Record found successfully"), Data: result.length })
            }
            else if (req.body.userType == 'ProfessionalWorker') {
                let dis = parseFloat(req.body.distance)
                let dist = dis * 1000;
                console.log("Distance in meter is===========>", dist);
                let result = await User.aggregate([

                    {
                        $geoNear: {
                            near: { type: "Point", coordinates: [parseFloat(req.body.long), parseFloat(req.body.lat)] },
                            key: "location",
                            spherical: true,
                            query: { adminVerifyProfessionalWorker: "true" },
                            maxDistance: dist,
                            distanceField: "dist.calculated",
                            includeLocs: "locs",
                        },

                    },
                    {
                        $match: {
                            "adminVerifyProfessionalWorker": "true"
                        }
                    },
                    { "$sort": { "dist": -1 } },
                ])
                console.log("Professional worker count is===============>", result.length);
                return res.send({ status: "SUCCESS", response_message: i18n.__("Record found successfully"), Data: result.length })
            }
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: "Internal server error" });
        }
    },

    //* Api name-Get report reason
    //* Features-Get all the report reason which is added by admin
    //* Method-Get
    //* Description- This api is used for get all the report reason and cancel order reason.

    //=========================================Get Report reason==================================================//

    getReportReason: async (req, res) => {

        try {
            let result = await ReportReasonModel.find({})
            console.log("Record found successfully", result);
            return res.send({ status: "SUCCESS", response_message: "Record found successfully", Data: result })

        } catch (error) {
            console.log("Error is=========>", error);
            return res.send({ status: "FAILURE", response_message: "Internal server error" });
        }
    },

    //* Api name-Get total order count for wallet section
    //* Features-1.Jwt token is required 2.UserId is required
    //* Request-langCode,token(In headers),userId,userType(NormalUser/DeliveryPerson/ProfessionalWorker) Method-Post
    //* Description - This api is used for get total order count in wallet and passbook section of app.

    //==============================================Get Order count===============================================//

    getOrderCount: async (req, res) => {

        try {
            console.log("Request for get all order count is==============>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            if (req.body.userType == "NormalUser") {
                let query = { $and: [{ _id: req.body.userId }, { 'jwtToken': req.headers.token }] }
                let result = await User.findOne(query)
                if (!result) {
                    console.log("Invalid Token");
                    return res.send({ status: "FAILURE", response_message: i18n.__("Invalid Token") });
                }
                let result1 = await ServiceModel.find({ "userId": req.body.userId })
                console.log("Record For Normal Found", result1.length);
                return res.send({ status: "SUCCESS", response_message: i18n.__("Record Found"), Data: result1.length })
            }
            else if (req.body.userType == 'DeliveryPerson') {
                let query = { $and: [{ _id: req.body.userId }, { 'jwtToken': req.headers.token }] }
                let result = await User.findOne(query)
                if (!result) {
                    console.log("Invalid Token");
                    return res.send({ status: "FAILURE", response_message: "Invalid Token" });
                }
                let query1 = { $and: [{ workDoneById: req.body.userId }, { 'serviceType': 'DeliveryPersion' }, { 'status': 'Complete' }, { status: { $ne: 'Cancel' } }] }
                let result1 = await ServiceModel.find(query1)
                console.log("Record For Delivery Found", result1.length);
                return res.send({ status: "SUCCESS", response_message: i18n.__("Record Found"), Data: result1.length })
            }
            else if (req.body.userType == 'ProfessionalWorker') {
                let query = { $and: [{ _id: req.body.userId }, { 'jwtToken': req.headers.token }] }
                let result = await User.findOne(query)
                if (!result) {
                    console.log("Invalid Token");
                    return res.send({ status: "FAILURE", response_message: "Invalid Token" });
                }
                let query1 = { $and: [{ workDoneById: req.body.userId }, { 'serviceType': 'ProfessionalWorker' }, { 'status': 'Complete' }, { status: { $ne: 'Cancel' } }] }
                let result1 = await ServiceModel.find(query1)
                console.log("Record For Professional Found", result1.length);
                return res.send({ status: "SUCCESS", response_message: i18n.__("Record Found"), Data: result1.length })
            }
            console.log("Provide user type");
            return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });
        } catch (error) {
            console.log("error is============>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") + cross1 });
        }
    },

    //* Api name-Get invoice details for wallet section
    //* Features-1.Jwt token is required 2.UserId is required
    //* Request-langCode,token(In headers),userId,userType(NormalUser/DeliveryPerson/ProfessionalWorker) Method-Post
    //* Description - This api is used for get the invoice details in wallet and passbpook setion.

    //================================================Get invoice details=========================================//

    getInvoicDetails: (req, res) => {

        console.log("Request for get invoice detail is==========>", req.body);
        var i18n = new i18n_module(req.body.langCode, configs.langFile);
        if (req.body.userType == "NormalUser") {
            let query = { $and: [{ _id: req.body.userId }, { 'jwtToken': req.headers.token }] }
            User.findOne(query, (error, result) => {
                if (error) {
                    console.log("error is============>", error);
                    return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") + cross1 });
                }
                else if (!result) {
                    console.log("Invalid Token");
                    return res.send({ status: "FAILURE", response_message: "Invalid Token" });
                }
                else {
                    ServiceModel.find({ "userId": req.body.userId }, (error2, result2) => {
                        if (error2) {
                            console.log("Error 1 is============>", error2);
                            return res.send({ status: "FAILURE", response_message: "Invalid Token" });
                        }
                        else {
                            console.log("Record For Normal Found", result2.length);
                            if (req.body.invoiceMonth) {
                                ServiceModel.aggregate([
                                    {
                                        $match: {
                                            $and: [{
                                                userId: ObjectId(req.body.userId)
                                            }, { status: { $ne: 'Cancel' } }, {
                                                status: 'Complete'
                                            }, { invoiceStatus: "true" },

                                            ]
                                        }
                                    },
                                    { $project: { name: 1, invoiceStatus: 1, invoiceCreatedAt: 1, invoiceImage: 1, invoicePdf: 1, invoiceSubtoatl: 1, invoiceTax: 1, invoiceTotal: 1, month: { $month: '$invoiceCreatedAt' } } },
                                    { $match: { month: req.body.invoiceMonth } },
                                ], (error1, result1) => {
                                    if (error1) {
                                        console.log("Error 1 is============>", error1);
                                        return res.send({ status: "FAILURE", response_message: "Invalid Token" });
                                    }
                                    else {
                                        console.log("Record Found", result1);
                                        res.send({ status: "SUCCESS", response_message: i18n.__("Record Found"), Data1: result1, Order: result2.length })
                                    }
                                });
                            }
                            else if (req.body.invoiceYear) {
                                ServiceModel.aggregate([
                                    {
                                        $match: {
                                            $and: [{
                                                userId: ObjectId(req.body.userId)
                                            }, { status: { $ne: 'Cancel' } }, {
                                                status: 'Complete'
                                            }, { invoiceStatus: "true" },
                                            { invoiceYear: Number(req.body.invoiceYear) },

                                            ]
                                        }
                                    },

                                    { $project: { name: 1, invoiceStatus: 1, invoiceCreatedAt: 1, invoiceImage: 1, invoicePdf: 1, invoiceSubtoatl: 1, invoiceTax: 1, invoiceTotal: 1 } },
                                ], (error1, result1) => {
                                    if (error1) {
                                        console.log("Error 1 is============>", error1);
                                        return res.send({ status: "FAILURE", response_message: "Invalid Token" });
                                    }
                                    else {
                                        console.log("Record Found", result1);
                                        res.send({ status: "SUCCESS", response_message: i18n.__("Record Found"), Data1: result1, Order: result2.length })
                                    }
                                });
                            }
                            else if (!req.body.invoiceYear && !req.body.invoiceMonth) {
                                let query1 = { $and: [{ userId: req.body.userId }, { status: 'Complete' }, { status: { $ne: 'Cancel' } }, { invoiceStatus: "true" }] }
                                ServiceModel.find(query1).select('invoiceStatus invoiceCreatedAt invoiceSubtoatl invoiceTax invoiceTotal invoicePdf invoiceImage').exec((error1, result1) => {
                                    if (error1) {
                                        console.log("Error 1 is============>", error1);
                                        return res.send({ status: "FAILURE", response_message: "Invalid Token" });
                                    }
                                    else {
                                        console.log("Record Found", result1);
                                        res.send({ status: "SUCCESS", response_message: i18n.__("Record Found"), Data1: result1, Order: result2.length })
                                    }
                                })
                            }
                        }
                    })

                }
            })
        }
        else if (req.body.userType == 'DeliveryPerson') {
            let query = { $and: [{ _id: req.body.userId }, { 'jwtToken': req.headers.token }] }
            User.findOne(query, (error, result) => {
                if (error) {
                    console.log("error is============>", error);
                    return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") + cross1 });
                }
                else if (!result) {
                    console.log("Invalid Token");
                    return res.send({ status: "FAILURE", response_message: i18n.__("Invalid Token") });
                }
                else {
                    let query1 = { $and: [{ workDoneById: req.body.userId }, { 'serviceType': 'DeliveryPersion' }, { 'status': 'Complete' }, { status: { $ne: 'Cancel' } }] }
                    ServiceModel.find(query1, (error2, result2) => {
                        if (error2) {
                            console.log("Error 1 is============>", error2);
                            return res.send({ status: "FAILURE", response_message: i18n.__("Invalid Token") });
                        }
                        else {
                            console.log("Record For Delivery Found", result2.length);
                            if (req.body.invoiceMonth) {
                                ServiceModel.aggregate([
                                    {
                                        $match: {
                                            $and: [{
                                                workDoneById: ObjectId(req.body.userId)
                                            }, {
                                                serviceType: 'DeliveryPersion'
                                            }, {
                                                status: 'Complete'
                                            }, { invoiceStatus: "true" },

                                            ]
                                        }
                                    },
                                    { $project: { name: 1, invoiceStatus: 1, invoiceCreatedAt: 1, invoiceImage: 1, invoicePdf: 1, invoiceSubtoatl: 1, invoiceTax: 1, invoiceTotal: 1, month: { $month: '$invoiceCreatedAt' } } },
                                    { $match: { month: req.body.invoiceMonth } },
                                ], (error1, result1) => {
                                    if (error1) {
                                        console.log("Error 1 is============>", error1);
                                        return res.send({ status: "FAILURE", response_message: i18n.__("Invalid Token") });
                                    }
                                    else {
                                        console.log("Record Found", result1);
                                        res.send({ status: "SUCCESS", response_message: i18n.__("Record Found"), Data1: result1, Order: result2.length })
                                    }
                                });
                            }
                            else if (req.body.invoiceYear) {
                                ServiceModel.aggregate([
                                    {
                                        $match: {
                                            $and: [{
                                                workDoneById: ObjectId(req.body.userId)
                                            }, {
                                                serviceType: 'DeliveryPersion'
                                            }, {
                                                status: 'Complete'
                                            }, { invoiceStatus: "true" },
                                            { invoiceYear: Number(req.body.invoiceYear) },

                                            ]
                                        }
                                    },
                                    { $project: { name: 1, invoiceStatus: 1, invoiceCreatedAt: 1, invoiceImage: 1, invoicePdf: 1, invoiceSubtoatl: 1, invoiceTax: 1, invoiceTotal: 1 } },
                                ], (error1, result1) => {
                                    if (error1) {
                                        console.log("Error 1 is============>", error1);
                                        return res.send({ status: "FAILURE", response_message: i18n.__("Invalid Token") });
                                    }
                                    else {
                                        console.log("Record Found", result1);
                                        res.send({ status: "SUCCESS", response_message: i18n.__("Record Found"), Data1: result1, Order: result2.length })
                                    }
                                });
                            }
                            else if (!req.body.invoiceYear && !req.body.invoiceMonth) {
                                let query1 = { $and: [{ workDoneById: req.body.userId }, { 'serviceType': 'DeliveryPersion' }, { status: 'Complete' }, { status: { $ne: 'Cancel' } }, { invoiceStatus: "true" }] }
                                ServiceModel.find(query1).select('invoiceStatus invoiceCreatedAt invoiceSubtoatl invoiceTax invoiceTotal invoicePdf invoiceImage').exec((error1, result1) => {
                                    if (error1) {
                                        console.log("Error 1 is============>", error1);
                                        return res.send({ status: "FAILURE", response_message: i18n.__("Invalid Token") });
                                    }
                                    else {
                                        console.log("Record Found", result1);
                                        res.send({ status: "SUCCESS", response_message: i18n.__("Record Found"), Data1: result1, Order: result2.length })
                                    }
                                })
                            }
                        }
                    })

                }
            })
        }
        else if (req.body.userType == 'ProfessionalWorker') {
            let query = { $and: [{ _id: req.body.userId }, { 'jwtToken': req.headers.token }] }
            User.findOne(query, (error, result) => {
                if (error) {
                    console.log("error is============>", error);
                    return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") + cross1 });
                }
                else if (!result) {
                    console.log("Invalid Token");
                    return res.send({ status: "FAILURE", response_message: i18n.__("Invalid Token") });
                }
                else {
                    let query1 = { $and: [{ workDoneById: req.body.userId }, { 'serviceType': 'ProfessionalWorker' }, { 'status': 'Complete' }, { status: { $ne: 'Cancel' } }] }
                    ServiceModel.find(query1, (error2, result2) => {
                        if (error2) {
                            console.log("Error 1 is============>", error2);
                            return res.send({ status: "FAILURE", response_message: i18n.__("Invalid Token") });
                        }
                        else {
                            console.log("Record For Professional Found", result2.length);
                            if (req.body.invoiceMonth) {
                                ServiceModel.aggregate([
                                    {
                                        $match: {
                                            $and: [{
                                                workDoneById: ObjectId(req.body.userId)
                                            }, {
                                                serviceType: 'ProfessionalWorker'
                                            }, {
                                                status: 'Complete'
                                            }, { invoiceStatus: "true" },


                                            ]
                                        }
                                    },
                                    { $project: { name: 1, invoiceStatus: 1, invoiceCreatedAt: 1, invoiceImage: 1, invoicePdf: 1, invoiceSubtoatl: 1, invoiceTax: 1, invoiceTotal: 1, month: { $month: '$invoiceCreatedAt' } } },
                                    { $match: { month: req.body.invoiceMonth } },
                                ], (error1, result1) => {
                                    if (error1) {
                                        console.log("Error 1 is============>", error1);
                                        return res.send({ status: "FAILURE", response_message: i18n.__("Invalid Token") });
                                    }
                                    else {
                                        console.log("Record Found", result1);
                                        res.send({ status: "SUCCESS", response_message: i18n.__("Record Found"), Data1: result1, Order: result2.length })
                                    }
                                });
                            }
                            else if (req.body.invoiceYear) {
                                ServiceModel.aggregate([
                                    {
                                        $match: {
                                            $and: [{
                                                workDoneById: ObjectId(req.body.userId)
                                            }, {
                                                serviceType: 'ProfessionalWorker'
                                            }, {
                                                status: 'Complete'
                                            }, { invoiceStatus: "true" },
                                            { invoiceYear: Number(req.body.invoiceYear) },

                                            ]
                                        }
                                    },
                                    { $project: { name: 1, invoiceStatus: 1, invoiceCreatedAt: 1, invoiceImage: 1, invoicePdf: 1, invoiceSubtoatl: 1, invoiceTax: 1, invoiceTotal: 1 } },
                                ], (error1, result1) => {
                                    if (error1) {
                                        console.log("Error 1 is============>", error1);
                                        return res.send({ status: "FAILURE", response_message: i18n.__("Invalid Token") });
                                    }
                                    else {
                                        console.log("Record Found", result1);
                                        res.send({ status: "SUCCESS", response_message: i18n.__("Record Found"), Data1: result1, Order: result2.length })
                                    }
                                });
                            }
                            else if (!req.body.invoiceYear && !req.body.invoiceMonth) {
                                let query1 = { $and: [{ workDoneById: req.body.userId }, { 'serviceType': 'ProfessionalWorker' }, { status: 'Complete' }, { status: { $ne: 'Cancel' } }, { invoiceStatus: "true" }] }
                                ServiceModel.find(query1).select('invoiceStatus invoiceCreatedAt invoiceSubtoatl invoiceTax invoiceTotal invoicePdf invoiceImage').exec((error1, result1) => {
                                    if (error1) {
                                        console.log("Error 1 is============>", error1);
                                        return res.send({ status: "FAILURE", response_message: i18n.__("Invalid Token") });
                                    }
                                    else {
                                        console.log("Record Found", result1);
                                        res.send({ status: "SUCCESS", response_message: i18n.__("Record Found"), Data1: result1, Order: result2.length })
                                    }
                                })
                            }
                        }
                    })
                }
            })
        }
        else {
            console.log("Provide user type");
            return res.send({ status: "FAILURE", response_message: i18n.__("Invalid User Type") });
        }
    },

    //This api is used for check mobile number for signin with country code
    //============================================Check Mobile number before signin===============================//

    checkNumberForSignin: async (req, res) => {

        try {
            console.log("Request for mobile number is===========>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            if (!req.body.mobileNumber || !req.body.countryCode) {
                console.log("All fields are required")
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") })
            }
            let query = { $and: [{ "countryCode": req.body.countryCode }, { "mobileNumber": req.body.mobileNumber }] }
            let result = await User.findOne(query)
            if (!result) {
                console.log("Mobile number not registered")
                return res.send({ status: "FAILURE", response_message: i18n.__("This mobile number is not registered with our system as user.") })
            }
            if (result.result == "User" && req.body.userType == "Provider") {
                console.log("Mobile number not registered")
                return res.send({ status: "FAILURE", response_message: i18n.__("This mobile number is not registered with our system as user.") })
            }
            console.log("Mobile number is registered")
            return res.send({ status: "SUCCESS", response_message: i18n.__("Mobile number is registered") })
        } catch (error) {
            console.log("Error  is============>", error)
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") })
        }
    },

    //This api is used for update delivery person offer
    //================================================Update Offer================================================//

    updateOffer: async (req, res) => {

        try {
            console.log("Request for update offer is=========>", req.body, req.headers.token);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            let query2 = { $and: [{ "_id": req.body.userId }, { "jwtToken": req.headers.token }] }
            let result = await User.findOne(query2)
            if (!result) {
                console.log("Invalid user Id");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            if (result.status == 'INACTIVE') {
                console.log("Account disabled");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") + warning })
            }
            let query = { $and: [{ "_id": req.body.offerId }, { "makeOfferById": req.body.userId }] }
            let checkOffer = await MakeAOfferDeliveryPerson.findOne(query)
            if (!checkOffer) {
                console.log("Invalid user Id");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            let checkOrderNow = await ServiceModel.findOne({ _id: checkOffer.realOrderId })
            if (checkOrderNow.status == "Cancel" || checkOrderNow.status == "Complete" || checkOrderNow.status == 'Active' || checkOrderNow.status == 'Request') {
                console.log("Oops! This order has been taken by another worker.");
                return res.send({ status: "FAILURE", response_message: i18n.__("Oops! order is not available at this moment") });
            }
            let obj1 = [{
                "makeOfferById": req.body.userId,
                "minimumOffer": req.body.minimumOffer,
                "message": req.body.message,
                "apprxTime": req.body.apprxTime,

            }]
            let result5 = await ServiceModel.findByIdAndUpdate({ "_id": checkOffer.realOrderId }, { $push: { makeOfferByDeliveryPerson: obj1 } }, { new: true })
            let tax = Math.round((Number(req.body.minimumOffer) * 0.05)).toFixed(2).toString()
            let total = ((Math.round(Number(req.body.minimumOffer) * 0.05)) + (Number(req.body.minimumOffer))).toString()
            let updateOfferResult = await MakeAOfferDeliveryPerson.findByIdAndUpdate({ _id: req.body.offerId }, { $set: { minimumOffer: req.body.minimumOffer, apprxTime: req.body.apprxTime, message: req.body.message, status: 'Pending', deliveryOffer: req.body.minimumOffer, tax: tax, total: total } }, { new: true })
            let checkOwner = await User.findOne({ _id: checkOffer.orderOwner })
            if (!checkOwner) {
                console.log("Offer Updated Successfully", updateOfferResult);
                return res.send({ status: "SUCCESS", response_message: i18n.__("Offer Updated Successfully"), Data: updateOfferResult })
            }
            let notiType = 'offerAvailableProfessional'
            let notiTitle = ''
            let notiMessage = ''
            if (checkOwner.appLanguage == "English") {
                notiTitle = "Updated Offer Available"
                notiMessage = `Hi! Updated offer is now available on your order number ${checkOffer.orderNumber} offered by ${result.name}.`
            }
            if (checkOwner.appLanguage == "Portuguese") {
                notiTitle = "Proposta atualizada disponível"
                notiMessage = `Olá, a proposta atualizada já está disponível o seu pedido número ${checkOffer.orderNumber} proposto por ${result.name}.`
            }
            let notiobj = new Notification({
                notiTo: checkOffer.orderOwner,
                notiTitle: notiTitle,
                notiMessage: notiMessage,
                notiTime: Date.now(),
                notificationType: `updateOfferBy$ProfessionalWorker`,

            })
            await notiobj.save()
            console.log("Offer Updated Successfully", updateOfferResult);
            res.send({ status: "SUCCESS", response_message: i18n.__("Offer Updated Successfully"), Data: updateOfferResult })
            if (checkOwner.deviceType == 'android' && checkOwner.normalUserNotification == true) {
                func.sendNotificationForAndroid(checkOwner.deviceToken, notiobj.notiTitle, notiobj.notiMessage, notiType, (error10, result10) => {
                    console.log("Notification Sent");
                    return;
                })
            }
            if (checkOwner.deviceType == 'iOS' && checkOwner.normalUserNotification == true) {
                let query2 = { $and: [{ "notiTo": checkOffer.orderOwner }, { "isSeen": "false" }] }
                Notification.find(query2, (error12, result12) => {
                    if (error12) {
                        console.log("Error 12 is=========>", error12);
                    }
                    else {
                        let badgeCount = result12.length;
                        console.log("Badge count is=========>", badgeCount);
                        func.sendiosNotification(checkOwner.deviceToken, notiobj.notiTitle, notiobj.notiMessage, notiType, (error10, result10) => {
                            console.log("Notification Sent");
                            return;
                        })
                    }
                })
            }
        } catch (error) {
            console.log("error is============>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") + cross1 });
        }
    },

    //This api is used for cron delete order , delete offer , delete past order and delete past offer
    //===============================================Cron order===================================================//

    cronApi: async (req, res) => {

        deleteOrder()
        deleteOffer()
        deletePastOrder()
        deletePastOffer()
    },

    //This api is used for reject offer of delivery person by normal user
    //===============================================Reject Offer================================================//

    rejectOffer: async (req, res) => {

        try {
            console.log("Request for reject offer is==========>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            let query2 = { $and: [{ "_id": req.body.userId }, { "jwtToken": req.headers.token }] }
            let result = await User.findOne(query2)
            if (!result) {
                console.log("Invalid user Id");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            if (result.status == 'INACTIVE') {
                console.log("Account disabled");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") })
            }
            let rejectOfferResult = await MakeAOfferDeliveryPerson.findByIdAndUpdate({ _id: req.body.offerId }, { $set: { status: 'Cancel' } }, { new: true })
            if (!rejectOfferResult) {
                console.log("Invalid user Id");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            console.log("Offer Rejected Successfully", rejectOfferResult);
            let updateOrder = await ServiceModel.findOneAndUpdate({ "_id": rejectOfferResult.realOrderId, "makeOfferByDeliveryPerson.makeOfferById": rejectOfferResult.makeOfferById }, { $pull: { makeOfferByDeliveryPerson: { makeOfferById: rejectOfferResult.makeOfferById } } }, { safe: true, new: true })
            console.log("Update order is==========>", updateOrder);
            res.send({ status: "SUCCESS", response_message: i18n.__("Offer Rejected Successfully"), Data: rejectOfferResult });
            let notificationType = 'offerRejectProfessional'
            let checkUser = await User.findOne({ "_id": rejectOfferResult.makeOfferById })
            let notiTitle = ''
            let notiMessage = ''
            if (checkUser.appLanguage == "English") {
                notiTitle = "Oops! Offer Rejected"
                notiMessage = `Your offer for order number ${updateOrder.orderNumber} has been rejected by the user`
            }
            if (checkUser.appLanguage == "Portuguese") {
                notiTitle = "Opa! Proposta rejeitada"
                notiMessage = `Ola, Sua proposta para o pedido número ${updateOrder.orderNumber} foi rejeitada pelo ${result.name}.`
            }
            if (!checkUser) {
                console.log("Can not send notification")
                return;
            }
            if (checkUser.deviceType == 'android' && checkUser.normalUserNotification == true) {
                func.sendNotificationForAndroid(checkUser.deviceToken, notiTitle, notiMessage, notificationType, (error10, result10) => {
                    console.log("Notification Sent");
                    return;
                })
            }
            let notiObj = new Notification({
                notiTo: rejectOfferResult.makeOfferById,
                notiTitle: notiTitle,
                notiMessage: notiMessage
            })
            await notiObj.save()
            if (checkUser.deviceType == 'iOS' && checkUser.normalUserNotification == true) {
                let query2 = { $and: [{ "notiTo": checkUser._id }, { "isSeen": "false" }] }
                Notification.find(query2, (error12, result12) => {
                    if (error12) {
                        console.log("Error 12 is=========>", error12);
                    }
                    else {
                        let badgeCount = result12.length;
                        console.log("Badge count is=========>", badgeCount);
                        func.sendiosNotificationProvider(checkUser.deviceToken, notiTitle, notiMessage, 0, notificationType, (error10, result10) => {
                            console.log("Notification Sent");
                            return;
                        })
                    }
                })
            }
        } catch (error) {
            console.log("error is============>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") + cross1 });
        }

    },

    //This api is used for check current order in active or pending most priority of order check for active
    //=================================================Check Current Order Status=================================//

    checkCurrentOrder: async (req, res) => {

        try {
            console.log("Request for check current order is===========>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            if (!req.body.userId) {
                console.log("Field is missing")
                return res.send({ status: "FAILURE", response_message: "Something went wrong" })
            }
            let query2 = { $and: [{ "_id": req.body.userId }, { "jwtToken": req.headers.token }] }
            let result = await User.findOne(query2)
            if (!result) {
                console.log("Invalid user Id");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            if (result.status == 'INACTIVE') {
                console.log("Account disabled");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") })
            }
            let query1 = {
                $and: [
                    {
                        $or: [
                            { "status": 'Active' },
                            { "status": 'Request' }
                        ]
                    },
                    { "makeOfferById": req.body.userId }
                ]
            }
            let checkCurrentActiveOrder1 = await MakeAOfferDeliveryPerson.findOne(query1)
            if (!checkCurrentActiveOrder1) {
                let obj = { 'professionalActiveOrder': false }
                return res.send({ status: "SUCCESS", response_message: i18n.__("Status Found"), Data: obj })
            }
            let obj = { 'professionalActiveOrder': true }
            return res.send({ status: "SUCCESS", response_message: i18n.__("Status Found"), Data: obj })
        } catch (error) {
            console.log("error is============>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //This api is used for get total delivery and professional user within rage
    //==================================================Get Total Del and Profe====================================//

    getTotalDeliAndProfUser: async (req, res) => {

        try {
            console.log("Request for get deli and profes==========>", req.body);
            let dis = parseFloat(req.body.distance)
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            let dist = dis * 1000;
            console.log("Distance is meter is===========>", dist);
            let result1 = await User.aggregate([

                {
                    $geoNear: {
                        near: { type: "Point", coordinates: [parseFloat(req.body.long), parseFloat(req.body.lat)] },
                        key: "location",
                        spherical: true,
                        query: { adminVerifyProfessionalWorker: "true" },
                        maxDistance: dist,
                        distanceField: "dist.calculated",
                        includeLocs: "locs",
                    },

                },
                {
                    $match: {
                        "adminVerifyProfessionalWorker": "true"
                    }
                },
                { $count: "myCount" },

                { "$sort": { "dist": -1 } },
            ])
            console.log("Delivery person count is==============>", result1);
            return res.send({ status: "SUCCESS", response_message: i18n.__("Record found successfully"), Professional: result1 })
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //This api is used for cancel offer by delivery person
    //=================================================Order Cancel From Delivery===================================//

    orderCancelFromDelivery: async (req, res) => {

        try {
            console.log("Request for order cancel by normal user or delivery person is=============>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            if (!req.body.userId || !req.headers.token || !req.body.orderId) {
                console.log("User is missing");
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });;
            }
            else {
                let query = { $and: [{ "_id": req.body.userId }, { "jwtToken": req.headers.token }] }
                let checkUser = await User.findOne(query)
                if (!checkUser) {
                    console.log("Invalid user Id");
                    return res.send({ status: "FAILURE", response_message: "Invalid Token" });
                }
                if (checkUser.status == 'INACTIVE') {
                    console.log("Account disabled");
                    return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") })
                }
                let query1 = { $and: [{ "realOrderId": req.body.orderId }, { "makeOfferById": req.body.userId }, { status: 'Pending' }] }
                let checkOffer = await MakeAOfferDeliveryPerson.findOne(query1).sort({ createdAt: -1 })
                if (!checkOffer) {
                    console.log("Invalid order Id");
                    return res.send({ status: "FAILURE", response_message: "Invalid Token" });
                }
                let updateOffer = await MakeAOfferDeliveryPerson.findByIdAndUpdate({ "_id": checkOffer._id }, { $set: { "status": 'Cancel', "orderCanelReason": req.body.orderCanelReason, "orderCancelMessage": req.body.orderCancelMessage } }, { new: true })
                await ServiceModel.findByIdAndUpdate({ _id: req.body.orderId }, { $set: { status: "Pending" } }, { new: true })
                await ServiceModel.findOneAndUpdate({ "_id": req.body.orderId, "makeOfferByDeliveryPerson.makeOfferById": updateOffer.makeOfferById }, { $pull: { makeOfferByDeliveryPerson: { makeOfferById: updateOffer.makeOfferById } } }, { safe: true, new: true })
                console.log("Update order is==========>", updateOffer);
                res.send({ status: 'SUCCESS', response_message: i18n.__("Order canceled successfully"), response: updateOffer });
                let notificationType = 'orderCancelFromProfessional'
                let checkUser1 = await User.findOne({ _id: updateOffer.orderOwner })

                let title = 'Oops! Offer Cancelled'
                let message = `Hi ${checkUser1.name}! Offer on your order number ${checkOffer.orderNumber} has been cancelled by ${checkUser.name}.`

                if (checkUser1.appLanguage == "Portuguese") {
                    title = `Opa! Proposta cancelada`
                    message = `Olá ${checkUser1.name}! Proposta para o seu pedido número ${checkOffer.orderNumber} foi cancelado por ${checkUser.name}.`
                }
                if (checkUser1.deviceType == 'android' && checkUser1.normalUserNotification == true) {
                    func.sendNotificationForAndroid(checkUser1.deviceToken, title, message, notificationType, (error10, result10) => {
                        console.log("Notification Sent");
                        return;
                    })
                }
                if (checkUser1.deviceType == 'iOS' && checkUser1.normalUserNotification == true) {
                    let query2 = { $and: [{ "notiTo": updateOffer.orderOwner }, { "isSeen": "false" }] }
                    Notification.find(query2, (error12, result12) => {
                        if (error12) {
                            console.log("Error 12 is=========>", error12);
                        }
                        else {
                            let badgeCount = result12.length;
                            console.log("Badge count is=========>", badgeCount);
                            func.sendiosNotification(checkUser1.deviceToken, title, message, badgeCount, notificationType, (error10, result10) => {
                                console.log("Notification Sent");
                                return;
                            })
                        }
                    })
                }
            }
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },
    //This api is used for close the popup of delivery and normal person active order
    //================================================Popup close Normal And Delivery===============================//

    updatePopupStatus: async (req, res) => {

        try {
            console.log("Request for update status is===========>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            if (req.body.orderId) {
                let checkOrder = await ServiceModel.findOne({ _id: req.body.orderId })
                if (!checkOrder) {
                    console.log("Invalid user Id");
                    return res.send({ status: "FAILURE", response_message: "Invalid Token" });
                }
                let updateStatus = await ServiceModel.findByIdAndUpdate({ _id: req.body.orderId }, { $set: { popupStatus: 'Hide' } }, { new: true })
                console.log("Update is========>", updateStatus)
                return res.send({ status: 'SUCCESS', response_message: i18n.__("Status Updated"), Data: updateStatus });
            }
            if (req.body.offerId) {
                let checkOffer = await MakeAOfferDeliveryPerson.findOne({ _id: req.body.offerId })
                if (!checkOffer) {
                    console.log("Invalid user Id");
                    return res.send({ status: "FAILURE", response_message: "Invalid Token" });
                }
                let updateStatus = await MakeAOfferDeliveryPerson.findByIdAndUpdate({ _id: req.body.offerId }, { $set: { popupStatus: 'Hide' } }, { new: true })
                console.log("Update is========>", updateStatus)
                return res.send({ status: 'SUCCESS', response_message: i18n.__("Status Updated"), Data: updateStatus });
            }
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }

    },

    //This api is used for get all type of status of delivery person active order
    //===============================================Delivery worker order detail===================================//

    deliveryActiveOrder: async (req, res) => {

        try {
            console.log("Request for get active order detail is============>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            let findOrder = await MakeAOfferDeliveryPerson.findOne({ _id: req.body.orderId }).select('invoiceStatus goStatus arrivedStatus workDoneStatus roomId invoiceImage invoicePdf invoiceSubtoatl invoiceTax invoiceTotal status')
            if (!findOrder) {
                console.log("Invalid Order Id");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            console.log("Data is========>", findOrder)
            return res.send({ status: 'SUCCESS', response_message: i18n.__("Data Found"), Data: findOrder });
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //This api is used for get all type of status of normal user active order
    //==============================================Normal user order detail=========================================//

    normalActiveOrder: async (req, res) => {

        try {
            console.log("Request for get active order detail is============>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            let findOrder = await ServiceModel.findOne({ _id: req.body.orderId }).select('invoiceStatus goStatus arrivedStatus workDoneStatus roomId invoiceImage invoicePdf invoiceSubtoatl invoiceTax invoiceTotal status')
            if (!findOrder) {
                console.log("Invalid Order Id");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            console.log("Data is========>", findOrder)
            return res.send({ status: 'SUCCESS', response_message: i18n.__("Data Found"), Data: findOrder });
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //This api is used for change delivery captain by normal user
    //=============================================Change delivery captain===========================================//

    changeDeliveryCaptain: async (req, res) => {

        try {
            console.log("Request for change delivery captain is============>", req.body, req.headers.token);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            let query = { $and: [{ "_id": req.body.userId }, { "jwtToken": req.headers.token }] }
            let checkUser = await User.findOne(query)
            if (!checkUser) {
                console.log("Invalid user Id");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            if (checkUser.status == 'INACTIVE') {
                console.log("Account disabled");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") })
            }
            let query1 = { $and: [{ "_id": req.body.orderId }, { "userId": req.body.userId }] }
            let checkOrder = await ServiceModel.findOne(query1)
            if (!checkOrder) {
                console.log("Invalid Order Id");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            let d1 = new Date(),
                d2 = new Date(d1);
            d2.setMinutes(d1.getMinutes() + 20);
            let pendingOrder = await ServiceModel.findByIdAndUpdate({ _id: req.body.orderId }, { $set: { status: 'Pending', invoiceStatus: "false", goStatus: "false", arrivedStatus: "false", workDoneStatus: "false", popupStatus: "Show", roomId: '', invoiceImage: '', invoicePdf: '', time: d2, makeOfferByDeliveryPerson: [] } }, { new: true })
            console.log("Pending order complete is==========>", pendingOrder);
            let cancelOffer = await MakeAOfferDeliveryPerson.findByIdAndUpdate({ _id: checkOrder.offerId }, { $set: { status: 'Cancel' } }, { new: true })
            let allUpdateOfferStatus = await MakeAOfferDeliveryPerson.update({ realOrderId: req.body.orderId }, { $set: { status: 'Cancel' } }, { multi: true, new: true })
            console.log("All status updated", allUpdateOfferStatus)
            console.log("Cancel offer data is==========>", cancelOffer);
            res.send({ status: 'SUCCESS', response_message: i18n.__("You can not send any message as this order has been cancelled."), Data: cancelOffer });
            let checkUser1 = await User.findOne({ _id: cancelOffer.makeOfferById })
            let notiTitle = `Oops! Order Cancelled`
            let notiMessage = `Hi, your order number ${pendingOrder.orderNumber} has been cancelled by ${checkUser.name}`
            if (checkUser1.appLanguage == "Portuguese") {
                notiTitle = `Opa! Pedido foi cancelado`
                notiMessage = `Oi, Seu número de ordem ${pendingOrder.orderNumber} foi cancelado por ${checkUser.name}`
            }
            let notiObj = new Notification({
                notiTo: cancelOffer.makeOfferById,
                notiTitle: notiTitle,
                notiMessage: notiMessage
            })
            let notiData = await notiObj.save()
            console.log("Notification data saved is========>", notiData);
            if (checkUser1.deviceType == 'android' && checkUser1.normalUserNotification == true) {
                func.sendNotificationForAndroid(checkUser1.deviceToken, notiTitle, notiMessage, "orderChangeFromNormal", (error10, result10) => {
                    if (error10) {
                        console.log("Error 10 is=========>", error10);
                    }
                    else {
                        console.log("Send notification is=============>", result10);
                    }
                })
            }
            if (checkUser1.deviceType == 'iOS' && checkUser1.normalUserNotification == true) {
                let query2 = { $and: [{ "notiTo": cancelOffer.makeOfferById }, { "isSeen": "false" }] }
                Notification.find(query2, (error12, result12) => {
                    if (error12) {
                        console.log("Error 12 is=========>", error12);
                    }
                    else {
                        let badgeCount = result12.length;
                        console.log("Badge count is=========>", badgeCount);
                        func.sendiosNotificationProvider(checkUser1.deviceToken, notiTitle, notiMessage, badgeCount, "orderChangeFromNormal", (error10, result10) => {
                            if (error10) {
                                console.log("Error 10 is=========>", error10);
                            }
                            else {
                                console.log("Send notification is=============>", result10);
                            }
                        })
                    }
                })
            }
            let latitude = checkOrder.pickupLat
            let longitude = checkOrder.pickupLong
            console.log("Lat long is========>", latitude, longitude);
            let checkAndroidUser = await User.aggregate([

                {
                    $geoNear: {
                        near: { type: "Point", coordinates: [parseFloat(longitude), parseFloat(latitude)] },
                        key: "location",
                        spherical: true,
                        query: { adminVerifyProfessionalWorker: "true" },
                        maxDistance: 50000,
                        distanceField: "dist.calculated",
                        includeLocs: "locs",
                    },

                },
                {
                    $match: {
                        $and: [{
                            "adminVerifyProfessionalWorker": "true",
                        }, {

                            "status": 'ACTIVE'
                        }, { _id: { $ne: ObjectId(req.body.userId) } }]
                    }


                },
                { "$sort": { "dist": -1 } },
            ])
            if (checkAndroidUser.length == 0) {
                console.log("can not send notification to drivers")
            }
            else {
                for (let i = 0; i < checkAndroidUser.length; i++) {
                    let title = 'New Order Available'
                    let message = `Hi! New order is now available in your area`
                    if (checkAndroidUser[i].appLanguage == "Portuguese") {
                        title = `Nova ordem disponível`
                        message = `Oi, Nova proposta já está disponível no número do seu pedido ODD proposto por`
                    }
                    let notiObj1 = new Notification({
                        notiTo: checkAndroidUser[i]._id,
                        notiTitle: title,
                        notiMessage: message,
                        notificationType: orderAvailableForDelivery
                    })
                    await notiObj1.save()
                    if (checkAndroidUser[i].deviceType == "android" && checkAndroidUser[i].normalUserNotification == true) {
                        func.sendNotificationForAndroid(checkAndroidUser[i].deviceToken, title, message, "orderAvailable", (error10, result10) => {
                            if (error10) {
                                console.log("Error 10 is=========>", error10);
                            }
                            else {
                                console.log("Send notification is=============>", result10);
                            }
                        })
                    }
                    if (checkAndroidUser[i].deviceType == "iOS" && checkAndroidUser[i].normalUserNotification == true) {
                        func.sendiosNotificationProvider(checkAndroidUser[i].deviceToken, title, message, 0, "orderAvailable", (error10, result10) => {
                            if (error10) {
                                console.log("Error 10 is=========>", error10);
                            }
                            else {
                                console.log("Send notification is=============>", result10);
                            }
                        })
                    }
                }
            }

        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //This api is used for get the unseen notification count
    //=============================================Notification Count===============================================//

    getNotificationCount: async (req, res) => {

        try {
            console.log("Request for notification count is==========>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            if (!req.body.userId) {
                console.log("Field is missing")
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") })
            }
            let query = { $and: [{ notiTo: req.body.userId }, { isSeen: false }] }
            let result = await Notification.countDocuments(query, {})
            console.log("Notification count is==========>", result)
            return res.send({ status: "SUCCESS", response_message: i18n.__("Notification Count Found"), Data: result });
        } catch (error) {
            console.log("Error 1 is============>", error)
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") })
        }
    },

    //This api s used for get service category list with sub category
    //=============================================Get Category And Subcategory=====================================//

    orderCategoryList: async (req, res) => {

        try {
            console.log(req.body)
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            let result = await ServiceCategory.aggregate([

                {
                    $match: {
                        status: 'Active'
                    }
                },

                {
                    $lookup: {
                        from: "subcategories",
                        let: {
                            categoryId: "$_id", status: 'Active'
                        },
                        pipeline: [{
                            $match: {
                                $expr:
                                {
                                    $and: [
                                        { $eq: ["$categoryId", "$$categoryId"] },
                                        { $eq: ["$status", "$$status"] },
                                    ]
                                }
                            }
                        }],
                        as: "subCategoryData"
                    }
                }
            ])
            console.log("Category Found", result)
            return res.send({ status: "SUCCESS", response_message: i18n.__("Category Found"), Data: result });
        } catch (error) {
            console.log("Error 1 is============>", error)
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") })
        }
    },

    //This api is used for decline withdraw order request
    //===============================================Decline Withdraw Order Request===================================//

    declineWithdrawOrderRequest: async (req, res) => {

        try {
            console.log("Request for decline withdraw order request=============>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            let query = { $and: [{ "_id": req.body.userId }, { "jwtToken": req.headers.token }] }
            let checkUser = await User.findOne(query)
            if (!checkUser) {
                console.log("Invalid user Id");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            if (checkUser.status == 'INACTIVE') {
                console.log("Account disabled");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") })
            }
            let query1 = { $and: [{ "_id": req.body.orderId }, { "userId": req.body.userId }] }
            let checkOrder = await ServiceModel.findOne(query1)
            if (!checkOrder) {
                console.log("Invalid Order Id");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            let updateOrder = await ServiceModel.findByIdAndUpdate({ _id: req.body.orderId }, { $set: { status: 'Active' } }, { new: true })
            let updateOffer = await MakeAOfferDeliveryPerson.findByIdAndUpdate({ "_id": checkOrder.offerId }, { $set: { status: 'Active' } }, { new: true })
            let updateOrder1 = await ServiceModel.findOneAndUpdate({ "_id": updateOffer.realOrderId, "makeOfferByDeliveryPerson.makeOfferById": updateOffer.makeOfferById }, { $pull: { makeOfferByDeliveryPerson: { makeOfferById: updateOffer.makeOfferById } } }, { safe: true, new: true })
            console.log("Decline Withdraw", updateOrder)
            res.send({ status: "SUCCESS", response_message: i18n.__("Request submitted successfully"), Data: updateOrder });
            let notiUser = await User.findOne({ _id: checkOrder.offerAcceptedOfId })
            if (!notiUser) {
                console.log("Can not send notification to worker");
            }
            else {
                let notiTitle = `Order Withdraw Request Declined`
                let notiMessage = `Hi, your order withdraw request for order number ${updateOrder.orderNumber} has been declined by ${checkUser.name}.`

                if (notiUser.appLanguage == "Portuguese") {
                    notiTitle = `Pedido de retirada de pedido recusado`
                    notiMessage = `Olá, seu pedido para retirar o pedido número ${updateOrder.orderNumber} foi recusado por ${checkUser.name}.`
                }
                let notiObj = new Notification({
                    notiTo: checkOrder.offerAcceptedOfId,
                    notiTitle: notiTitle,
                    notiMessage: notiMessage,
                    notificationType: `declinedWithdrawRequestProfessionalWorker`
                })
                await notiObj.save()
                if (notiUser.deviceType == 'android' && notiUser.normalUserNotification == true) {
                    func.sendNotificationForAndroid(notiUser.deviceToken, notiObj.notiTitle, notiObj.notiMessage, "withdrawRequestDecline", (error10, result10) => {
                        if (error10) {
                            console.log("Error 10 is=========>", error10);
                        }
                        else {
                            console.log("Send notification is=============>", result10);
                        }
                    })
                }
                if (notiUser.deviceType == 'iOS' && notiUser.normalUserNotification == true) {
                    let query2 = { $and: [{ "notiTo": checkOrder.offerAcceptedOfId }, { "isSeen": "false" }] }
                    Notification.find(query2, (error12, result12) => {
                        if (error12) {
                            console.log("Error 12 is=========>", error12);
                        }
                        else {
                            let badgeCount = result12.length;
                            console.log("Badge count is=========>", badgeCount);
                            func.sendiosNotificationProvider(notiUser.deviceToken, notiObj.notiTitle, notiObj.notiMessage, badgeCount, "withdrawRequestDecline", (error10, result10) => {
                                if (error10) {
                                    console.log("Error 10 is=========>", error10);
                                }
                                else {
                                    console.log("Send notification is=============>", result10);
                                }
                            })
                        }
                    })
                }
            }

        } catch (error) {
            console.log("Error  is============>", error)
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") })
        }
    },

    //This api is used for accept withdraw order request
    //==============================================Accept Withdraw Request===========================================//

    acceptWithdrawOrderRequest: async (req, res) => {

        try {
            console.log("Request for accept withdraw order request=============>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            let query = { $and: [{ "_id": req.body.userId }, { "jwtToken": req.headers.token }] }
            let checkUser = await User.findOne(query)
            if (!checkUser) {
                console.log("Invalid user Id");
                return res.send({ status: "FAILURE", response_message: i18n.__("Invalid Token") });
            }
            if (checkUser.status == 'INACTIVE') {
                console.log("Account disabled");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") })
            }
            let query1 = { $and: [{ "_id": req.body.orderId }, { "userId": req.body.userId }] }
            let checkOrder = await ServiceModel.findOne(query1)
            if (!checkOrder) {
                console.log("Invalid Order Id");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            let d1 = new Date(),
                d2 = new Date(d1);
            d2.setMinutes(d1.getMinutes() + 20);
            let myObj = {
                status: 'Pending',
                invoiceStatus: "false",
                goStatus: "false",
                arrivedStatus: "false",
                workDoneStatus: "false",
                popupStatus: "Show",
                roomId: '',
                invoiceImage: '',
                invoicePdf: '',
                time: d2,
                makeOfferByDeliveryPerson: []
            }
            console.log("Status is==========>", myObj);
            let updateOrder = await ServiceModel.findByIdAndUpdate({ _id: req.body.orderId }, { $set: myObj }, { new: true })
            let allUpdateOfferStatus = await MakeAOfferDeliveryPerson.update({ realOrderId: req.body.orderId }, { $set: { status: 'Cancel' } }, { multi: true, new: true })
            console.log("All status updated", allUpdateOfferStatus)
            console.log("Accept Withdraw", updateOrder)
            res.send({ status: "SUCCESS", response_message: i18n.__("Request submitted successfully"), Data: updateOrder });
            let notiUser = await User.findOne({ _id: checkOrder.offerAcceptedOfId })
            if (!notiUser) {
                console.log("Can not send notification to worker");
            }
            else {
                let notiTitle = `Order Withdraw Request Accepted`
                let notiMessage = `Hi, your order withdraw request for order number ${updateOrder.orderNumber} has been accepted by ${checkUser.name}.`

                if (notiUser.appLanguage == "Portuguese") {
                    notiTitle = `Pedido de retirada de pedido aceite`
                    notiMessage = `Olá, seu pedido para retirar o pedido número ${updateOrder.orderNumber} foi aceito por ${checkUser.name}.`
                }
                let notiObj = new Notification({
                    notiTo: checkOrder.offerAcceptedOfId,
                    notiTitle: notiTitle,
                    notiMessage: notiMessage,
                    notificationType: `acceptWithdrawRequestProfessionalWorker`
                })
                await notiObj.save()
                if (notiUser.deviceType == 'android' && notiUser.normalUserNotification == true) {
                    func.sendNotificationForAndroid(notiUser.deviceToken, notiObj.notiTitle, notiObj.notiMessage, `acceptWithdrawRequest${checkOrder.serviceType}`, (error10, result10) => {
                        if (error10) {
                            console.log("Error 10 is=========>", error10);
                        }
                        else {
                            console.log("Send notification is=============>", result10);
                        }
                    })
                }
                if (notiUser.deviceType == 'iOS' && notiUser.normalUserNotification == true) {
                    let query2 = { $and: [{ "notiTo": checkOrder.offerAcceptedOfId }, { "isSeen": "false" }] }
                    Notification.find(query2, (error12, result12) => {
                        if (error12) {
                            console.log("Error 12 is=========>", error12);
                        }
                        else {
                            let badgeCount = result12.length;
                            console.log("Badge count is=========>", badgeCount);
                            func.sendiosNotificationProvider(notiUser.deviceToken, notiObj.notiTitle, notiObj.notiMessage, badgeCount, `acceptWithdrawRequest${checkOrder.serviceType}`, (error10, result10) => {
                                if (error10) {
                                    console.log("Error 10 is=========>", error10);
                                }
                                else {
                                    console.log("Send notification is=============>", result10);
                                }
                            })
                        }
                    })
                }
                let latitude = checkOrder.pickupLat
                let longitude = checkOrder.pickupLong
                console.log("Lat long is========>", latitude, longitude);
                let notiRequest = {}
                let selectCategoryName = checkOrder.selectCategoryName
                let selectSubCategoryName = checkOrder.selectSubCategoryName
                if (checkOrder.selectSubCategoryName == '') {
                    notiRequest = {
                        $and: [{
                            "userType": "Provider",
                            "dutyStatus": 'On'
                        }, {

                            "status": 'ACTIVE'
                        }, { "categoryNameArray.serviceCategory": { $eq: selectCategoryName } },
                        ]
                    }

                }
                if (!checkOrder.selectSubCategoryName == '') {
                    notiRequest = {
                        $and: [{
                            "userType": "Provider",
                            "dutyStatus": 'On'
                        }, {

                            "status": 'ACTIVE'
                        }, { "categoryNameArray.serviceCategory": { $eq: selectCategoryName } },
                        { "subCategoryNameArray.serviceSubCategory": { $eq: selectSubCategoryName } }]
                    }

                }
                let checkNotiUser = await User.aggregate([
                    {
                        $geoNear: {
                            near: { type: "Point", coordinates: [parseFloat(longitude), parseFloat(latitude)] },
                            key: "location",
                            spherical: true,
                            query: { userType: "Provider" },
                            maxDistance: 100000,
                            distanceField: "dist.calculated",
                            includeLocs: "locs",
                        },

                    },
                    {
                        $match: notiRequest

                    },
                    { "$sort": { "dist": -1 } },
                ])
                console.log("Noti user is========>", checkNotiUser.length)
                if (checkNotiUser.length == 0) {
                    console.log("can not send notification to drivers")
                    return;
                }
                else {
                    for (let i = 0; i < checkNotiUser.length; i++) {
                        let message = `Hi,New order is now available in your area`
                        let title = "New Order Available"
                        if (checkNotiUser[i].appLanguage == "Portuguese") {
                            message = `Oi, Nova proposta já está disponível no número do seu pedido ODD proposto por`
                            title = "Nova ordem disponível"
                        }
                        let notiObj1 = new Notification({
                            notiTo: checkNotiUser[i]._id,
                            notiTitle: title,
                            notiMessage: message,
                            notificationType: "orderAvailableForDelivery"
                        })
                        await notiObj1.save()
                        if (checkNotiUser[i].deviceType == "android" && checkNotiUser[i].normalUserNotification == true) {
                            console.log("Deviec is=======>", checkNotiUser[i].deviceToken)
                            func.sendNotificationForAndroid(checkNotiUser[i].deviceToken, title, message, "orderAvailableForDelivery", (error10, result10) => {
                                if (error10) {
                                    console.log("Error 10 is=========>", error10);
                                }
                                else {
                                    console.log("Send notification is=============>", result10);
                                    return;
                                }
                            })
                        }
                        else if (checkNotiUser[i].deviceType == "iOS" && checkNotiUser[i].normalUserNotification == true) {
                            func.sendiosNotificationProvider(checkNotiUser[i].deviceToken, title, message, 0, "orderAvailableForDelivery", (error10, result10) => {
                                if (error10) {
                                    console.log("Error 10 is=========>", error10);
                                }
                                else {
                                    console.log("Send notification is=============>", result10);
                                }
                            })
                        }
                    }
                    return;
                }

            }

        } catch (error) {
            console.log("Error 1 is============>", error)
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") })
        }
    },

    //This api used for get latitude and longitude for live tracking
    //=================================================Get Tracking Data==============================================//

    getTracking: async (req, res) => {

        try {
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            console.log("Request for get tarcking data is===========>", req.body);
            if (!req.body.roomId) {
                console.log("Field is missing")
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") })
            }
            let trackingData = await Tracking.findOne({ roomId: req.body.roomId })
            if (!trackingData) {
                console.log("Invalid room Id");
                return res.send({ status: "FAILURE", response_message: i18n.__("Invalid Token") });
            }
            res.send({ status: "SUCCESS", response_message: i18n.__("Tracking Data Found"), Data: trackingData });
        } catch (error) {
            console.log("Error  is============>", error)
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") })
        }
    },

    //==============================================Order Withdraw From Deli and Pro==================================//

    //This api is used for order withdraw by delivery and professioanl worker
    orderWithdrawFromDeliveryAndPro: async (req, res) => {

        try {
            console.log("Request for order cancel by normal user or delivery person is=============>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            if (!req.body.userId || !req.headers.token || !req.body.orderId) {
                console.log("User is missing");
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });;
            }
            else {
                let query = { $and: [{ "_id": req.body.userId }, { "jwtToken": req.headers.token }] }
                let checkUser = await User.findOne(query)
                if (!checkUser) {
                    console.log("Invalid user Id");
                    return res.send({ status: "FAILURE", response_message: "Invalid Token" });
                }
                if (checkUser.status == 'INACTIVE') {
                    console.log("Account disabled");
                    return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") })
                }
                let query1 = { $and: [{ "realOrderId": req.body.orderId }, { "makeOfferById": req.body.userId }] }
                let checkOffer = await MakeAOfferDeliveryPerson.findOne(query1).sort({ createdAt: -1 })
                if (!checkOffer) {
                    console.log("Invalid order Id");
                    return res.send({ status: "FAILURE", response_message: "Invalid Token" });
                }
                if (checkOffer.status == 'Request') {
                    console.log("Your have been already submitted order withdraw request on this order");
                    return res.send({ status: "FAILURE", response_message: i18n.__("Sorry! You have been already submitted order withdraw request on this order.") })
                }
                if (checkOffer.status == 'Active') {
                    let updateOffer = await MakeAOfferDeliveryPerson.findByIdAndUpdate({ "_id": checkOffer._id }, { $set: { "status": 'Request' } }, { new: true })
                    let updateOrder1 = await ServiceModel.findByIdAndUpdate({ _id: req.body.orderId }, { $set: { status: "Request" } }, { new: true })
                    console.log("Update order is==========>", updateOrder1);
                    res.send({ status: 'SUCCESS', response_message: i18n.__("Order withdraw request submitted successfully"), response: updateOrder1 });
                    let notificationType = 'orderCancelFromProfessional'
                    let checkUser1 = await User.findOne({ _id: updateOffer.orderOwner })

                    let notiTitle = `Order Withdraw Request`
                    let notiMessage = `Hi ${checkUser1.name}! ${checkUser.name} want to withdraw your order for order number ${checkOffer.orderNumber}.`

                    if (checkUser1.appLanguage == "Portuguese") {
                        notiTitle = `Pedido de retirada de pedido`
                        notiMessage = `Oi ${checkUser1.name}! Provider deseja retirar seu pedido número.`
                    }
                    let notiObj = new Notification({
                        notiTo: updateOffer.orderOwner,
                        notiTitle: notiTitle,
                        notiMessage: notiMessage,
                        notificationType: `withdrawByorderCancelFromProfessional`
                    })
                    notiObj.save()
                    if (checkUser1.deviceType == 'android' && checkUser1.normalUserNotification == true) {
                        func.sendNotificationForAndroid(checkUser1.deviceToken, notiObj.notiTitle, notiObj.notiMessage, notificationType, (error10, result10) => {
                            console.log("Notification Sent");
                            return;
                        })
                    }
                    if (checkUser1.deviceType == 'iOS' && checkUser1.normalUserNotification == true) {
                        let query2 = { $and: [{ "notiTo": updateOffer.orderOwner }, { "isSeen": "false" }] }
                        Notification.find(query2, (error12, result12) => {
                            if (error12) {
                                console.log("Error 12 is=========>", error12);
                            }
                            else {
                                let badgeCount = result12.length;
                                console.log("Badge count is=========>", badgeCount);
                                func.sendiosNotification(checkUser1.deviceToken, notiObj.notiTitle, notiObj.notiMessage, badgeCount, notificationType, (error10, result10) => {
                                    console.log("Notification Sent");
                                    return;
                                })
                            }
                        })
                    }
                }

            }
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //==============================================Check order accept or not=========================================//

    checkOrderAcceptOrNot: async (req, res) => {

        try {
            console.log("Request for order cancel by normal user or delivery person is=============>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            if (!req.body.userId || !req.headers.token || !req.body.orderId) {
                console.log("User is missing");
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });;
            }
            let query = { $and: [{ "_id": req.body.userId }, { "jwtToken": req.headers.token }] }
            let checkUser = await User.findOne(query)
            if (!checkUser) {
                console.log("Invalid user Id");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            if (checkUser.status == 'INACTIVE') {
                console.log("Account disabled");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") })
            }
            let checkOrder = await ServiceModel.findOne({ _id: req.body.orderId })
            if (!checkOrder) {
                console.log("Invalid order Id");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            if (checkOrder.status == "Pending") {
                console.log("You can make a offer on this order now.")
                return res.send({ status: 'SUCCESS', response_message: i18n.__("You can make a offer on this order now.") });
            }
            console.log("Oops! This order has been taken by another worker");
            return res.send({ status: "FAILURE", response_message: i18n.__("Oops! order is not available at this moment") });
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //===============================================Duty Status Update===============================================//

    updateDutyStatus: async (req, res) => {

        try {
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            if (!req.body.userId || !req.headers.token) {
                console.log("User is missing");
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });;
            }
            let query = { $and: [{ "_id": req.body.userId }, { "jwtToken": req.headers.token }] }
            let checkUser = await User.findOne(query)
            if (!checkUser) {
                console.log("Invalid user Id");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            if (checkUser.status == 'INACTIVE') {
                console.log("Account disabled");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") })
            }
            await User.findByIdAndUpdate({ _id: req.body.userId }, { $set: { dutyStatus: req.body.status } }, { new: true })
            console.log("Duty status has been updated successfully");
            return res.send({ status: "SUCCESS", response_message: i18n.__("Duty status has been updated successfully") });
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //==============================================Provder Signup===================================================//

    providerSignup: async (req, res) => {

        try {
            console.log("Request for provider signup is===========>", req.body);
            console.log("Request for provider signup is===========>", req.files);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            if (!req.body.mobileNumber || !req.body.countryCode || !req.body.name || !req.body.email || !req.body.speakLanguage || !req.body.appLanguage) {
                console.log("Field is missing");
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });
            }
            let checkEmail = await User.findOne({ email: req.body.email })
            if (checkEmail) {
                console.log("Email already exist");
                return res.send({ status: "FAILURE", response_message: i18n.__('Email already exist') });
            }
            let query = { $and: [{ countryCode: req.body.countryCode }, { mobileNumber: req.body.mobileNumber }] }
            let checkMobileNumber = await User.findOne(query)
            if (checkMobileNumber) {
                console.log("Mobile Number already exist");
                return res.send({ status: "FAILURE", response_message: i18n.__('Mobile number already exist') });
            }
            var jwtToken = jwt.sign({ "email": req.body.email }, config.jwtSecretKey);
            var encryptedToken = cryptr.encrypt(jwtToken);
            console.log("Token is===========>", encryptedToken);
            let orderNumber = (new Date().getTime()).toString()
            let professiona1Id = Number(orderNumber.substring(3, 13))
            console.log("Unique id is============>", professiona1Id);
            let identityProof = ''
            let profilePic = ''
            let addressProof = ''
            let drivingLicence = ''
            let workImage = []
            let professionalProfie = ''
            if (req.files.identityProof) {
                let uploadedImage = await cloudinary.v2.uploader.upload(req.files.identityProof.path, { resource_type: "image" })
                identityProof = uploadedImage.secure_url
            }
            if (req.files.addressProof) {
                let uploadedImage = await cloudinary.v2.uploader.upload(req.files.addressProof.path, { resource_type: "image" })
                addressProof = uploadedImage.secure_url
            }
            if (req.files.workImage) {
                for (let i = 0; i < req.files.workImage.length; i++) {
                    let uploadedImage = await cloudinary.v2.uploader.upload(req.files.workImage[i].path, { resource_type: "image" })
                    workImage.push(uploadedImage.secure_url)
                }
            }
            if (req.files.drivingLicence) {
                let uploadedImage = await cloudinary.v2.uploader.upload(req.files.drivingLicence.path, { resource_type: "image" })
                drivingLicence = uploadedImage.secure_url
            }
            if (req.files.profilePic) {
                let uploadedImage = await cloudinary.v2.uploader.upload(req.files.profilePic.path, { resource_type: "image" })
                profilePic = uploadedImage.secure_url
            }
            let signupObj = new User({
                "fullName": req.body.fullName,
                "userName": req.body.userName,
                "name": req.body.name,
                "country": req.body.country,
                "email": req.body.email,
                "profilePic": profilePic,
                "countryCode": req.body.countryCode,
                "appLanguage": req.body.appLanguage,
                "speakLanguage": req.body.speakLanguage,
                "mobileNumber": req.body.mobileNumber,
                "deviceType": req.body.deviceType,
                "deviceToken": req.body.deviceToken,
                "jwtToken": encryptedToken,
                "onlineStatus": "Online",
                "signupWithNormalPerson": "true",
                professiona1PersonUniqueId: professiona1Id,
                identityProof: identityProof,
                addressProof: addressProof,
                workImage: workImage,
                drivingLicence: drivingLicence,
                professionalProfie: professionalProfie,
                transportMode: req.body.transportMode,
                serviceCategory: req.body.serviceCategory,
                serviceSubCategory: req.body.serviceSubCategory,
                signupWithProfessionalWorker: "true",
                userType: 'Provider',
                categoryNameArray: JSON.parse(req.body.categoryNameArray),
                subCategoryNameArray: JSON.parse(req.body.subCategoryNameArray),
                "location": { "type": "Point", "coordinates": [46.6030529016949, 24.8055946517755] }
            })
            let signupData = await signupObj.save()
            console.log("You have successfully signed up", signupData);
            return res.send({ status: "SUCCESS", response_message: i18n.__("Provider signup request submitted successfully. Please wait for admin approval."), Data: signupData });
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //===============================================Get subcategory list by category================================//

    getSubCategoryListByCategory: async (req, res) => {

        try {
            console.log("Request for get subcategory is=======>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            let subcategoryData = []
            let ids = req.body.categoryIds
            for (let i = 0; i < ids.length; i++) {
                let getSubCategory = await ServiceSubCategory.find({ categoryId: ids[i], status: 'Active' })
                console.log("Real sub-category is========>", getSubCategory)
                if (getSubCategory.length > 0) {
                    for (let j = 0; j < getSubCategory.length; j++) {
                        subcategoryData.push(getSubCategory[j])
                    }
                }
            }
            console.log("Sub-category list found");
            return res.send({ status: "SUCCESS", response_message: i18n.__("Sub-category list found"), Data: subcategoryData });
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    updateSubcategory: async (req, res) => {

        try {
            let updateSubcategory = await ServiceSubCategory.update({ categoryId: req.body.categoryId }, { $set: { categoryName: req.body.categoryName } }, { new: true, multi: true })
            console.log("Update subcategory is==========>", updateSubcategory)
            return res.send({ code: 200, message: 'Update' })

        } catch (error) {
            console.log("Error is========>", error)
        }
    }


}

//Fuction for delete order of normal user
async function deleteOrder() {
    try {
        var d = new Date();
        var n = d.getTime();
        console.log("Current time stamp is==========>", n);
        let query = { $and: [{ time: { $lte: n } }, { status: 'Pending' }, { deleteStatus: false }] }
        let findOrder = await ServiceModel.find(query)
        if (findOrder.length == 0) {
            console.log("No cron data till time");
            return
        }
        for (let i = 0; i < findOrder.length; i++) {
            let checkOrder = await ServiceModel.findOne({ _id: findOrder[i]._id })
            let lastLength = checkOrder.makeOfferByDeliveryPerson.length
            console.log("Length is=========>", checkOrder.makeOfferByDeliveryPerson.length)
            if (lastLength == 0) {
                let deleteOrder = await ServiceModel.findByIdAndUpdate({ "_id": checkOrder._id }, { $set: { deleteStatus: true } }, { new: true })
                console.log("Order deleted successfully", deleteOrder);
                let checkUser = await User.findOne({ "_id": deleteOrder.userId })
                if (!checkUser) {
                    console.log("Can not send notification")
                }
                else {
                    let title = 'Oops! Order Removed'
                    let message = `Your order has been removed due to time limit or no worker was able to take your order`
                    if (checkUser.appLanguage == "") {
                        title = 'Opa! Pedido removido'
                        message = `Seu pedido foi removido devido a um limite de tempo ou não Profissional foi capaz de fazer seu pedido`
                    }
                    if (checkUser.deviceType == 'android' && checkUser.normalUserNotification == true) {
                        func.sendNotificationForAndroid(checkUser.deviceToken, title, message, "orderDelete", (error10, result10) => {
                            if (error10) {
                                console.log("Error 10 is=========>", error10);
                            }
                            else {
                                console.log("Send notification is=============>", result10);
                            }
                        })
                    }
                    if (checkUser.deviceType == 'iOS' && checkUser.normalUserNotification == true) {
                        let query2 = { $and: [{ "notiTo": checkUser._id }, { "isSeen": "false" }] }
                        Notification.find(query2, (error12, result12) => {
                            if (error12) {
                                console.log("Error 12 is=========>", error12);
                            }
                            else {
                                let badgeCount = result12.length;
                                console.log("Badge count is=========>", badgeCount);
                                func.sendiosNotification(checkUser.deviceToken, title, message, badgeCount, "orderDelete", (error10, result10) => {
                                    if (error10) {
                                        console.log("Error 10 is=========>", error10);
                                    }
                                    else {
                                        console.log("Send notification is=============>", result10);
                                    }
                                })
                            }
                        })
                    }
                }
            }
            else {
                console.log("Can not delete order");
            }
        }
        return;

    } catch (error) {
        console.log("Error is==========>", error);

    }
}

//Fuction for delete offer of delivery person
async function deleteOffer() {
    try {
        var d = new Date();
        var n = d.getTime();
        console.log("Current time stamp is==========>", n);
        let query = { $and: [{ time: { $lte: n } }, { status: 'Pending' }, { deleteStatus: false }] }
        let findOffer = await MakeAOfferDeliveryPerson.find(query)
        if (findOffer.length == 0) {
            console.log("No cron data till time");
            return
        }
        for (let i = 0; i < findOffer.length; i++) {
            let deleteOffer = await MakeAOfferDeliveryPerson.findByIdAndUpdate({ "_id": findOffer[i]._id }, { $set: { deleteStatus: true } }, { new: true })
            let updateOrder = await ServiceModel.findOneAndUpdate({ "_id": deleteOffer.realOrderId, "makeOfferByDeliveryPerson.makeOfferById": deleteOffer.makeOfferById }, { $pull: { makeOfferByDeliveryPerson: { makeOfferById: deleteOffer.makeOfferById } } }, { safe: true, new: true })
            console.log("Offer deleted successfully", deleteOffer);
            let checkUser = await User.findOne({ "_id": findOffer[i].makeOfferById })
            if (!checkUser) {
                console.log("Can not send notification")
            }
            else {
                let title = 'Oops! Offer Removed'
                let message = `Your offer has been removed due to time limit or no user was able to accept your offer`
                if (checkUser.appLanguage == "") {
                    title = 'Opa! Proposta removida'
                    message = `Sua proposta foi removida devido ao limite de tempo ou nenhum usuário aceitou a sua proposta`
                }
                if (checkUser.deviceType == 'android' && checkUser.normalUserNotification == true) {
                    func.sendNotificationForAndroid(checkUser.deviceToken, title, message, "offerDelete", (error10, result10) => {
                        if (error10) {
                            console.log("Error 10 is=========>", error10);
                        }
                        else {
                            console.log("Send notification is=============>", result10);
                        }
                    })
                }
                if (checkUser.deviceType == 'iOS' && checkUser.normalUserNotification == true) {
                    let query2 = { $and: [{ "notiTo": checkUser._id }, { "isSeen": "false" }] }
                    Notification.find(query2, (error12, result12) => {
                        if (error12) {
                            console.log("Error 12 is=========>", error12);
                        }
                        else {
                            let badgeCount = result12.length;
                            console.log("Badge count is=========>", badgeCount);
                            func.sendiosNotificationProvider(checkUser.deviceToken, title, message, badgeCount, "offerDelete", (error10, result10) => {
                                if (error10) {
                                    console.log("Error 10 is=========>", error10);
                                }
                                else {
                                    console.log("Send notification is=============>", result10);
                                }
                            })
                        }
                    })
                }
            }
        }
        return;
    } catch (error) {
        console.log("Error is==========>", error);

    }
}

//Function for delete past order of normal user
async function deletePastOrder() {
    try {
        var d = new Date();
        var n = d.getTime();
        console.log("Current time stamp is==========>", n);
        let query = { $and: [{ pastOrderTime: { $lte: n } }, { status: 'Complete' }, { deleteStatus: false }] }
        let findOrder = await ServiceModel.find(query)
        if (findOrder.length == 0) {
            console.log("No cron data till time");
            return
        }
        for (let i = 0; i < findOrder.length; i++) {
            let deleteOrder = await ServiceModel.findByIdAndUpdate({ "_id": findOrder[i]._id }, { $set: { deleteStatus: true } }, { new: true })
            console.log("Offer deleted successfully", deleteOrder);
        }
        return;
    } catch (error) {
        console.log("Error is==========>", error);
    }
}

//Function for delete past delivery person order 
async function deletePastOffer() {
    try {
        var d = new Date();
        var n = d.getTime();
        console.log("Current time stamp is==========>", n);
        let query = { $and: [{ pastOrderTime: { $lte: n } }, { status: 'Complete' }, { deleteStatus: false }] }
        let findOffer = await MakeAOfferDeliveryPerson.find(query)
        if (findOffer.length == 0) {
            console.log("No cron data till time");
            return
        }
        for (let i = 0; i < findOffer.length; i++) {
            let deleteOffer = await MakeAOfferDeliveryPerson.findByIdAndUpdate({ "_id": findOffer[i]._id }, { $set: { deleteStatus: true } }, { new: true })
            console.log("Offer deleted successfully", deleteOffer);
        }
        return;
    } catch (error) {
        console.log("Error is==========>", error);

    }
}