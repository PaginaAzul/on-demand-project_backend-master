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
const Homebanner = require('../models/homeBannerModel.js');
const Mainservice = require('../models/mainServiceTypeModel.js');
const Seller = require('../models/sellerModel.js');
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
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const Driver = require('../models/driverModel.js');
const Driverrating = require('../models/driverRatingModel.js');
const Product = require('../models/productModel.js');
const Favourite = require('../models/favouriteModel.js');
const Cart = require('../models/cartModel.js');
const Cuisine = require('../models/cuisineModel.js');
const Productcategory = require('../models/productCategoryModel.js');
const Productsubcategory = require('../models/productSubCategoryModel.js');
const Payment = require('../models/paymentModel.js');
const Orderproduct = require('../models/productOrderModel.js');
const Storerating = require('../models/storeRatingModel.js');
const Commission = require('../models/commissionModel.js');
const Deliveryslot = require('../models/deliverySlotModel.js');


module.exports = {


    //=======================================Seller Signup=============================================//

    sellerSignup: async (req, res) => {

        try {
            console.log("Request for seller signup is==========>", req.files);
            console.log("Request for seller signup is==========>", req.body);
            let checkEmail = await Seller.findOne({ email: req.body.email })
            if (checkEmail) {
                console.log("Email already exist");
                return res.send({ status: "FAILURE", response_message: 'Email already exist' });
            }
            let query = { $and: [{ countryCode: req.body.countryCode }, { mobileNumber: req.body.mobileNumber }] }
            let checkMobileNumber = await Seller.findOne(query)
            if (checkMobileNumber) {
                console.log("Mobile Number already exist");
                return res.send({ status: "FAILURE", response_message: 'Mobile number already exist' });
            }
            let profilePic = ''
            if (req.files.image) {
                let uploadedImage = await cloudinary.v2.uploader.upload(req.files.image.path, { resource_type: "image" })
                profilePic = uploadedImage.secure_url
            }
            let document = ''
            if (req.files.document) {
                let uploadedImage = await cloudinary.v2.uploader.upload(req.files.document.path)
                document = uploadedImage.secure_url
            }
            req.body.password = await bcrypt.hashSync(req.body.password, 10);
            let signupObj = new Seller({
                name: req.body.name,
                image: profilePic,
                document: document,
                email: req.body.email,
                mobileNumber: req.body.mobileNumber,
                password: req.body.password,
                address: req.body.address,
                storeType: req.body.storeType,
                longitude: req.body.longitude,
                latitude: req.body.latitude,
                location: { "type": "Point", "coordinates": [parseFloat(req.body.longitude), parseFloat(req.body.latitude)] }
            })
            let signupData = await signupObj.save()
            var jwtToken = jwt.sign({ "_id": signupData._id }, config.jwtSecretKey);
            await Seller.findByIdAndUpdate({ _id: signupData._id }, { $set: { jwtToken: jwtToken } }, { new: true })
            console.log("Signup successfully", signupData);
            return res.send({ status: "SUCCESS", response_message: "Signup successfully" });
        } catch (error) {
            console.log("Error is=======>", error);
            return res.send({ status: "FAILURE", response_message: 'Internal server error' });

        }
    },

    //========================================Seller profile update====================================//

    sellerProfileUpdate: async (req, res) => {

        try {
            console.log("Request for seller update is==========>", req.files);
            console.log("Request for seller update is==========>", req.body);
            let checkSeller = await Seller.findOne({ _id: req.body.sellerId })
            if (!checkSeller) {
                console.log("Something went wrong")
                return res.send({ response_code: 500, response_message: "Something went wrong" })
            }
            let profilePic = checkSeller.image
            if (req.files.image) {
                let uploadedImage = await cloudinary.v2.uploader.upload(req.files.image.path, { resource_type: "image" })
                profilePic = uploadedImage.secure_url
            }
            let signupObj = {
                name: req.body.name,
                image: profilePic,
                address: req.body.address,
                longitude: req.body.longitude,
                latitude: req.body.latitude,
                deliveryTime: req.body.deliveryTime,
                description: req.body.description,
                minimumValue: req.body.minimumValue,
                openingTime: req.body.openingTime,
                closingTime: req.body.closingTime,
                cuisinesName: JSON.parse(req.body.cuisinesName),
                categoryIds: req.body.categoryIds,
                subCategoryId: req.body.subCategoryId,
                location: { "type": "Point", "coordinates": [parseFloat(req.body.longitude), parseFloat(req.body.latitude)] }
            }
            await Seller.findByIdAndUpdate({ _id: req.body.sellerId }, { $set: signupObj }, { new: true })
            console.log("Profile updated successfully");
            return res.send({ status: "SUCCESS", response_message: "Profile updated successfully" });
        } catch (error) {
            console.log("Error is=======>", error);
            return res.send({ status: "FAILURE", response_message: 'Internal server error' });

        }
    },

    //=========================================Seller login=============================================//

    sellerLogin: async (req, res) => {

        try {
            console.log("Request for seller login is===========>", req.body);
            if (!req.body.email || !req.body.password) {
                console.log("Field is required");
                return res.send({ response_code: 501, response_message: "Something went wrong" })
            }
            let checkSeller = await Seller.findOne({ email: (req.body.email).toLowerCase() })
            if (!checkSeller) {
                console.log("Invalid Credentials1")
                return res.send({ response_code: 500, response_message: "Invalid Credentials" })
            }
            if (checkSeller.emailVerificationStatus == "Pending") {
                console.log("You email verification is pending. Please verify your mail.")
                return res.send({ response_code: 500, response_message: "You email verification is pending. Please verify your mail." })
            }
            let passVerify = bcrypt.compareSync(req.body.password, checkSeller.password)
            console.log("pas veri", passVerify)
            if (!passVerify) {
                console.log("Invalid Credentials2");
                return res.send({ response_code: 404, response_message: "Invalid Credentials" })
            }
            let jwtToken = jwt.sign({ "_id": checkSeller._id }, config.jwtSecretKey);
            let updateSeller = await Seller.findByIdAndUpdate({ _id: checkSeller._id }, { $set: { jwtToken: jwtToken } }, { new: true })
            delete (updateSeller.password)
            console.log("Admin has successfully logged in", updateSeller)
            return res.send({ response_code: 200, response_message: "You have successfully logged in ", Data: updateSeller })
        } catch (error) {
            console.log("Error is=======>", error);
            return res.send({ status: "FAILURE", response_message: 'Internal server error' });
        }


    },

    //=========================================Seller logout============================================//

    sellerLogout: async (req, res) => {

        try {
            console.log("Request for logout is===========>", req.body);
            let checkSeller = await Seller.findByIdAndUpdate({ _id: req.body.sellerId }, { $set: { jwtToken: '' } }, { new: true })
            console.log("Logout successfully", checkSeller);
            return res.send({ response_code: 200, response_message: "Logout successfully" });
        } catch (error) {
            console.log("Error is=======>", error);
            return res.send({ status: "FAILURE", response_message: 'Internal server error' });
        }

    },

    //=========================================Reset password===========================================//

    sellerChangePassword: async (req, res) => {

        try {
            console.log("Request for seller reset password is===========>", req.body);
            let checkSeller = await Seller.findOne({ _id: req.body.sellerId })
            if (!checkSeller) {
                console.log("Something went wrong")
                return res.send({ response_code: 500, response_message: "Something went wrong" })
            }
            let passVerify = await bcrypt.compareSync(req.body.oldPassword, checkSeller.password);
            response.log("Password verification status is===========>", passVerify);
            if (!passVerify) {
                console.log("Something went wrong")
                return res.send({ response_code: 500, response_message: "Old password is incorrect" })
            }
            req.body.newPassword = bcrypt.hashSync(req.body.newPassword, salt);
            let sellerData = await Seller.findByIdAndUpdate({ _id: req.body.sellerId }, { $set: { "password": req.body.newPassword } }, { new: true })
            response.log("Password changed successfully", sellerData);
            return res.send({ response_code: 200, response_message: "Password has been changed successfully" });
        } catch (error) {
            console.log("Error is=======>", error);
            return res.send({ status: "FAILURE", response_message: 'Internal server error' });
        }

    },

    //========================================Seller forgot password====================================//

    selerForgotPassword: async (req, res) => {

        try {
            console.log("Request for forgot password===========>", req.body);
            if (!req.body.email) {
                console.log("Email is required")
                return res.send({ response_code: 401, response_message: "Email is required" })
            }
            req.body.email = req.body.email.toLowerCase();
            let checkSeller = await Seller.findOne({ email: req.body.email })
            if (!checkSeller) {
                console.log("Something went wrong")
                return res.send({ response_code: 500, response_message: "Something went wrong" })
            }
            let name = checkSeller.name
            let otp = Math.floor(10000000 + Math.random() * 90000000)
            let password = otp.toString()
            let newPassword = bcrypt.hashSync(password, 10);
            console.log("New password is===========>", newPassword);
            console.log("Password is===========>", password);
            await Seller.findByIdAndUpdate({ _id: checkSeller._id }, { $set: { password: newPassword } }, { new: true })
            console.log("New password has been sent on your registered email")
            res.send({ response_code: 200, response_message: "New password has been sent on your registered email" })
            func.sendHtmlEmail(req.body.email, "Forgot Password", name, password, (error2, sent) => {
                console.log("Mail send")
            })

        } catch (error) {
            console.log("Error is=======>", error);
            return res.send({ status: "FAILURE", response_message: 'Internal server error' });
        }

    },

    //========================================Get Seller data==========================================//

    getSellerDetail: async (req, res) => {

        try {
            if (!req.body.sellerId) {
                return res.send({ response_code: 401, response_message: "Something went wrong" })
            }
            let result = await Seller.findOne({ "_id": req.body.sellerId }).lean()
            if (!result) {
                console.log("Seller Id is not correct")
                return res.send({ response_code: 500, response_message: "Something went wrong" })
            }
            delete (result.password)
            console.log("Seller data found successfully", result)
            return res.send({ response_code: 200, response_message: "Seller data found successfully", Data: result })

        } catch (error) {
            console.log("Error is============>", error)
            return res.send({ response_code: 500, response_message: "Internal server error" })
        }
    },

    //=========================================Update notification status==============================//

    updateNotificationStatus: async (req, res) => {

        try {
            console.log("Request for update notification status is===========>", req.body);
            let checkSeller = await Seller.findByIdAndUpdate({ _id: req.body.sellerId }, { $set: { notificationStatus: req.body.notificationStatus } }, { new: true })
            if (!checkSeller) {
                console.log("Seller Id is not correct")
                return res.send({ response_code: 500, response_message: "Something went wrong" })
            }
            console.log("Status updated successfully", checkSeller);
            return res.send({ response_code: 200, response_message: "Status updated successfully" });
        } catch (error) {
            console.log("Error is============>", error)
            return res.send({ response_code: 500, response_message: "Internal server error" })
        }
    },

    //=========================================Add product===========================================//

    addProduct: async (req, res) => {

        try {
            console.log("Request for add product is==============>", req.body);
            let productImage = ''
            if (req.files.productImage) {
                let uploadedImage = await cloudinary.v2.uploader.upload(req.files.productImage.path, { resource_type: "image" })
                productImage = uploadedImage.secure_url
            }
            if (req.body.type == "Menu") {
                let productObj = new Product({
                    resAndStoreId: req.body.sellerId,
                    cuisineId: req.body.cuisineId,
                    type: req.body.type,
                    productName: req.body.productName,
                    description: req.body.description,
                    productType: req.body.productType,
                    quantity: req.body.quantity,
                    measurement: req.body.measurement,
                    price: req.body.price,
                    cuisine: req.body.cuisine,
                    productImage: productImage,
                    tasteType: req.body.tasteType,
                    eatType: req.body.eatType
                })
                let productData = await productObj.save()
                console.log("Menu added successfully", productData);
                return res.send({ response_code: 200, response_message: "Menu added successfully" });
            }
            if (req.body.type == "Product") {
                let productObj = new Product({
                    resAndStoreId: req.body.sellerId,
                    productCategoryId: req.body.productCategoryId,
                    type: req.body.type,
                    productName: req.body.productName,
                    description: req.body.description,
                    productType: req.body.productType,
                    quantity: req.body.quantity,
                    measurement: req.body.measurement,
                    price: req.body.price,
                    categoryName: req.body.categoryName,
                    subCategoryName: req.body.subCategoryName,
                    productImage: productImage
                })
                let productData = await productObj.save()
                console.log("Product added successfully", productData);
                return res.send({ response_code: 200, response_message: "Product added successfully" });
            }

        } catch (error) {
            console.log("Error is============>", error)
            return res.send({ response_code: 500, response_message: "Internal server error" })
        }
    },

    //===========================================Edit product========================================//

    editProduct: async (req, res) => {

        try {
            console.log("Request for add product is==============>", req.body);
            let checkProduct = await Product.findOne({ _id: req.body.productId })
            if (!checkProduct) {
                console.log("Invalid product Id");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            let productImage = checkProduct.productImage
            if (req.files.productImage) {
                let uploadedImage = await cloudinary.v2.uploader.upload(req.files.productImage.path, { resource_type: "image" })
                productImage = uploadedImage.secure_url
            }
            if (req.body.type == "Menu") {
                let productObj = {
                    productName: req.body.productName,
                    description: req.body.description,
                    productType: req.body.productType,
                    quantity: req.body.quantity,
                    measurement: req.body.measurement,
                    price: req.body.price,
                    cuisine: req.body.cuisine,
                    productImage: productImage,
                    tasteType: req.body.tasteType,
                    eatType: req.body.eatType
                }
                let productData = await Product.findByIdAndUpdate({ _id: req.body.productId }, { $set: productObj }, { new: true })
                console.log("Menu updated successfully", productData);
                return res.send({ response_code: 200, response_message: "Menu updated successfully" });
            }
            if (req.body.type == "Product") {
                let productObj = {

                    productName: req.body.productName,
                    description: req.body.description,
                    productType: req.body.productType,
                    quantity: req.body.quantity,
                    measurement: req.body.measurement,
                    price: req.body.price,
                    productImage: productImage
                }
                let productData = await Product.findByIdAndUpdate({ _id: req.body.productId }, { $set: productObj }, { new: true })
                console.log("Menu updated successfully", productData);
                return res.send({ response_code: 200, response_message: "Menu updated successfully" });
            }

        } catch (error) {
            console.log("Error is============>", error)
            return res.send({ response_code: 500, response_message: "Internal server error" })
        }
    },

    //============================================Update product status==============================//

    updateProductStatus: async (req, res) => {

        try {
            console.log("Request for update product status is============>", req.body);
            let checkProduct = await Product.findByIdAndUpdate({ _id: req.body.productId }, { $set: { status: req.body.status } }, { new: true })
            if (!checkProduct) {
                console.log("Invalid user Id");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            console.log("Status updated successfully", checkProduct);
            return res.send({ response_code: 200, response_message: "Status updated successfully" });
        } catch (error) {
            console.log("Error is============>", error)
            return res.send({ response_code: 500, response_message: "Internal server error" })
        }
    },

    //===========================================Offer added========================================//

    updateOfferSeller: async (req, res) => {

        try {
            console.log("Request for add update offer is=============>", req.body);
            if (req.body.status == "Active") {
                let time = new Date(req.body.offerEndDate).getTime()
                let obj = {
                    offerEndDate: req.body.offerEndDate,
                    offerEndTime: time,
                    offerPrice: req.body.offerPrice,
                    offerStatus: true
                }
                let updateData = await Product.findByIdAndUpdate({ _id: req.body.productId }, { $set: obj }, { new: true })
                if (!updateData) {
                    console.log("Invalid user Id");
                    return res.send({ status: "FAILURE", response_message: "Invalid Token" });
                }
                console.log("Offer added successfully", updateData);
                return res.send({ response_code: 200, response_message: "Offer added successfully" });
            }
            if (req.body.status == "Inactive") {
                let obj = {
                    offerStatus: false
                }
                let updateData = await Product.findByIdAndUpdate({ _id: req.body.productId }, { $set: obj }, { new: true })
                if (!updateData) {
                    console.log("Invalid user Id");
                    return res.send({ status: "FAILURE", response_message: "Invalid Token" });
                }
                console.log("Offer status updated successfully", updateData);
                return res.send({ response_code: 200, response_message: "Offer status updated successfully" });
            }
        } catch (error) {
            console.log("Error is============>", error)
            return res.send({ response_code: 500, response_message: "Internal server error" })
        }
    },

    //============================================Delete product===================================//

    deleteProduct: async (req, res) => {

        try {
            console.log("Request for delete product is==============>", req.body);
            let obj = {
                deleteStatus: true
            }
            let updateData = await Product.findByIdAndUpdate({ _id: req.body.productId }, { $set: obj }, { new: true })
            if (!updateData) {
                console.log("Invalid user Id");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            console.log("Product deleted successfully", updateData);
            return res.send({ response_code: 200, response_message: "Product deleted successfully" });
        } catch (error) {
            console.log("Error is============>", error)
            return res.send({ response_code: 500, response_message: "Internal server error" })
        }
    },

    //===========================================Menu list==========================================//

    getMenuListForSeller: async (req, res) => {

        try {
            console.log("Request for get menu list is==========>", req.body);
            let options = {
                page: req.body.pageNumber || 1,
                limit: req.body.limit || 10,
                sort: { createdAt: -1 },
            }

            let query = { resAndStoreId: req.body.sellerId, deleteStatus: false, type: 'Menu' }
            if (req.body.startDate && req.body.endDate) {
                query.createdAt = { $gte: req.body.startDate, $lte: req.body.endDate }
            }
            if (req.body.search) {
                query.$and = [{
                    $or: [
                        { "productName": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "status": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "description": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "productType": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "categoryName": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "subCategoryName": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "cuisine": { $regex: "^" + req.body.search, $options: 'i' } },

                    ]
                }]
            }
            let result = await Product.paginate(query, options)
            console.log("Menu list found successfully", result);
            return res.send({ response_code: 200, response_message: "Menu list found successfully", Data: result })
        } catch (error) {
            console.log("Error is=============>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //============================================Seller offer list================================//

    getOfferListForSeller: async (req, res) => {

        try {
            console.log("Request for get menu list is==========>", req.body);
            let options = {
                page: req.body.pageNumber || 1,
                limit: req.body.limit || 10,
                sort: { createdAt: -1 },
            }

            let query = { resAndStoreId: req.body.sellerId, deleteStatus: false, offerStatus: true }
            if (req.body.startDate && req.body.endDate) {
                query.createdAt = { $gte: req.body.startDate, $lte: req.body.endDate }
            }
            if (req.body.search) {
                query.$and = [{
                    $or: [
                        { "productName": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "status": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "description": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "productType": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "categoryName": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "subCategoryName": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "cuisine": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "offerPrice": { $regex: "^" + Number(req.body.search), $options: 'i' } },

                    ]
                }]
            }
            let result = await Product.paginate(query, options)
            console.log("Menu list found successfully", result);
            return res.send({ response_code: 200, response_message: "Menu list found successfully", Data: result })
        } catch (error) {
            console.log("Error is=============>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //============================================Commission=======================================//

    getCommissionListForSeller: async (req, res) => {

        try {
            console.log("Request for get menu list is==========>", req.body);
            let options = {
                page: req.body.pageNumber || 1,
                limit: req.body.limit || 10,
                sort: { createdAt: -1 },
                populate: { path: 'resAndStoreId', select: 'image name' }
            }

            let query = { resAndStoreId: req.body.sellerId }
            if (req.body.startDate && req.body.endDate) {
                query.createdAt = { $gte: req.body.startDate, $lte: req.body.endDate }
            }
            if (req.body.search) {
                query.$and = [{
                    $or: [
                        { "commission": { $regex: "^" + Number(req.body.search), $options: 'i' } },
                        { "status": { $regex: "^" + req.body.search, $options: 'i' } },
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

    //========================================Seller notification list=============================//

    getNotificationListForSeller: async (req, res) => {

        try {
            console.log("Request for get menu list is==========>", req.body);
            let options = {
                page: req.body.pageNumber || 1,
                limit: req.body.limit || 10,
                sort: { createdAt: -1 },
            }

            let query = { sellerId: req.body.sellerId }
            if (req.body.startDate && req.body.endDate) {
                query.createdAt = { $gte: req.body.startDate, $lte: req.body.endDate }
            }
            if (req.body.search) {
                query.$and = [{
                    $or: [
                        { "notiTitle": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "status": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "notiMessage": { $regex: "^" + req.body.search, $options: 'i' } },

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

    //===========================================Product list=======================================//

    getProductForSeller: async (req, res) => {

        try {
            console.log("Request for get product list is==========>", req.body);
            let options = {
                page: req.body.pageNumber || 1,
                limit: req.body.limit || 10,
                sort: { createdAt: -1 },
            }

            let query = { resAndStoreId: req.body.sellerId, deleteStatus: false, type: 'Product' }
            if (req.body.startDate && req.body.endDate) {
                query.createdAt = { $gte: req.body.startDate, $lte: req.body.endDate }
            }
            if (req.body.search) {
                query.$and = [{
                    $or: [
                        { "productName": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "status": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "description": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "productType": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "categoryName": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "subCategoryName": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "cuisine": { $regex: "^" + req.body.search, $options: 'i' } },

                    ]
                }]
            }
            let result = await Product.paginate(query, options)
            console.log("Menu list found successfully", result);
            return res.send({ response_code: 200, response_message: "Menu list found successfully", Data: result })
        } catch (error) {
            console.log("Error is=============>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //=========================================Update order status by seller========================//

    updateOrderStatus: async (req, res) => {

        try {
            console.log("Request for update order status is=============>", req.body);
            let checkSeller = await Seller.findOne({ _id: req.body.sellerId })
            if (!checkSeller) {
                console.log("Invalid user");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            let checkOrder = await Orderproduct.findOne({ _id: req.body.orderId })
            if (!checkOrder) {
                console.log("Invalid order");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            if (req.body.status == "Confirmed") {

                let obj = {
                    status: req.body.status
                }
                await Orderproduct.findByIdAndUpdate({ _id: req.body.orderId }, { $set: obj }, { new: true })
                console.log("Order status updated successfully");
                res.send({ response_code: 200, response_message: "Order status updated successfully" });
                let driverQuery = {
                    adminVerifyStatus: 'Approve',
                    dutyStatus: true,
                    deleteStatus: false,
                    status: 'Active'
                }
                let drivertList = await Seller.aggregate([
                    {
                        $geoNear: {
                            near: { type: "Point", coordinates: [parseFloat(checkSeller.longitude), parseFloat(checkSeller.latitude)] },
                            key: "location",
                            spherical: true,
                            maxDistance: 50000000000000000000,
                            distanceField: "dist.calculated",
                            includeLocs: "locs",
                        },
                    },
                    {
                        $match: driverQuery
                    },
                    {
                        "$project": {
                            _id: 1,
                            "dist.calculated": 1,
                            "status": 1,
                            "location": 1,
                            "name": 1,
                            "createdAt": 1,
                            "updatedAt": 1,
                            "deviceType": 1,
                            "deviceToken": 1,
                            "appLanguage": 1
                        }
                    },
                    { "$sort": { dist: 1 } }
                ])

                for (let i = 0; i < drivertList.length; i++) {

                    let notiTitle = 'New order available'
                    let notiMessage = `Hi, New order available in your area.`
                    if (drivertList[i].appLanguage == "Portuguese") {
                        notiTitle = 'New order available'
                        notiMessage = `Hi, New order available in your area.`
                    }

                    let notiobj = new Notification({
                        driverId: drivertList[i]._id,
                        notiTitle: notiTitle,
                        notiMessage: notiMessage,
                        notificationType: `orderRequestForDriver`,
                        sellerId: req.body.sellerId,
                        productOrderId: req.body.orderId
                    })
                    await notiobj.save()
                    if (drivertList[i].deviceType == 'android' && drivertList[i].normalUserNotification == true) {
                        func.sendNotificationForAndroidWorkDone(drivertList[i].deviceToken, notiTitle, notiMessage, notificationType, `${req.body.sellerId}`, `${req.body.orderId}`, (error10, result10) => {
                            console.log("Notification Sent");
                        })
                    }
                    if (drivertList[i].deviceType == 'iOS' && drivertList[i].normalUserNotification == true) {
                        let query2 = { $and: [{ "driverId": drivertList[i]._id }, { "isSeen": "false" }] }
                        Notification.find(query2, (error12, result12) => {
                            if (error12) {
                                console.log("Error 12 is=========>", error12);
                            }
                            else {
                                let obj = {
                                    sellerId: req.body.sellerId,
                                    orderId: req.body.orderId,
                                    type: 'orderRequestForDriver'
                                }
                                let badgeCount = result12.length;
                                console.log("Badge count is=========>", badgeCount);
                                func.sendiosNotificationWorkDone(drivertList[i].deviceToken, notiTitle, notiMessage, badgeCount, "orderRequestForDriver", obj, (error10, result10) => {
                                    console.log("Notification Sent");
                                })
                            }
                        })
                    }


                }
            }
            else if (req.body.status == "Reject") {
                let obj = {
                    status: req.body.status
                }
                await Orderproduct.findByIdAndUpdate({ _id: req.body.orderId }, { $set: obj }, { new: true })
                console.log("Order status updated successfully");
                res.send({ response_code: 200, response_message: "Order status updated successfully" });
                let notiUser = await User.findOne({ _id: checkOrder.userId })
                let notiTitle = 'Order rejected'
                let notiMessage = `Hi, Your order has been rejected by seller.`
                if (notiUser.appLanguage == "Portuguese") {
                    notiTitle = 'Order rejected'
                    notiMessage = `Hi, Your order has been rejected by seller.`
                }

                let notiobj = new Notification({
                    driverId: checkOrder.userId,
                    notiTitle: notiTitle,
                    notiMessage: notiMessage,
                    notificationType: `rSRejectOrder`
                })
                await notiobj.save()
                if (notiUser.deviceType == 'android' && notiUser.normalUserNotification == true) {
                    func.sendNotificationForAndroidWorkDone(notiUser.deviceToken, notiTitle, notiMessage, notificationType, `${req.body.sellerId}`, `${req.body.orderId}`, (error10, result10) => {
                        console.log("Notification Sent");
                    })
                }
                if (notiUser.deviceType == 'iOS' && notiUser.normalUserNotification == true) {
                    let query2 = { $and: [{ "driverId": notiUser._id }, { "isSeen": "false" }] }
                    Notification.find(query2, (error12, result12) => {
                        if (error12) {
                            console.log("Error 12 is=========>", error12);
                        }
                        else {
                            let obj = {
                                sellerId: req.body.sellerId,
                                orderId: req.body.orderId,
                                type: 'rSRejectOrder'
                            }
                            let badgeCount = result12.length;
                            console.log("Badge count is=========>", badgeCount);
                            func.sendiosNotificationWorkDone(notiUser.deviceToken, notiTitle, notiMessage, badgeCount, "rSRejectOrder", obj, (error10, result10) => {
                                console.log("Notification Sent");
                            })
                        }
                    })
                }
            }
            else if (req.body.status == "In process") {
                let obj = {
                    status: req.body.status
                }
                await Orderproduct.findByIdAndUpdate({ _id: req.body.orderId }, { $set: obj }, { new: true })
                console.log("Order status updated successfully");
                res.send({ response_code: 200, response_message: "Order status updated successfully" });
                let notiUser = await User.findOne({ _id: checkOrder.userId })
                let notiTitle = 'Order status updated'
                let notiMessage = `Hi, Your order is in process.`
                if (notiUser.appLanguage == "Portuguese") {
                    notiTitle = 'Order status updated'
                    notiMessage = `Hi, Your order is in process.`
                }

                let notiobj = new Notification({
                    driverId: checkOrder.userId,
                    notiTitle: notiTitle,
                    notiMessage: notiMessage,
                    notificationType: `rSProcessOrder`
                })
                await notiobj.save()
                if (notiUser.deviceType == 'android' && notiUser.normalUserNotification == true) {
                    func.sendNotificationForAndroidWorkDone(notiUser.deviceToken, notiTitle, notiMessage, notificationType, `${req.body.sellerId}`, `${req.body.orderId}`, (error10, result10) => {
                        console.log("Notification Sent");
                    })
                }
                if (notiUser.deviceType == 'iOS' && notiUser.normalUserNotification == true) {
                    let query2 = { $and: [{ "driverId": notiUser._id }, { "isSeen": "false" }] }
                    Notification.find(query2, (error12, result12) => {
                        if (error12) {
                            console.log("Error 12 is=========>", error12);
                        }
                        else {
                            let obj = {
                                sellerId: req.body.sellerId,
                                orderId: req.body.orderId,
                                type: 'rSProcessOrder'
                            }
                            let badgeCount = result12.length;
                            console.log("Badge count is=========>", badgeCount);
                            func.sendiosNotificationWorkDone(notiUser.deviceToken, notiTitle, notiMessage, badgeCount, "rSProcessOrder", obj, (error10, result10) => {
                                console.log("Notification Sent");
                            })
                        }
                    })
                }
            }
        } catch (error) {
            response.log("Error is=========>", error);
            return response.responseHandlerWithMessage(res, 500, "Internal server error");
        }
    },

    //=========================================Payemnet list seller=================================//

    getPaymentListForSeller: async (req, res) => {

        try {
            console.log("Request for get payment list is==========>", req.body);
            let options = {
                page: req.body.pageNumber || 1,
                limit: req.body.limit || 10,
                sort: { createdAt: -1 },
                populate: [{ path: 'productId', select: 'productName' }, { path: 'orderId', path: 'orderNumber' }]
            }

            let query = { sellerId: req.body.sellerId }
            if (req.body.startDate && req.body.endDate) {
                query.createdAt = { $gte: req.body.startDate, $lte: req.body.endDate }
            }
            if (req.body.search) {
                query.$and = [{
                    $or: [
                        { "sellerAmount": { $regex: "^" + Number(req.body.search), $options: 'i' } },
                        { "status": { $regex: "^" + req.body.search, $options: 'i' } }

                    ]
                }]
            }
            let result = await Payment.paginate(query, options)
            console.log("Payment list found successfully", result);
            return res.send({ response_code: 200, response_message: "Payment list found successfully", Data: result })
        } catch (error) {
            console.log("Error is=============>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //==========================================Seller order list===================================//

    getOrderForSeller: async (req, res) => {

        try {
            console.log("Request for get order list is==========>", req.body);
            let options = {
                page: req.body.pageNumber || 1,
                limit: req.body.limit || 10,
                sort: { createdAt: -1 },
                populate: { path: 'userId', select: 'name profilePic email countryCode mobileNumber' }
            }
            let query = {}
            if (req.body.type == "Past") {
                query = { $and: [{ resAndStoreId: req.body.sellerId }, { status: 'Delivered' }] }
            }
            if (req.body.type == "Reject") {
                query = { $and: [{ resAndStoreId: req.body.sellerId }, { status: 'Reject' }] }
            }
            if (req.body.type == "Current") {
                query = {
                    $and: [
                        {
                            $or: [
                                { "status": "Pending" },
                                { "status": "Accept" },
                                { "status": "Confirmed" },
                                { "status": "In process" },
                                { "status": "Out for delivery" },
                            ]
                        },
                        { resAndStoreId: req.body.sellerId }
                    ]
                }
            }
            if (req.body.startDate && req.body.endDate) {
                query.createdAt = { $gte: req.body.startDate, $lte: req.body.endDate }
            }
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

    //==========================================Add slot============================================//

    addDeliverySlot: async (req, res) => {

        try {
            console.log("Request for add delivery slot is===========>", req.body);
            let deliverySlot = new Deliveryslot({
                resAndStoreId: req.body.resAndStoreId,
                openTime: req.body.openTime,
                closeTime: req.body.closeTime,
                day: req.body.day,
                timeSlot: req.body.timeSlot
            })
            await deliverySlot.save()
            console.log("Slot added successfully");
            return res.send({ response_code: 200, response_message: "Slot added successfully" })
        } catch (error) {
            console.log("Error is=============>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //===========================================Update slot=======================================//

    updateSlot: async (req, res) => {

        try {
            console.log("Request for update slot is===========>", req.body);
            let checkSlot = await Deliveryslot.findOne({ _id: req.body.slotId })
            if (!checkSlot) {
                console.log("Invalid user Id");
                return res.send({ response_code: 501, response_message: "Invalid Token" });
            }
            let deliverySlot = {
                openTime: req.body.openTime,
                closeTime: req.body.closeTime,
                day: req.body.day,
                timeSlot: req.body.timeSlot
            }
            await Deliveryslot.findByIdAndUpdate({ _id: req.body.slotId }, { $set: deliverySlot }, { new: true })
            console.log("Slot updated successfully");
            return res.send({ response_code: 200, response_message: "Slot updated successfully" })
        } catch (error) {
            console.log("Error is=============>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //===========================================Get delivery slot=================================//

    getDeliverySlot: async (req, res) => {

        try {
            console.log("Request for get slot list is==========>", req.body);
            let options = {
                page: req.body.pageNumber || 1,
                limit: req.body.limit || 10,
                sort: { createdAt: -1 },
            }

            let query = { resAndStoreId: req.body.sellerId }
            if (req.body.startDate && req.body.endDate) {
                query.createdAt = { $gte: req.body.startDate, $lte: req.body.endDate }
            }
            if (req.body.search) {
                query.$and = [{
                    $or: [
                        { "openTime": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "status": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "closeTime": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "day": { $regex: "^" + req.body.search, $options: 'i' } },
                        { "timeSlot": { $regex: "^" + req.body.search, $options: 'i' } },

                    ]
                }]
            }
            let result = await Deliveryslot.paginate(query, options)
            console.log("Slot list found successfully", result);
            return res.send({ response_code: 200, response_message: "Slot list found successfully", Data: result })
        } catch (error) {
            console.log("Error is=============>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //===========================================Update slot status================================//

    updateSlotStatus: async (req, res) => {

        try {
            console.log("Request for update slot status is============>", req.body);
            let updateSlot = await Deliveryslot.findByIdAndUpdate({ _id: req.body.slotId }, { $set: { status: req.body.status } }, { new: true })
            if (!updateSlot) {
                console.log("Invalid slot Id");
                return res.send({ response_code: 500, response_message: "Invalid Token" });
            }
            console.log("Status updated successfully", updateSlot);
            return res.send({ response_code: 200, response_message: "Status updated successfully" });
        } catch (error) {
            console.log("Error is============>", error)
            return res.send({ response_code: 500, response_message: "Internal server error" })
        }
    },

    //===========================================Delete slot=======================================//

    deleteSlot: async (req, res) => {

        try {
            console.log("Request for delete slot is==============>", req.body);
            let updateData = await Deliveryslot.findByIdAndRemove({ _id: req.body.slotId })
            if (!updateData) {
                console.log("Invalid slot Id");
                return res.send({ response_code: 500, response_message: "Invalid Token" });
            }
            console.log("Slot deleted successfully", updateData);
            return res.send({ response_code: 200, response_message: "Slot deleted successfully" });
        } catch (error) {
            console.log("Error is============>", error)
            return res.send({ response_code: 500, response_message: "Internal server error" })
        }
    },

    //============================================Order detail====================================//

    orderDetail: async (req, res) => {

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
                proudctDetail: proudctDetail

            }
            console.log("Order detail found successfully", obj);
            return res.send({ response_code: 200, response_message: "Order detail found successfully", Data: obj });
        } catch (error) {
            console.log("Error is============>", error)
            return res.send({ response_code: 500, response_message: "Internal server error" })
        }
    },




    //=======================================Driver Apis==============================================//


    //=========================================Driver duty status======================================//

    driverupdateDutyStatus: async (req, res) => {

        try {
            console.log("Request for change duty status is===========>", req.body, req.headers.token)
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            if (!req.body.driverId || !req.headers.token) {
                console.log("User is missing");
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });;
            }
            let query = { $and: [{ "_id": req.body.driverId }, { "jwtToken": req.headers.token }] }
            let checkUser = await Driver.findOne(query)
            if (!checkUser) {
                console.log("Invalid user Id");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            if (checkUser.status == 'Inactive') {
                console.log("Account disabled");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") })
            }
            await Driver.findByIdAndUpdate({ _id: req.body.driverId }, { $set: { dutyStatus: req.body.status } }, { new: true })
            console.log("Duty status has been updated successfully");
            return res.send({ status: "SUCCESS", response_message: i18n.__("Duty status has been updated successfully") });
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //=========================================Driver notification count===============================//

    getDriverNotificationCount: async (req, res) => {

        try {
            console.log("Request for notification count is==========>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            if (!req.body.driverId) {
                console.log("Field is missing")
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") })
            }
            let query = { $and: [{ driverId: req.body.driverId }, { isSeen: false }] }
            let result = await Notification.find(query).count()
            console.log("Notification count is==========>", result)
            return res.send({ status: "SUCCESS", response_message: i18n.__("Notification Count Found"), Data: result });
        } catch (error) {
            console.log("Error 1 is============>", error)
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") })
        }
    },

    //=========================================Driver signin===========================================//

    driverSignin: async (req, res) => {

        try {
            console.log("Request for signin is===========>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            if (!req.body.mobileNumber || !req.body.countryCode) {
                console.log("Mobile number is missing");
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });
            }
            let query = { $and: [{ "countryCode": req.body.countryCode }, { "mobileNumber": req.body.mobileNumber }] }
            let result = await Driver.findOne(query)
            if (!result) {
                console.log("Mobile number is not registered");
                return res.send({ status: "FAILURE", response_message: i18n.__("Mobile number is not registered") });
            }
            if (result.status == 'Inactive') {
                console.log("Account disabled");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") });
            }
            if (result.adminVerifyStatus == 'Pending') {
                console.log("Your document verification is pending. Please wait for admin approval.");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your document verification is pending. Please wait for admin approval.") });
            }
            let jwtToken = jwt.sign({ "countryCode": req.body.countryCode }, config.jwtSecretKey);
            console.log("Token is===========>", jwtToken);
            const encryptedToken = cryptr.encrypt(jwtToken);
            if (req.body.deviceType && req.body.deviceToken) {
                let result1 = await Driver.findByIdAndUpdate({ "_id": result._id }, { $set: { "jwtToken": encryptedToken, "onlineStatus": "Online", "deviceType": req.body.deviceType, "deviceToken": req.body.deviceToken } }, { new: true })
                console.log("Signin successfully", result1)
                return res.send({ status: "SUCCESS", response_message: i18n.__("Signin successfully"), response: result1 })
            }
            let result1 = await Driver.findByIdAndUpdate({ "_id": result._id }, { $set: { "jwtToken": encryptedToken, "onlineStatus": "Online" } }, { new: true })
            console.log("Signin successfully", result1)
            return res.send({ status: "SUCCESS", response_message: i18n.__("Signin successfully"), response: result1 })
        } catch (error) {
            console.log("Error is=========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //==========================================Change driver mobile===================================//

    driverMobileNumberChange: async (req, res) => {

        try {
            console.log("Request for mobile number is===========>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            if (!req.body.mobileNumber || !req.body.driverId || !req.body.countryCode) {
                console.log("All fields are required")
                return res.send({ status: "FAILURE", response_message: i18n.__("Country code & mobile number is required") })
            }
            let query = { $and: [{ "_id": req.body.driverId }, { "jwtToken": req.headers.token }] }
            let checkUser = await Driver.findOne(query)
            if (!checkUser) {
                console.log("User Id is not correct")
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            else if (checkUser.status == 'Inactive') {
                console.log("Your account has been disabled by admin");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") + warning });
            }
            let checkMobileNumber = await Driver.findOne({ "mobileNumber": req.body.mobileNumber })
            if (checkMobileNumber) {
                console.log("Mobile number already exist")
                return res.send({ status: "FAILURE", response_message: i18n.__("Mobile number already exist") });
            }
            let updateNumber = await Driver.findByIdAndUpdate({ _id: req.body.driverId }, { $set: { mobileNumber: req.body.mobileNumber } }, { new: true })
            console.log("Mobile number updated successfully", updateNumber)
            return res.send({ status: "SUCCESS", response_message: i18n.__("Mobile number updated successfully") })
        } catch (error) {
            console.log("Error is=========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //==========================================Driver logout=========================================//

    driverLogout: async (req, res) => {

        try {

            console.log("Request for logout is===========>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            if (!req.body.driverId) {
                console.log("UserId is required")
                return res.send({ status: "FAILURE", response_message: i18n.__("Something wemt wrong") })
            }
            let result = await Driver.findByIdAndUpdate({ "_id": req.body.driverId }, { $set: { "onlineStatus": "Offline", "jwtToken": "", deviceToken: '', deviceType: '' } }, { new: true })
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

    //=============================================Change Language=======================================//

    driverChangeLanguage: async (req, res) => {

        try {
            console.log("Request for change language is===========>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            if (!req.body.driverId || !req.body.appLanguage) {
                console.log("User Id is required")
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });
            }
            let query = { $and: [{ "_id": req.body.driverId }, { "jwtToken": req.headers.token }] }
            let checkUser = await Driver.findOne(query)
            if (!checkUser) {
                console.log("Invalid Token");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            else if (checkUser.status == 'Inactive') {
                console.log("Your account has been disabled by admin");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") + warning });
            }
            let result = await Driver.findByIdAndUpdate({ "_id": req.body.driverId }, { $set: { "appLanguage": req.body.appLanguage } }, { new: true })
            console.log("App language changed successfully", result);
            return res.send({ status: "SUCCESS", response_message: i18n.__("App language changed successfully"), Data: result.appLanguage });
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //=============================================Get driver detail=====================================//

    getDriverDetails: async (req, res) => {

        try {
            console.log("Request for get user details is=============>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            if (!req.body.driverId) {
                console.log("User Id is required");
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });
            }
            let query = { $and: [{ "_id": req.body.driverId }, { "jwtToken": req.headers.token }] }
            let result = await Driver.findOne(query)
            if (!result) {
                console.log("User Id is incorrect");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            else if (result.status == 'Inactive') {
                console.log("Account disabled");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") + warning })
            }
            console.log("User details found successfully", result);
            return res.send({ status: "SUCCESS", response_message: i18n.__("User details found successfully"), Data: result });
        } catch (error) {
            console.log("Error is ===============>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //=============================================Driver contact us====================================//

    driverContactUs: async (req, res) => {

        try {
            console.log("Request for contact us is============>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            let query = { $and: [{ "_id": req.body.driverId }, { "jwtToken": req.headers.token }] }
            let checkUser = await Driver.findOne(query)
            if (!checkUser) {
                console.log("User Id is incorrect");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            else if (checkUser.status == 'Inactive') {
                console.log("Account disabled");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") + warning })
            }
            let contactObj = new ContactModel({
                "reason": req.body.reason,
                "description": req.body.description,
                "driverId": req.body.driverId,
                type: 'Driver'
            })
            let result = await contactObj.save()
            console.log("Thank you for contacting us", result);
            res.send({ status: "SUCCESS", response_message: i18n.__("Thank you for contacting us"), Data: result });
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

    //=============================================Check mobile abvailability driver====================//

    driverMobilecheckAvailability: async (req, res) => {

        try {
            console.log("Request for mobile number is===========>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            if (!req.body.mobileNumber || !req.body.countryCode || !req.body.email) {
                console.log("All fields are required")
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") })
            }
            // let query = { $and: [{ "countryCode": req.body.countryCode }, { "mobileNumber": req.body.mobileNumber }] }
            let result = await Driver.findOne({ "mobileNumber": req.body.mobileNumber })
            if (result) {
                console.log("Mobile number already exist")
                return res.send({ status: "FAILURE", response_message: i18n.__("Mobile number already exist") })
            }
            let checkEmail = await Driver.findOne({ email: req.body.email })
            if (checkEmail) {
                console.log("Email already exist")
                return res.send({ status: "FAILURE", response_message: i18n.__("Email already exist") })
            }
            console.log("Both are available")
            return res.send({ status: "SUCCESS", response_message: i18n.__("Both are availabler") })
        } catch (error) {
            console.log("Error  is============>", error)
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") })
        }
    },

    //=============================================Driver notification list=============================//

    getDriverNotificationList: async (req, res) => {

        try {
            console.log("Request for get notification list is============>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            let result = await Notification.find({ driverId: req.body.driverId }).populate({ path: 'sellerId', select: 'avgRating name longitude latitude address storeType' })
            console.log("Notification list found successfully", result);
            res.send({ status: "SUCCESS", response_message: i18n.__("Notification list found successfully"), Data: result })
            await Notification.update({ driverId: req.body.driverId }, { $set: { isSeen: true } }, { new: true })
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") + cross1 });
        }
    },

    //=============================================Driver location update===============================//

    updateDriverLocation: async (req, res) => {

        try {
            console.log("Request for update location is============>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            let obj = {
                latitude: req.body.latitude,
                longitude: req.body.longitude,
                location: { "type": "Point", "coordinates": [Number(req.body.longitude), Number(req.body.latitude)] }
            }

            let result1 = await Driver.findByIdAndUpdate({ "_id": req.body.driverId }, { $set: obj }, { new: true })
            if (!result1) {
                console.log("Invalid Token");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            console.log("Location Updated", result1);
            return res.send({ status: "SUCCESS", response_message: i18n.__("Location Updated ") })
        } catch (error) {
            console.log("error is============>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //=============================================Check driver number for signup=======================//

    driverCheckNumberForSignin: async (req, res) => {

        try {
            console.log("Request for mobile number is===========>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            if (!req.body.mobileNumber || !req.body.countryCode) {
                console.log("All fields are required")
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") })
            }
            let query = { $and: [{ "countryCode": req.body.countryCode }, { "mobileNumber": req.body.mobileNumber }] }
            let result = await Driver.findOne(query)
            if (!result) {
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

    //=============================================Driver signup========================================//

    driverSignup: async (req, res) => {

        try {
            console.log("Request for driver signup is===========>", req.body);
            console.log("Request for driver signup is===========>", req.files);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            if (!req.body.mobileNumber || !req.body.countryCode || !req.body.name || !req.body.email || !req.body.appLanguage) {
                console.log("Field is missing");
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });
            }
            let checkEmail = await Driver.findOne({ email: req.body.email })
            if (checkEmail) {
                console.log("Email already exist");
                return res.send({ status: "FAILURE", response_message: i18n.__('Email already exist') });
            }
            let query = { $and: [{ countryCode: req.body.countryCode }, { mobileNumber: req.body.mobileNumber }] }
            let checkMobileNumber = await Driver.findOne(query)
            if (checkMobileNumber) {
                console.log("Mobile Number already exist");
                return res.send({ status: "FAILURE", response_message: i18n.__('Mobile number already exist') });
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
            let signupObj = new Driver({
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
                vehicleImages: venueImage,
                vehicleType: req.body.vehicleType,
                brand: req.body.brand,
                vehicleNumber: req.body.vehicleNumber,
                licenseNumber: req.body.licenseNumber,
                insuranceNumber: req.body.insuranceNumber,
                latitude: '24.8055946517755',
                longitude: '46.6030529016949',
                "location": { "type": "Point", "coordinates": [46.6030529016949, 24.8055946517755] }
            })
            let signupData = await signupObj.save()
            console.log("You have successfully signed up", signupData);
            return res.send({ status: "SUCCESS", response_message: i18n.__("Driver signup request submitted successfully. Please wait for admin approval."), Data: signupData });
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //=============================================Driver update profile=================================//

    driverEditProfile: async (req, res) => {

        try {
            console.log("Request for driver edit profile is===========>", req.body);
            console.log("Request for driver edit profile is===========>", req.files);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            let query = { $and: [{ "_id": req.body.driverId }, { "jwtToken": req.headers.token }] }
            let checkUser = await Driver.findOne(query)
            if (!checkUser) {
                console.log("User Id is incorrect");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            let checkEmail = await Driver.findOne({ email: req.body.email, _id: { $ne: req.body.driverId } })
            if (checkEmail) {
                console.log("Email already exist");
                return res.send({ status: "FAILURE", response_message: i18n.__('Email already exist') });
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
                    await Driver.findByIdAndUpdate({ _id: req.body.driverId }, { $push: { vehicleImages: imageA } }, { new: true })
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
            return res.send({ status: "SUCCESS", response_message: i18n.__("Profile updated successfully"), Data: signupData });
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //==============================================Driver rating=======================================//

    getDriverRating: async (req, res) => {

        try {
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            console.log("Request for get all rate=============>", req.body);
            let result = await Driverrating.find({ "driverId": req.body.driverId }).populate({ path: 'userId', select: 'name profilePic' })
            console.log("Rating list found", result);
            return res.send({ status: "SUCCESS", response_message: i18n.__("Rating List found successfully"), Data: result });
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //============================================Delete vehicle image==================================//

    deleteVehicleImage: async (req, res) => {

        try {
            console.log("Request for delete vehicle image is=========>", req.body)
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            let result = await Driver.findOneAndUpdate({ "_id": req.body.driverId, "vehicleImages._id": req.body.imageId }, { $pull: { vehicleImages: { _id: req.body.imageId } } }, { safe: true, new: true })
            if (!result) {
                console.log("Invalid image Id")
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            console.log("Image deleted successfully", result);
            return res.send({ status: "SUCCESS", response_message: i18n.__("Image deleted successfully") });
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //============================================Reject order by driver==============================//

    rejectOrderByDriver: async (req, res) => {

        try {
            console.log("Request for reject order by driver is===========>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            let checkNotification = await Notification.findByIdAndRemove({ _id: req.body.notificationId })
            if (!checkNotification) {
                console.log("Invalid notification Id")
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            console.log("Request rejected successfully", checkNotification);
            return res.send({ status: "SUCCESS", response_message: i18n.__("Request rejected successfully") });
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }

    },

    //============================================Accept order by seller==============================//

    acceptOrderByDriver: async (req, res) => {

        try {
            console.log("Request for accept order by driver is============>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            let query = { $and: [{ "_id": req.body.driverId }, { "jwtToken": req.headers.token }] }
            let checkUser = await Driver.findOne(query)
            if (!checkUser) {
                console.log("User Id is incorrect");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            let checkNotification = await Notification.findOne({ _id: req.body.notificationId })
            if (!checkNotification) {
                console.log("Invalid notification Id")
                return res.send({ status: "FAILURE", response_message: "This request is not available." });
            }
            let checkOrder = await Orderproduct.findOne({ _id: checkNotification.productOrderId })
            let userData = await User.findOne({ _id: checkOrder.userId })
            if (checkOrder.status == "Accept" && checkOrder.driverAssign == true) {
                console.log("Invalid notification Id")
                return res.send({ status: "FAILURE", response_message: "This request is not available." });
            }
            let obj = {
                status: 'Accept',
                driverAssign: true,
                driverId: req.body.driverId
            }
            await Orderproduct.findByIdAndUpdate({ _id: req.body.orderId }, { $set: obj }, { new: true })
            console.log("Request accepted successfully");
            res.send({ status: "SUCCESS", response_message: i18n.__("Request accepted successfully") });
            let notiTitle = `${checkUser.name} is on the way.`
            let notiMessage = `${checkUser.name} is on the way.`
            if (userData.appLanguage == "Portuguese") {
                notiTitle = '${checkUser.name} is on the way.'
                notiMessage = `${checkUser.name} is on the way.`
            }
            let notiobj = new Notification({
                notiTo: checkOrder.userId,
                notiTitle: notiTitle,
                notiMessage: notiMessage,
                notificationType: `rSAcceptOrder`
            })
            await notiobj.save()
            let notiobjSeller = new Notification({
                sellerId: checkOrder.resAndStoreId,
                notiTitle: `${checkUser.name} is ready to pickup`,
                notiMessage: `${checkUser.name} is ready to pickup`,
                notificationType: `rSPickupOrder`
            })
            await notiobjSeller.save()
            if (userData.normalUserNotification == true) {
                func.sendNotificationForAndroidWorkDone(userData.deviceToken, notiTitle, notiMessage, notificationType, (error10, result10) => {
                    console.log("Notification Sent");
                })
            }

        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }

    },

    //============================================Order status update by driver=======================//

    orderStatusUpdatedByDriver: async (req, res) => {

        try {
            console.log("Request for update order status is===========>", req.body);
            let query = { $and: [{ "_id": req.body.driverId }, { "jwtToken": req.headers.token }] }
            let checkUser = await User.findOne(query)
            if (!checkUser) {
                console.log("You are not a delivery person");
                return res.send({ status: "FAILURE", response_message: i18n.__("Invalid Token") });
            }
            if (checkUser.status == 'Inactive') {
                console.log("Account disabled");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") })
            }
            let notiTitle = ''
            let notiMessage = ''
            let checkOrder = await Orderproduct.findOne({ _id: req.body.orderId })
            if (!checkOrder) {
                console.log("Invalid order Id")
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            let userData = await User.findOne({ _id: checkOrder.userId })
            if (req.body.status == "Out for delivery") {
                notiTitle = `Hi! Order out for delivery`
                notiMessage = `Hi! Your order is out for delivery`
            }
            if (req.body.status == "Delivered") {
                notiTitle = `Order delivered`
                notiMessage = `Hi! Your order is delivered`

                let checkCommission = await Commission.findOne({ resAndStoreId: checkOrder.resAndStoreId })
                let commission = (Number(checkOrder.totalAmount) * Number(checkCommission.commission)) / 100
                let amount = Number(checkOrder.totalPrice) - Number(commission)
                let paymentObj = new Payment({
                    resAndStoreId: checkOrder.resAndStoreId,
                    userId: checkOrder.userId,
                    driverId: req.body.driverId,
                    orderId: req.body.orderId,
                    sellerAmount: amount,
                    totalAmount: checkOrder.totalAmount,
                    adminAmount: commission,
                    driverAmount: 0
                })
                paymentObj.save()
            }
            let obj = {
                status: req.body.status
            }
            let notiobj = new Notification({
                notiTo: checkOrder.userId,
                notiTitle: notiTitle,
                notiMessage: notiMessage,
                notificationType: `rSStatusOrder`
            })
            await notiobj.save()
            await Orderproduct.findByIdAndUpdate({ _id: req.body.orderId }, { $set: obj }, { new: true })
            console.log("Status updated successfully");
            res.send({ status: "SUCCESS", response_message: i18n.__("Status updated successfully") });
            if (userData.normalUserNotification == true) {
                func.sendNotificationForAndroidWorkDone(userData.deviceToken, notiTitle, notiMessage, notificationType, (error10, result10) => {
                    console.log("Notification Sent");
                })
            }
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }

    },

    //===========================================Get Driver order list===============================//

    getDriverOrder: async (req, res) => {

        try {
            console.log("Request for cart item is===========>", req.body)
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            let query = { $and: [{ "_id": req.body.driverId }, { "jwtToken": req.headers.token }] }
            let checkUser = await User.findOne(query)
            if (!checkUser) {
                console.log("You are not a delivery person");
                return res.send({ status: "FAILURE", response_message: i18n.__("Invalid Token") });
            }
            if (checkUser.status == 'Inactive') {
                console.log("Account disabled");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") })
            }
            let currentQuery = {}
            if (req.body.type == "Current") {
                currentQuery = {
                    $and: [
                        {
                            $or: [
                                { "status": "Accept" },
                                { "status": "In process" },
                                { "status": "Out for delivery" },
                            ]
                        },
                        {
                            driverId: ObjectId(req.body.driverId)
                        },
                        {
                            driverAssign: true
                        }
                    ]
                }
            }
            if (req.body.type == "History") {
                currentQuery = {
                    $and: [{ status: 'Delivered' }, { driverId: req.body.driverId }, { driverAssign: true }]
                }
            }

            let orderList = await Orderproduct.aggregate([
                {
                    $match: currentQuery
                },
                {
                    $lookup:
                    {
                        from: "sellers",
                        localField: "resAndStoreId",
                        foreignField: "_id",
                        as: "sellerData"
                    }
                },
                {
                    $unwind: {
                        path: "$sellerData",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup:
                    {
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
                {
                    $lookup:
                    {
                        from: "products",
                        localField: "productId",
                        foreignField: "_id",
                        as: "productData"
                    }
                },
                {
                    $unwind: {
                        path: "$productData",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    "$project": {
                        _id: 1,
                        resAndStoreId: 1,
                        userId: 1,
                        productId: 1,
                        status: 1,
                        quantity: 1,
                        orderData: 1,
                        orderNumber: 1,
                        price: 1,
                        offerPrice: 1,
                        offerApplicable: 1,
                        deliveryCharge: 1,
                        totalPrice: 1,
                        address: 1,
                        latitude: 1,
                        longitude: 1,
                        landmark: 1,
                        buildingAndApart: 1,
                        deliveryDate: 1,
                        deliverySlot: 1,
                        deliveryTimeSlot: 1,
                        excepetdDeliveryTime: 1,
                        "sellerData.location": 1,
                        "sellerData.name": 1,
                        "sellerData.image": 1,
                        "sellerData.email": 1,
                        "sellerData.countryCode": 1,
                        "sellerData.mobileNumber": 1,
                        "sellerData.totalRating": 1,
                        "sellerData.avgRating": 1,
                        "sellerData.totalRatingByUser": 1,
                        "sellerData.deliveryTime": 1,
                        "sellerData.minimumValue": 1,
                        "sellerData.cuisinesName": 1,
                        "sellerData.categoryName": 1,
                        "sellerData.subCategoryName": 1,
                        "sellerData.openingTime": 1,
                        "sellerData.closingTime": 1,
                        "sellerData.latitude": 1,
                        "sellerData.longitude": 1,
                        "sellerData.description": 1,
                        "sellerData.address": 1,
                        "productData.productImage": 1,
                        "productData.productName": 1,
                        "productData.description": 1,
                        "productData.type": 1,
                        "productData.productType": 1,
                        "productData.offerEndDate": 1,
                        "productData.currency": 1,
                        "productData.offerPrice": 1,
                        "productData.offerStatus": 1,
                        "productData.quantity": 1,
                        "productData.measurement": 1,
                        "productData.price": 1,
                        "productData.categoryName": 1,
                        "productData.subCategoryName": 1,
                        "productData.cuisine": 1,
                        "userData.name": 1,
                        "userData.profilePic": 1,
                        "userData.countryCode": 1,
                        "userData.mobileNumber": 1,
                        "userData.mobileNumber": 1,
                        "createdAt": 1,
                        "updatedAt": 1,
                    }
                },
                { "$sort": { createdAt: -1 } }
            ])
            console.log("Order list found successfully", orderList);
            return res.send({ status: 'SUCCESS', response_message: i18n.__("Order list found successfully"), Data: orderList });

        } catch (error) {
            response.log("Error is=========>", error);
            return response.responseHandlerWithMessage(res, 500, "Internal server error");
        }
    },







    //============================================Res and store list for user============================//

    getRestaurantAndStoreData: async (req, res) => {

        try {
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            console.log("Request for get new order for delivery person is========================>", req.body);
            if (!req.body.userId || !req.body.latitude || !req.body.longitude || !req.headers.token) {
                console.log("Field is missing");
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });;
            }
            let query = { $and: [{ "_id": req.body.userId }, { "jwtToken": req.headers.token }] }
            let checkUser = await User.findOne(query)
            if (!checkUser) {
                console.log("You are not a delivery person");
                return res.send({ status: "FAILURE", response_message: i18n.__("Invalid Token") });
            }
            if (checkUser.status == 'INACTIVE') {
                console.log("Account disabled");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") })
            }
            let restaurantQuery = {
                adminVerifyStatus: 'Approve',
                storeType: 'Restaurant',
                deleteStatus: false
            }
            let storeQuery = {
                adminVerifyStatus: 'Approve',
                storeType: 'Grocery Store',
                deleteStatus: false
            }
            let restaurantList = await Seller.aggregate([
                {
                    $geoNear: {
                        near: { type: "Point", coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)] },
                        key: "location",
                        spherical: true,
                        maxDistance: 50000000000000000000,
                        distanceField: "dist.calculated",
                        includeLocs: "locs",
                    },

                },
                {
                    $match: restaurantQuery
                },
                {
                    $lookup: {
                        from: "favourites",
                        let: {
                            resAndStoreId: "$_id", userId: ObjectId(req.body.userId)
                        },
                        pipeline: [{
                            $match: {
                                $expr:
                                {
                                    $and: [
                                        { $eq: ["$resAndStoreId", "$$resAndStoreId"] },
                                        { $eq: ["$userId", "$$userId"] },
                                    ],

                                },

                            }

                        }, { $limit: 1 }],
                        as: "favData"
                    }
                },
                {
                    $unwind: {
                        path: "$favData",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    "$project": {
                        _id: 1,
                        "isFav": {
                            $cond: {
                                if: {
                                    $and: [
                                        {
                                            $eq: ['$favData.userId', ObjectId(req.body.userId)]
                                        }
                                    ]
                                },
                                then: true,
                                else: false,
                            }
                        },
                        "dist.calculated": 1,
                        "status": 1,
                        "location": 1,
                        "name": 1,
                        "image": 1,
                        "address": 1,
                        "email": 1,
                        "countryCode": 1,
                        "mobileNumber": 1,
                        "storeType": 1,
                        "document": 1,
                        "totalRating": 1,
                        "avgRating": 1,
                        "totalRatingByUser": 1,
                        "deliveryTime": 1,
                        "minimumValue": 1,
                        "latitude": 1,
                        "longitude": 1,
                        "openingTime": 1,
                        "closingTime": 1,
                        "cuisinesName": 1,
                        "categoryName": 1,
                        "subCategoryName": 1,
                        "createdAt": 1,
                        "updatedAt": 1,
                        "description": 1
                    }
                },
                { "$sort": { dist: 1 } }
            ])
            let storeList = await Seller.aggregate([
                {
                    $geoNear: {
                        near: { type: "Point", coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)] },
                        key: "location",
                        spherical: true,
                        maxDistance: 50000000000000000000,
                        distanceField: "dist.calculated",
                        includeLocs: "locs",
                    },

                },
                {
                    $match: storeQuery
                },
                {
                    $lookup: {
                        from: "favourites",
                        let: {
                            resAndStoreId: "$_id", userId: ObjectId(req.body.userId)
                        },
                        pipeline: [{
                            $match: {
                                $expr:
                                {
                                    $and: [
                                        { $eq: ["$resAndStoreId", "$$resAndStoreId"] },
                                        { $eq: ["$userId", "$$userId"] },
                                    ],

                                },

                            }

                        }, { $limit: 1 }],
                        as: "favData"
                    }
                },
                {
                    $unwind: {
                        path: "$favData",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    "$project": {
                        _id: 1,
                        "isFav": {
                            $cond: {
                                if: {
                                    $and: [
                                        {
                                            $eq: ['$favData.userId', ObjectId(req.body.userId)]
                                        }
                                    ]
                                },
                                then: true,
                                else: false,
                            }
                        },
                        "dist.calculated": 1,
                        "status": 1,
                        "location": 1,
                        "name": 1,
                        "image": 1,
                        "address": 1,
                        "email": 1,
                        "countryCode": 1,
                        "mobileNumber": 1,
                        "storeType": 1,
                        "document": 1,
                        "totalRating": 1,
                        "avgRating": 1,
                        "totalRatingByUser": 1,
                        "deliveryTime": 1,
                        "minimumValue": 1,
                        "latitude": 1,
                        "longitude": 1,
                        "openingTime": 1,
                        "closingTime": 1,
                        "cuisinesName": 1,
                        "categoryName": 1,
                        "subCategoryName": 1,
                        "createdAt": 1,
                        "updatedAt": 1,
                        "description": 1
                    }
                },
                { "$sort": { dist: 1 } }
            ])
            let obj = {
                restaurantList: restaurantList,
                storeList: storeList
            }
            console.log("List found successfully", obj);
            return res.send({ status: 'SUCCESS', response_message: i18n.__("List found successfully"), Data: obj });
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },


    //========================================Dashboard Data==========================================//

    getDashboardData: async (req, res) => {

        try {
            console.log("Request for get dashboard data is==========>", req.body);
            let i18n = new i18n_module(req.body.langCode, configs.langFile);
            let homeBanner = await Homebanner.findOne({ status: 'Active' })
            let mainService = await Mainservice.find({ status: 'Active' })
            let obj = {
                homeBanner: homeBanner,
                mainService: mainService
            }
            console.log("Data found successfully", obj);
            return res.send({ status: "SUCCESS", response_message: i18n.__("Data found successfully"), Data: obj });
        } catch (error) {
            console.log("Error is==========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__('Internal server error') });
        }
    },

    //============================================Add to favourite======================================//

    addToFavourite: async (req, res) => {

        try {
            let i18n = new i18n_module(req.body.langCode, configs.langFile);
            console.log("Request for add to favourite is============>", req.body);
            let query = { $and: [{ "_id": req.body.userId }, { "jwtToken": req.headers.token }] }
            let checkUser = await User.findOne(query)
            if (!checkUser) {
                console.log("You are not a delivery person");
                return res.send({ status: "FAILURE", response_message: i18n.__("Invalid Token") });
            }
            if (checkUser.status == 'INACTIVE') {
                console.log("Account disabled");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") })
            }
            let checkResAndStore = await Seller.findOne({ _id: req.body.resAndStoreId })
            if (!checkResAndStore) {
                console.log("Invalid Id")
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            let checkFav = await Favourite.findOne({ resAndStoreId: req.body.resAndStoreId, userId: req.body.userId })
            if (!checkFav) {
                let favouireObj = new Favourite({
                    resAndStoreId: req.body.resAndStoreId,
                    userId: req.body.userId
                })
                await favouireObj.save()
                console.log("Added to favourite successfully");
                return res.send({ status: 'SUCCESS', response_message: i18n.__("Added to favourite successfully") });
            }
            if (checkFav) {
                await Favourite.findByIdAndRemove({ _id: checkFav._id })
                console.log("Remove from favourite successfully");
                return res.send({ status: 'SUCCESS', response_message: i18n.__("Remove from favourite successfully") });
            }
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //=============================================Add to cart===========================================//

    addToCart: async (req, res) => {

        try {
            console.log("Request for add to cart is============>", req.body);
            let i18n = new i18n_module(req.body.langCode, configs.langFile);
            let query = { $and: [{ "_id": req.body.userId }, { "jwtToken": req.headers.token }] }
            let checkUser = await User.findOne(query)
            if (!checkUser) {
                console.log("You are not a delivery person");
                return res.send({ status: "FAILURE", response_message: i18n.__("Invalid Token") });
            }
            if (checkUser.status == 'INACTIVE') {
                console.log("Account disabled");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") })
            }
            let checkProduct = await Product.findOne({ _id: req.body.productId })
            if (!checkProduct) {
                console.log("Invalid Id")
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            let checkCart = await Cart.findOne({ userId: req.body.userId })
            if (!checkCart) {
                let cartObj = new Cart({
                    resAndStoreId: checkProduct.resAndStoreId,
                    userId: req.body.userId,
                    productId: req.body.productId
                })
                await cartObj.save()
                console.log("Item added to cart successfully");
                return res.send({ status: 'SUCCESS', response_message: i18n.__("Item added to cart successfully") });
            }
            if (checkCart) {
                if (!checkCart.type == checkProduct.type) {
                    console.log("Please clear your cart to add this item.")
                    return res.send({ status: "FAILURE", response_message: "Please clear your cart to add this item." });
                }
                if (!(checkProduct.resAndStoreId).toString() == (checkCart.resAndStoreId).toString()) {
                    console.log("Please clear your cart to add this item.")
                    return res.send({ status: "FAILURE", response_message: "Please clear your cart to add this item." });
                }
                if ((checkProduct.resAndStoreId).toString() == (checkCart.resAndStoreId).toString() && checkCart.type == checkProduct.type) {
                    let cartObj = new Cart({
                        resAndStoreId: checkProduct.resAndStoreId,
                        userId: req.body.userId,
                        productId: req.body.productId
                    })
                    await cartObj.save()
                    console.log("Item added to cart successfully");
                    return res.send({ status: 'SUCCESS', response_message: i18n.__("Item added to cart successfully") });
                }
                else {
                    console.log("Please clear your cart to add this item.")
                    return res.send({ status: "FAILURE", response_message: "Please clear your cart to add this item." });
                }
            }
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //==============================================Clear cart===========================================//

    clearCart: async (req, res) => {

        try {
            console.log("Request for clear cart is============>", req.body);
            let i18n = new i18n_module(req.body.langCode, configs.langFile);
            let query = { $and: [{ "_id": req.body.userId }, { "jwtToken": req.headers.token }] }
            let checkUser = await User.findOne(query)
            if (!checkUser) {
                console.log("You are not a delivery person");
                return res.send({ status: "FAILURE", response_message: i18n.__("Invalid Token") });
            }
            if (checkUser.status == 'INACTIVE') {
                console.log("Account disabled");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") })
            }
            let cartClear = await Cart.remove({ userId: req.body.userId })
            console.log("Item removed successfully", cartClear);
            return res.send({ status: 'SUCCESS', response_message: i18n.__("Item removed successfully") });
        } catch (error) {
            console.log("Error is=========>", error);
            return response.responseHandlerWithMessage(res, 500, "Internal server error");
        }
    },

    //==============================================Update cart=========================================//

    updateCart: async (req, res) => {

        try {
            console.log("Request for update cart is===========>",req.body);
            let i18n = new i18n_module(req.body.langCode, configs.langFile);
            let query = { $and: [{ "_id": req.body.userId }, { "jwtToken": req.headers.token }] }
            let checkUser = await User.findOne(query)
            if (!checkUser) {
                console.log("You are not a delivery person");
                return res.send({ status: "FAILURE", response_message: i18n.__("Invalid Token") });
            }
            if (checkUser.status == 'INACTIVE') {
                console.log("Account disabled");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") })
            }
            let searchQuery = { $and: [{ productId: req.body.productId }, { userId: req.body.userId }] }
            let checkProduct = await Cart.findOne(searchQuery)
            if (Number(req.body.quantity) == 0) {
                let updateCart = await Cart.findByIdAndRemove({ _id: checkProduct._id })
                console.log("Item removed from your cart successfully", updateCart);
                return res.send({ status: 'SUCCESS', response_message: i18n.__("Item removed from your cart successfully") });
            }
            let updateCart = await Cart.findByIdAndUpdate({ _id: checkProduct._id }, { $set: { quantity: Number(req.body.quantity) } }, { new: true })
            console.log("Cart updated successfully", updateCart);
            return res.send({ status: 'SUCCESS', response_message: i18n.__("Cart updated successfully") });
        } catch (error) {
            console.log("Error is=========>", error);
            return response.responseHandlerWithMessage(res, 500, "Internal server error");
        }
    },

    //==============================================Get cart item=======================================//

    getCartItem: async (req, res) => {

        try {
            console.log("Request for cart item is===========>", req.body)
            let i18n = new i18n_module(req.body.langCode, configs.langFile);
            let query = { $and: [{ "_id": req.body.userId }, { "jwtToken": req.headers.token }] }
            let checkUser = await User.findOne(query)
            if (!checkUser) {
                console.log("You are not a delivery person");
                return res.send({ status: "FAILURE", response_message: i18n.__("Invalid Token") });
            }
            if (checkUser.status == 'INACTIVE') {
                console.log("Account disabled");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") })
            }
            let cartList = await Cart.aggregate([
                {
                    $match: { userId: ObjectId(req.body.userId) }
                },
                {
                    $lookup:
                    {
                        from: "sellers",
                        localField: "resAndStoreId",
                        foreignField: "_id",
                        as: "sellerData"
                    }
                },
                {
                    $unwind: {
                        path: "$sellerData",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup:
                    {
                        from: "products",
                        localField: "productId",
                        foreignField: "_id",
                        as: "productData"
                    }
                },
                {
                    $unwind: {
                        path: "$productData",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    "$project": {
                        _id: 1,
                        resAndStoreId: 1,
                        userId: 1,
                        productId: 1,
                        status: 1,
                        type: 1,
                        quantity: 1,
                        "sellerData.location": 1,
                        "sellerData.name": 1,
                        "sellerData.image": 1,
                        "sellerData.email": 1,
                        "sellerData.countryCode": 1,
                        "sellerData.mobileNumber": 1,
                        "sellerData.totalRating": 1,
                        "sellerData.avgRating": 1,
                        "sellerData.totalRatingByUser": 1,
                        "sellerData.deliveryTime": 1,
                        "sellerData.minimumValue": 1,
                        "sellerData.cuisinesName": 1,
                        "sellerData.categoryName": 1,
                        "sellerData.subCategoryName": 1,
                        "sellerData.openingTime": 1,
                        "sellerData.closingTime": 1,
                        "sellerData.latitude": 1,
                        "sellerData.longitude": 1,
                        "sellerData.description": 1,
                        "sellerData.address": 1,
                        "productData.productImage": 1,
                        "productData.productName": 1,
                        "productData.description": 1,
                        "productData.type": 1,
                        "productData.productType": 1,
                        "productData.offerEndDate": 1,
                        "productData.currency": 1,
                        "productData.offerPrice": 1,
                        "productData.offerStatus": 1,
                        "productData.quantity": 1,
                        "productData.measurement": 1,
                        "productData.price": 1,
                        "productData.categoryName": 1,
                        "productData.subCategoryName": 1,
                        "productData.cuisine": 1,
                        "createdAt": 1,
                        "updatedAt": 1,
                    }
                },
                { "$sort": { createdAt: -1 } }
            ])
            console.log("Cart list found successfully", cartList);
            return res.send({ status: 'SUCCESS', response_message: i18n.__("Cart list found successfully"), Data: cartList });
        } catch (error) {
            response.log("Error is=========>", error);
            return response.responseHandlerWithMessage(res, 500, "Internal server error");
        }
    },

    //=============================================Get cuisine list=====================================//

    getCuisineList: async (req, res) => {

        try {
            let list = await Cuisine.find({ deleteStatus: false })
            console.log("Cuisine list found successfully", list);
            let actualArray = []
            for (let i = 0; i < list.length; i++) {
                actualArray.push(list[i].name)
            }
            return res.send({ response_code: 200, response_message: "Cuisine list found successfully", Data: actualArray })
        } catch (error) {
            console.log("Error is=============>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //==============================================Get category list==================================//

    getCategoryList: async (req, res) => {

        try {
            let list = await Productcategory.find({ deleteStatus: false })
            console.log("Category list found successfully", list);
            return res.send({ response_code: 200, response_message: "Category list found successfully", Data: list })
        } catch (error) {
            console.log("Error is=============>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //==============================================Get sub category list==============================//

    getSubCategoryList: async (req, res) => {

        try {
            let list = await Productsubcategory.find({ categoryId: req.body.categoryId, deleteStatus: false })
            console.log("Ub-Category list found successfully", list);
            return res.send({ response_code: 200, response_message: "Sub-Category list found successfully", Data: list })
        } catch (error) {
            console.log("Error is=============>", error);
            return res.send({ response_code: 500, response_message: "Internal server error" });
        }
    },

    //===============================================Get menu list====================================//

    getMenuData: async (req, res) => {

        try {
            let i18n = new i18n_module(req.body.langCode, configs.langFile);
            console.log("Request for get menu is========================>", req.body);
            if (!req.body.userId || !req.headers.token || !req.body.cuisine) {
                console.log("Field is missing");
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });;
            }
            let query = { $and: [{ "_id": req.body.userId }, { "jwtToken": req.headers.token }] }
            let checkUser = await User.findOne(query)
            if (!checkUser) {
                console.log("You are not a delivery person");
                return res.send({ status: "FAILURE", response_message: i18n.__("Invalid Token") });
            }
            if (checkUser.status == 'INACTIVE') {
                console.log("Account disabled");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") })
            }
            let querySearch = {
                resAndStoreId: ObjectId(req.body.resAndStoreId),
                deleteStatus: false,
                cuisine: req.body.cuisine,
                type:'Menu'

            }
            let menuList = await Product.aggregate([
                {
                    $match: querySearch
                },
                {
                    $lookup:
                    {
                        from: "carts",
                        localField: "_id",
                        foreignField: "productId",
                        as: "cartData"
                    }
                },
                {
                    $unwind: {
                        path: "$cartData",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    "$project": {
                        _id: 1,
                        "status": 1,
                        "currency": 1,
                        "offerStatus": 1,
                        "quantity": 1,
                        "avgRating": 1,
                        "totalRating": 1,
                        "totalOrder": 1,
                        "resAndStoreId": 1,
                        "type": 1,
                        "productName": 1,
                        "productType": 1,
                        "measurement": 1,
                        "price": 1,
                        "cuisine": 1,
                        "productImage": 1,
                        "createdAt": 1,
                        "updatedAt": 1,
                        "description": 1,
                        "offerEndDate": 1,
                        "offerEndTime": 1,
                        "offerPrice": 1,
                        "cartData":1
                    }
                },
                { "$sort": { createdAt: -1 } }
            ])
            let obj = {
                menuList: menuList,
            }
            console.log("List found successfully", obj);
            return res.send({ status: 'SUCCESS', response_message: i18n.__("List found successfully"), Data: obj });
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //==============================================Get product list==================================//

    getProductData: async (req, res) => {

        try {
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            console.log("Yesterday date is============>", new Date(new Date().setHours(0, 0, 0, 0) - 1));
            console.log("Request for get new order for delivery person is========================>", req.body);
            if (!req.body.userId || !req.body.lat || !req.body.long || !req.headers.token || !req.body.subCategoryName) {
                console.log("Field is missing");
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });;
            }
            let query = { $and: [{ "_id": req.body.userId }, { "jwtToken": req.headers.token }] }
            let checkUser = await User.findOne(query)
            if (!checkUser) {
                console.log("You are not a delivery person");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            if (checkUser.status == 'INACTIVE') {
                console.log("Account disabled");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") })
            }
            let querySearch = {
                resAndStoreId: ObjectId(req.body.resAndStoreId),
                deleteStatus: false,
                subCategoryName: req.body.subCategoryName

            }
            let productList = await Product.aggregate([
                {
                    $match: querySearch
                },
                {
                    $lookup:
                    {
                        from: "carts",
                        localField: "_id",
                        foreignField: "productId",
                        as: "cartData"
                    }
                },
                {
                    $unwind: {
                        path: "$cartData",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    "$project": {
                        _id: 1,
                        "status": 1,
                        "currency": 1,
                        "offerStatus": 1,
                        "quantity": 1,
                        "avgRating": 1,
                        "totalRating": 1,
                        "totalOrder": 1,
                        "resAndStoreId": 1,
                        "type": 1,
                        "productName": 1,
                        "subCategoryName": 1,
                        "measurement": 1,
                        "price": 1,
                        "categoryName": 1,
                        "productImage": 1,
                        "createdAt": 1,
                        "updatedAt": 1,
                        "description": 1,
                        "offerEndDate": 1,
                        "offerEndTime": 1,
                        "offerPrice": 1,
                        cartData:18
                    }
                },
                { "$sort": { dist: 1 } }
            ])
            let obj = {
                productList: productList,
            }
            console.log("List found successfully", obj);
            return res.send({ status: 'SUCCESS', response_message: i18n.__("List found successfully"), Data: obj });
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //=============================================Place order========================================//

    placeOrder: async (req, res) => {

        try {
            console.log("Request for place order is==============>", req.body);
            let cartList = await Cart.find({ userId: req.body.userId })
            if (cartList.length == 0) {
                console.log("Invalid user Id");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            let checkAdmin = await Admin.findOne({ userType: 'Admin' })
            let od = Number(checkAdmin.orderNumber) + 1
            await Admin.findByIdAndUpdate({ _id: checkAdmin._id }, { $set: { orderNumber: od } }, { new: true })
            var orderNumber = `OD${od}`
            console.log("Order Id is===============>", orderId);
            let orderData = []
            let sellerId = cartList.resAndStoreId
            for (let i = 0; i < cartList.length; i++) {
                let checkProduct = await Product.findOne({ _id: cartList[i].productId })
                sellerId = checkProduct.sellerId
                let productPrice = 0
                let actualPrice = 0
                if (checkProduct.offerStatus == true) {
                    actualPrice = offerPrice
                    productPrice = Number(cartList[i].quantity) * Number(measurementData.offerPrice)
                }
                if (checkProduct.offerStatus == false) {
                    actualPrice = price
                    productPrice = Number(cartList[i].quantity) * Number(measurementData.price)
                }
                let obj = {
                    productId: cartList[i].productId,
                    quantity: cartList[i].quantity,
                    actualAmount: actualPrice,
                    amountWithQuantuty: productPrice
                }
                orderData.push(obj)
            }
            let orderObj = new Orderproduct({
                userId: req.body.userId,
                resAndStoreId: sellerId,
                deliveryDate: req.body.deliveryDate,
                deliveryCharge: req.body.deliveryCharge,
                totalPrice: req.body.totalPrice,
                price: req.body.price,
                orderType: req.body.orderType,
                offerApplicable: req.body.offerApplicable,
                offerAmount: req.body.offerAmount,
                sellerId: sellerId,
                address: req.body.address,
                latitude: req.body.latitude,
                longitude: req.body.longitude,
                landmark: req.body.landmark,
                buildingAndApart: req.body.buildingAndApart,
                orderNumber: orderNumber,
                excepetdDeliveryTime: req.body.excepetdDeliveryTime,
                orderData: orderData,
                deliverySlot: req.body.deliverySlot,
                deliveryTimeSlot: req.body.deliveryTimeSlot
            })
            let myBookingaData = await orderObj.save()
            console.log("Order placed successfully", myBookingaData);
            return res.send({ status: 'SUCCESS', response_message: i18n.__("Order placed successfully") });
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //==============================================Product detail=====================================//

    productDetail: async (req, res) => {

        try {
            console.log("Product detail is===========>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            if (!req.body.userId || !req.body.productId || !req.headers.token) {
                console.log("Field is missing");
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });;
            }
            let query = { $and: [{ "_id": req.body.userId }, { "jwtToken": req.headers.token }] }
            let checkUser = await User.findOne(query)
            if (!checkUser) {
                console.log("You are not a delivery person");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            if (checkUser.status == 'INACTIVE') {
                console.log("Account disabled");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") })
            }
            let checkProduct = await Product.findOne({ _id: req.body.productId })
            if (!checkProduct) {
                console.log("Invalid Id")
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            let isFav = false
            let checkFav = await Favourite.findOne({ resAndStoreId: req.body.productId, userId: req.body.userId })
            if (checkFav) {
                isFav = true
            }
            if (!checkFav) {
                isFav = false
            }
            let ratingList = await Storerating.aggregate([
                {
                    $match: { resAndStoreId: ObjectId(req.body.productId) }
                },
                {
                    $lookup:
                    {
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
                {
                    "$project": {
                        _id: 1,
                        resAndStoreId: 1,
                        userId: 1,
                        productId: 1,
                        status: 1,
                        orderId: 1,
                        rating: 1,
                        review: 1,
                        "userData.name": 1,
                        "userData.profilePic": 1,
                        "createdAt": 1,
                        "updatedAt": 1,
                    }
                },
                { "$sort": { createdAt: -1 } }
            ])

            let obj = {
                productDetail: checkProduct,
                isFav: isFav,
                ratingList: ratingList
            }
            console.log("Product cetail found successfully", obj);
            return res.send({ status: 'SUCCESS', response_message: i18n.__("Product cetail found successfully"), Data: obj });

        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //==============================================Res and store rating==============================//    

    resAndStoreRating: async (req, res) => {

        try {
            console.log("Request for give res and store rating is===========>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            if (!req.body.userId || !req.body.resAndStoreId || !req.headers.token) {
                console.log("Field is missing");
                return res.send({ status: "FAILURE", response_message: i18n.__("Something went wrong") });;
            }
            let query = { $and: [{ "_id": req.body.userId }, { "jwtToken": req.headers.token }] }
            let checkUser = await User.findOne(query)
            if (!checkUser) {
                console.log("Invalid user");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            if (checkUser.status == 'INACTIVE') {
                console.log("Account disabled");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") })
            }
            let ratingObj = new Storerating({
                resAndStoreId: req.body.resAndStoreId,
                userId: req.body.userId,
                rating: req.body.rating,
                review: req.body.review
            })
            await ratingObj.save()
            let totalRating = await Storerating.aggregate([
                {
                    $match: {
                        resAndStoreId: ObjectId(req.body.resAndStoreId)
                    }
                },
                {
                    "$group": {
                        _id: "$resAndStoreId",
                        documentSum: { "$sum": "$rating" },
                        documentAvg: { "$avg": "$rating" }
                    }
                }
            ])
            let updateRating = await Seller.findByIdAndUpdate({ _id: req.query.resAndStoreId }, { $set: { totalRating: totalRating[0].documentSum, avgRating: totalRating[0].documentAvg, totalRatingByUser: totalRating.length } }, { new: true })
            console.log("Thanks for rating", updateRating);
            return res.send({ status: 'SUCCESS', response_message: i18n.__("Thanks for rating") });
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //==============================================Get Favourite list================================//

    getFavouriteList: async (req, res) => {

        try {
            console.log("Request for cart item is===========>", req.body)
            let i18n = new i18n_module(req.body.langCode, configs.langFile);
            let query = { $and: [{ "_id": req.body.userId }, { "jwtToken": req.headers.token }] }
            let checkUser = await User.findOne(query)
            if (!checkUser) {
                console.log("You are not a delivery person");
                return res.send({ status: "FAILURE", response_message: i18n.__("Invalid Token") });
            }
            if (checkUser.status == 'INACTIVE') {
                console.log("Account disabled");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") })
            }
            let favList = await Favourite.aggregate([
                {
                    $match: { userId: ObjectId(req.body.userId) }
                },
                {
                    $lookup:
                    {
                        from: "sellers",
                        localField: "resAndStoreId",
                        foreignField: "_id",
                        as: "sellerData"
                    }
                },
                {
                    $unwind: {
                        path: "$sellerData",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    "$project": {
                        _id: 1,
                        resAndStoreId: 1,
                        userId: 1,
                        status: 1,
                        "sellerData.location": 1,
                        "sellerData.name": 1,
                        "sellerData.image": 1,
                        "sellerData.email": 1,
                        "sellerData.countryCode": 1,
                        "sellerData.mobileNumber": 1,
                        "sellerData.totalRating": 1,
                        "sellerData.avgRating": 1,
                        "sellerData.totalRatingByUser": 1,
                        "sellerData.deliveryTime": 1,
                        "sellerData.minimumValue": 1,
                        "sellerData.cuisinesName": 1,
                        "sellerData.categoryName": 1,
                        "sellerData.subCategoryName": 1,
                        "sellerData.openingTime": 1,
                        "sellerData.closingTime": 1,
                        "sellerData.latitude": 1,
                        "sellerData.longitude": 1,
                        "sellerData.description": 1,
                        "sellerData.address": 1,
                        "createdAt": 1,
                        "updatedAt": 1,
                    }
                },
                { "$sort": { createdAt: -1 } }
            ])
            for (let i = 0; i < favList.length; i++) {
                let dist = geodist({ lon: parseFloat(favList[i].sellerData.longitude), lat: parseFloat(favList[i].sellerData.latitude) }, { lon: parseFloat(req.body.longitude), lat: parseFloat(req.body.latitude) }, { exact: true, unit: 'km' })
                let actualDistance = ((dist).toFixed(1)).toString();
                console.log("Actaul distance is===========>", actualDistance);
                favList[i].distance = actualDistance
            }
            console.log("List found successfully", favList);
            return res.send({ status: 'SUCCESS', response_message: i18n.__("List found successfully"), Data: favList });
        } catch (error) {
            response.log("Error is=========>", error);
            return response.responseHandlerWithMessage(res, 500, "Internal server error");
        }
    },

    //==============================================Get user order list===============================//

    getUserOrder: async (req, res) => {

        try {
            console.log("Request for cart item is===========>", req.body)
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            let query = { $and: [{ "_id": req.body.userId }, { "jwtToken": req.headers.token }] }
            let checkUser = await User.findOne(query)
            if (!checkUser) {
                console.log("You are not a delivery person");
                return res.send({ status: "FAILURE", response_message: i18n.__("Invalid Token") });
            }
            if (checkUser.status == 'INACTIVE') {
                console.log("Account disabled");
                return res.send({ status: "FAILURE", response_message: i18n.__("Your account have been disabled by administrator due to any suspicious activity") })
            }
            let currentQuery = {}
            if (req.body.type == "Ongoing") {
                currentQuery = {
                    $and: [
                        {
                            $or: [
                                { "status": "Accept" },
                                { "status": "In process" },
                                { "status": "Out for delivery" },
                            ]
                        },
                        {
                            userId: ObjectId(req.body.userId)
                        },
                        {
                            driverAssign: true
                        }
                    ]
                }
            }
            if (req.body.type == "Past") {
                currentQuery = {
                    $and: [{ status: 'Delivered' }, { userId: req.body.userId }, { driverAssign: true }]
                }
            }
            if (req.body.type == "Upcoming") {
                currentQuery = {
                    $and: [
                        {
                            $or: [
                                { "status": "Pending" },
                                { "status": "Confirmed" },
                            ]
                        },
                        {
                            userId: ObjectId(req.body.userId)
                        },
                        {
                            driverAssign: false
                        }
                    ]
                }

                let orderList = await Orderproduct.aggregate([
                    {
                        $match: currentQuery
                    },
                    {
                        $lookup:
                        {
                            from: "sellers",
                            localField: "resAndStoreId",
                            foreignField: "_id",
                            as: "sellerData"
                        }
                    },
                    {
                        $unwind: {
                            path: "$sellerData",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $lookup:
                        {
                            from: "products",
                            localField: "productId",
                            foreignField: "_id",
                            as: "productData"
                        }
                    },
                    {
                        $unwind: {
                            path: "$productData",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        "$project": {
                            _id: 1,
                            resAndStoreId: 1,
                            userId: 1,
                            productId: 1,
                            status: 1,
                            quantity: 1,
                            orderData: 1,
                            orderNumber: 1,
                            price: 1,
                            offerPrice: 1,
                            offerApplicable: 1,
                            deliveryCharge: 1,
                            totalPrice: 1,
                            address: 1,
                            latitude: 1,
                            longitude: 1,
                            landmark: 1,
                            buildingAndApart: 1,
                            deliveryDate: 1,
                            deliverySlot: 1,
                            deliveryTimeSlot: 1,
                            excepetdDeliveryTime: 1,
                            "sellerData.location": 1,
                            "sellerData.name": 1,
                            "sellerData.image": 1,
                            "sellerData.email": 1,
                            "sellerData.countryCode": 1,
                            "sellerData.mobileNumber": 1,
                            "sellerData.totalRating": 1,
                            "sellerData.avgRating": 1,
                            "sellerData.totalRatingByUser": 1,
                            "sellerData.deliveryTime": 1,
                            "sellerData.minimumValue": 1,
                            "sellerData.cuisinesName": 1,
                            "sellerData.categoryName": 1,
                            "sellerData.subCategoryName": 1,
                            "sellerData.openingTime": 1,
                            "sellerData.closingTime": 1,
                            "sellerData.latitude": 1,
                            "sellerData.longitude": 1,
                            "sellerData.description": 1,
                            "sellerData.address": 1,
                            "productData.productImage": 1,
                            "productData.productName": 1,
                            "productData.description": 1,
                            "productData.type": 1,
                            "productData.productType": 1,
                            "productData.offerEndDate": 1,
                            "productData.currency": 1,
                            "productData.offerPrice": 1,
                            "productData.offerStatus": 1,
                            "productData.quantity": 1,
                            "productData.measurement": 1,
                            "productData.price": 1,
                            "productData.categoryName": 1,
                            "productData.subCategoryName": 1,
                            "productData.cuisine": 1,
                            "createdAt": 1,
                            "updatedAt": 1,
                        }
                    },
                    { "$sort": { createdAt: -1 } }
                ])
                console.log("Order list found successfully", orderList);
                return res.send({ status: 'SUCCESS', response_message: i18n.__("Order list found successfully"), Data: orderList });
            }

            let orderList = await Orderproduct.aggregate([
                {
                    $match: currentQuery
                },
                {
                    $lookup:
                    {
                        from: "sellers",
                        localField: "resAndStoreId",
                        foreignField: "_id",
                        as: "sellerData"
                    }
                },
                {
                    $unwind: {
                        path: "$sellerData",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup:
                    {
                        from: "drivers",
                        localField: "driverId",
                        foreignField: "_id",
                        as: "driverData"
                    }
                },
                {
                    $unwind: {
                        path: "$driverData",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup:
                    {
                        from: "products",
                        localField: "productId",
                        foreignField: "_id",
                        as: "productData"
                    }
                },
                {
                    $unwind: {
                        path: "$productData",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    "$project": {
                        _id: 1,
                        resAndStoreId: 1,
                        userId: 1,
                        productId: 1,
                        status: 1,
                        quantity: 1,
                        orderData: 1,
                        orderNumber: 1,
                        price: 1,
                        offerPrice: 1,
                        offerApplicable: 1,
                        deliveryCharge: 1,
                        totalPrice: 1,
                        address: 1,
                        latitude: 1,
                        longitude: 1,
                        landmark: 1,
                        buildingAndApart: 1,
                        deliveryDate: 1,
                        deliverySlot: 1,
                        deliveryTimeSlot: 1,
                        excepetdDeliveryTime: 1,
                        "sellerData.location": 1,
                        "sellerData.name": 1,
                        "sellerData.image": 1,
                        "sellerData.email": 1,
                        "sellerData.countryCode": 1,
                        "sellerData.mobileNumber": 1,
                        "sellerData.totalRating": 1,
                        "sellerData.avgRating": 1,
                        "sellerData.totalRatingByUser": 1,
                        "sellerData.deliveryTime": 1,
                        "sellerData.minimumValue": 1,
                        "sellerData.cuisinesName": 1,
                        "sellerData.categoryName": 1,
                        "sellerData.subCategoryName": 1,
                        "sellerData.openingTime": 1,
                        "sellerData.closingTime": 1,
                        "sellerData.latitude": 1,
                        "sellerData.longitude": 1,
                        "sellerData.description": 1,
                        "sellerData.address": 1,
                        "productData.productImage": 1,
                        "productData.productName": 1,
                        "productData.description": 1,
                        "productData.type": 1,
                        "productData.productType": 1,
                        "productData.offerEndDate": 1,
                        "productData.currency": 1,
                        "productData.offerPrice": 1,
                        "productData.offerStatus": 1,
                        "productData.quantity": 1,
                        "productData.measurement": 1,
                        "productData.price": 1,
                        "productData.categoryName": 1,
                        "productData.subCategoryName": 1,
                        "productData.cuisine": 1,
                        "driverData.name": 1,
                        "driverData.profilePic": 1,
                        "driverData.countryCode": 1,
                        "driverData.mobileNumber": 1,
                        "driverData.mobileNumber": 1,
                        "createdAt": 1,
                        "updatedAt": 1,
                    }
                },
                { "$sort": { createdAt: -1 } }
            ])
            console.log("Order list found successfully", orderList);
            return res.send({ status: 'SUCCESS', response_message: i18n.__("Order list found successfully"), Data: orderList });

        } catch (error) {
            response.log("Error is=========>", error);
            return response.responseHandlerWithMessage(res, 500, "Internal server error");
        }
    },

    //================================================Order cancel by user===========================//

    cancelOrderByUser: async (req, res) => {

        try {
            console.log("Request for cancel order by is============>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            let query = { $and: [{ "_id": req.body.userId }, { "jwtToken": req.headers.token }] }
            let checkUser = await User.findOne(query)
            if (!checkUser) {
                console.log("User Id is incorrect");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            let checkOrder = await Orderproduct.findOne({ _id: req.body.orderId })
            if (!checkOrder) {
                console.log("Order Id is incorrect");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            let obj = {
                status: 'Cancel',
            }
            let notiobjSeller = new Notification({
                sellerId: checkOrder.resAndStoreId,
                notiTitle: `Order cancelled`,
                notiMessage: `Hi! Order has been cancelled by user`,
                notificationType: `rSCancelOrder`
            })
            await notiobjSeller.save()
            await Orderproduct.findByIdAndUpdate({ _id: req.body.orderId }, { $set: obj }, { new: true })
            console.log("Order cancelled successfully");
            return res.send({ status: "SUCCESS", response_message: i18n.__("Order cancelled successfully") });
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }

    },

    //===============================================Slot list=======================================//

    getDeliverySlotList: async (req, res) => {

        try {
            console.log("Request for get delivery slot is=================>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            let query = { $and: [{ "_id": req.body.userId }, { "jwtToken": req.headers.token }] }
            let checkUser = await User.findOne(query)
            if (!checkUser) {
                console.log("User Id is incorrect");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            let slotQuery = { $and: [{ resAndStoreId: req.body.resAndStoreId }, { day: req.body.day }] }
            let slotList = await Deliveryslot.find(slotQuery)
            console.log("Slot list found successfully", slotList);
            return res.send({ status: "SUCCESS", response_message: i18n.__("Slot list found successfully"), Data: slotList });
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    },

    //================================================Charge Data====================================//

    getDeliveryCharge: async (req, res) => {

        try {
            console.log("Request for get delivery charge is==========>", req.body);
            var i18n = new i18n_module(req.body.langCode, configs.langFile);
            let query = { $and: [{ "_id": req.body.userId }, { "jwtToken": req.headers.token }] }
            let checkUser = await User.findOne(query)
            if (!checkUser) {
                console.log("User Id is incorrect");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            let chargeData = await Commission.findOne({ resAndStoreId: req.body.resAndStoreId })
            if (!chargeData) {
                console.log("Seller Id is incorrect");
                return res.send({ status: "FAILURE", response_message: "Invalid Token" });
            }
            console.log("Data found successfully", chargeData);
            return res.send({ status: "SUCCESS", response_message: i18n.__("Data found successfully"), Data: chargeData });
        } catch (error) {
            console.log("Error is===========>", error);
            return res.send({ status: "FAILURE", response_message: i18n.__("Internal server error") });
        }
    }





}
