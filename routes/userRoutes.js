const userRoutes=require('express').Router();
const userController=require('../controllers/userController.js');
const storeController=require('../controllers/storeController.js');
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();
const authHandler = require('../authHandler/auth.js')

//=================User Section===============================//

userRoutes.post('/signup',multipartMiddleware,userController.signup);
userRoutes.post('/providerSignup',multipartMiddleware,userController.providerSignup);
userRoutes.post('/signin',userController.signin);
userRoutes.post('/mobileNumberChange',userController.mobileNumberChange);
userRoutes.post('/logout',userController.logout);
userRoutes.post('/changeLanguage',userController.changeLanguage);
userRoutes.post('/updateSetting',userController.updateSetting);
userRoutes.post('/getSetting',userController.getSetting);
userRoutes.post('/getUserDetails',userController.getUserDetails);
userRoutes.post('/contactUs',userController.contactUs);
userRoutes.post('/updateProfile',multipartMiddleware,userController.updateProfile);
userRoutes.post('/checkAvailability',userController.checkAvailability);
userRoutes.post('/checkUserType',userController.checkUserType);
userRoutes.post('/checkNumberForSignin',userController.checkNumberForSignin);
userRoutes.post('/getSubCategoryListByCategory',userController.getSubCategoryListByCategory);


//================Static Content Section======================//

userRoutes.get('/getStaticContent',userController.getStaticContent);
userRoutes.post('/getStaticContentByType',userController.getStaticContentByType);
userRoutes.get('/getContactUsDetail',userController.getContactUsDetail);


//================Address Section==============================//

userRoutes.post('/addAddress',userController.addAddress);
userRoutes.post('/deleteAddress',userController.deleteAddress);
userRoutes.post('/getAddress',userController.getAddress);
userRoutes.post('/updateAddress',userController.updateAddress);

//===============Delivery And Professional Request==============//

userRoutes.post('/deliveryPerson',multipartMiddleware,userController.deliveryPerson);
userRoutes.post('/professionalPerson',multipartMiddleware,userController.professionalPerson);
userRoutes.post('/getDeliveryDetails',userController.getDeliveryDetails);
userRoutes.post('/getProfessionalDetails',userController.getProfessionalDetails);
userRoutes.post('/updateDeliveryPerson',multipartMiddleware,userController.updateDeliveryPerson);
userRoutes.post('/updateProfessionalPerson',multipartMiddleware,userController.updateProfessionalPerson);

//==============Order Placed Section=============================//

userRoutes.post('/updateUserId',userController.updateUserId);
userRoutes.post('/requestOrder',multipartMiddleware,userController.requestOrder);
userRoutes.post('/getOrder',userController.getOrder);

//==============Service Category Section==========================//

userRoutes.get('/getCategory',userController.getCategory);
userRoutes.post('/getSubCategory',userController.getSubCategory);
userRoutes.post('/getSubSubCategory',userController.getSubSubCategory);


//=============Normal User Dashboard==============================//

userRoutes.post('/getNormalUserPendingOrder',userController.getNormalUserPendingOrder);
userRoutes.post('/getNormalUserActiveOrder',userController.getNormalUserActiveOrder);
userRoutes.post('/getPastOrderForNormalUser1',userController.getPastOrderForNormalUser1);
userRoutes.post('/getOfferList',userController.getOfferList);
userRoutes.post('/acceptOffer',userController.acceptOffer);

//=============Delivery Person Dashboard=========================//

userRoutes.post('/getNewOrderForDeliveryPerson',userController.getNewOrderForDeliveryPerson);
userRoutes.post('/getPendingOrderDeliveryPerson',userController.getPendingOrderDeliveryPerson);
userRoutes.post('/getActiveOrderDeliveryPerson',userController.getActiveOrderDeliveryPerson);
userRoutes.post('/workDoneByDeliveryPerson',userController.workDoneByDeliveryPerson);
userRoutes.post('/getPastOrderDeliveryPerson1',userController.getPastOrderDeliveryPerson1);

//=============Professional Worker Dashboard=====================//

userRoutes.post('/makeAOfferByProfessionalWorker',userController.makeAOfferByProfessionalWorker);
userRoutes.post('/getNewOrderForProfessionalWorker',userController.getNewOrderForProfessionalWorker);
userRoutes.post('/getPendingOrderProfessionalWorker',userController.getPendingOrderProfessionalWorker);
userRoutes.post('/getActiveOrderProfessionalWorker',userController.getActiveOrderProfessionalWorker);
userRoutes.post('/orderCancelByProfessionalWorker',userController.orderCancelByProfessionalWorker);
userRoutes.post('/orderReportByProfessionalWorker',userController.orderReportByProfessionalWorker);
userRoutes.post('/workDoneByProfessionalWorker',userController.workDoneByProfessionalWorker);
userRoutes.post('/getPastOrderForProfessionalWorker1',userController.getPastOrderForProfessionalWorker1);


//==============Tracking Section==================================//

userRoutes.post('/goStatus',userController.goStatus);
userRoutes.post('/createInvoiceByDeliveryPerson',userController.createInvoiceByDeliveryPerson);
userRoutes.post('/arrivedStatus',userController.arrivedStatus);
userRoutes.post('/getInvoiceDetails',userController.getInvoiceDetails);


//==============Rating Section====================================//

userRoutes.post('/getAllRating',userController.getAllRating);
userRoutes.post('/rating',userController.rating);
userRoutes.post('/getRate',userController.getRate);


//==============Order Cancel Section==============================//

userRoutes.post('/orderCancel',userController.orderCancel);

//==============Order Report Section==============================//

userRoutes.post('/orderReport',userController.orderReport);
userRoutes.post('/orderReportByNormalUser',userController.orderReportByNormalUser);

//==============Notification Section===============================//

userRoutes.post('/getNotificationList',userController.getNotificationList);
userRoutes.post('/notificationSeen',userController.notificationSeen);
userRoutes.post('/getNotificationCount',userController.getNotificationCount);

//==============Chat Section========================================//

userRoutes.post('/getChatHistory',userController.getChatHistory);

//==============Common Apis=========================================//

userRoutes.post('/makeOffer',userController.makeOffer);
userRoutes.post('/updateLocation',userController.updateLocation);
userRoutes.post('/getTotal',userController.getTotal);
userRoutes.get('/getReportReason',userController.getReportReason);
userRoutes.post('/getOrderCount',userController.getOrderCount);
userRoutes.post('/getInvoicDetails',userController.getInvoicDetails);
userRoutes.get('/cronApi',userController.cronApi);
userRoutes.post('/updateOffer',userController.updateOffer);
userRoutes.post('/rejectOffer',userController.rejectOffer);
userRoutes.post('/checkCurrentOrder',userController.checkCurrentOrder);
userRoutes.post('/getTotalDeliAndProfUser',userController.getTotalDeliAndProfUser);
userRoutes.post('/orderCancelFromDelivery',userController.orderCancelFromDelivery);
userRoutes.post('/updatePopupStatus',userController.updatePopupStatus);
userRoutes.post('/deliveryActiveOrder',userController.deliveryActiveOrder);
userRoutes.post('/normalActiveOrder',userController.normalActiveOrder);
userRoutes.post('/changeDeliveryCaptain',userController.changeDeliveryCaptain);
userRoutes.get('/orderCategoryList',userController.orderCategoryList);
userRoutes.post('/declineWithdrawOrderRequest',userController.declineWithdrawOrderRequest);
userRoutes.post('/acceptWithdrawOrderRequest',userController.acceptWithdrawOrderRequest);
userRoutes.post('/getTracking',userController.getTracking);
userRoutes.post('/orderWithdrawFromDeliveryAndPro',userController.orderWithdrawFromDeliveryAndPro);
userRoutes.post('/checkOrderAcceptOrNot',userController.checkOrderAcceptOrNot);

//==========================Duty Status=======================================//

userRoutes.post('/updateDutyStatus',userController.updateDutyStatus);
userRoutes.post('/updateSubcategory',userController.updateSubcategory);


userRoutes.post('/driverupdateDutyStatus',storeController.driverupdateDutyStatus);
userRoutes.post('/getDriverNotificationCount',storeController.getDriverNotificationCount);
userRoutes.post('/driverSignin',storeController.driverSignin);
userRoutes.post('/driverMobileNumberChange',storeController.driverMobileNumberChange);
userRoutes.post('/driverLogout',storeController.driverLogout);
userRoutes.post('/driverChangeLanguage',storeController.driverChangeLanguage);
userRoutes.post('/getDriverDetails',storeController.getDriverDetails);
userRoutes.post('/driverContactUs',storeController.driverContactUs);
userRoutes.post('/driverMobilecheckAvailability',storeController.driverMobilecheckAvailability);
userRoutes.post('/getDriverNotificationList',storeController.getDriverNotificationList);
userRoutes.post('/updateDriverLocation',storeController.updateDriverLocation);
userRoutes.post('/driverCheckNumberForSignin',storeController.driverCheckNumberForSignin);
userRoutes.post('/driverSignup',multipartMiddleware,storeController.driverSignup);
userRoutes.post('/driverEditProfile',multipartMiddleware,storeController.driverEditProfile);
userRoutes.post('/getDriverRating',storeController.getDriverRating);
userRoutes.post('/deleteVehicleImage',storeController.deleteVehicleImage);

userRoutes.post('/sellerSignup',multipartMiddleware,storeController.sellerSignup);
userRoutes.post('/sellerProfileUpdate',multipartMiddleware,storeController.sellerProfileUpdate);
userRoutes.post('/addProduct',multipartMiddleware,storeController.addProduct);
userRoutes.post('/editProduct',multipartMiddleware,storeController.editProduct);
userRoutes.post('/sellerLogin',storeController.sellerLogin);
userRoutes.post('/selerForgotPassword',storeController.selerForgotPassword);
userRoutes.post('/getSellerDetail',storeController.getSellerDetail);
userRoutes.post('/updateNotificationStatus',storeController.updateNotificationStatus);
userRoutes.post('/sellerLogout',storeController.sellerLogout);
userRoutes.get('/getCuisineList',storeController.getCuisineList);
userRoutes.post('/getMenuListForSeller',storeController.getMenuListForSeller);
userRoutes.post('/deleteProduct',storeController.deleteProduct);
userRoutes.post('/updateProductStatus',storeController.updateProductStatus);
userRoutes.post('/updateOfferSeller',storeController.updateOfferSeller);
userRoutes.post('/getOfferListForSeller',storeController.getOfferListForSeller);
userRoutes.post('/getNotificationListForSeller',storeController.getNotificationListForSeller);
userRoutes.post('/getProductForSeller',storeController.getProductForSeller);
userRoutes.post('/getSubCategoryList',storeController.getSubCategoryList);
userRoutes.get('/getCategoryList',storeController.getCategoryList);
userRoutes.post('/getPaymentListForSeller',storeController.getPaymentListForSeller);
userRoutes.post('/getCommissionListForSeller',storeController.getCommissionListForSeller);
userRoutes.post('/getOrderForSeller',storeController.getOrderForSeller);

userRoutes.post('/addDeliverySlot',storeController.addDeliverySlot);
userRoutes.post('/updateSlot',storeController.updateSlot);
userRoutes.post('/getDeliverySlot',storeController.getDeliverySlot);
userRoutes.post('/updateSlotStatus',storeController.updateSlotStatus);
userRoutes.post('/deleteSlot',storeController.deleteSlot);

userRoutes.post('/getOrderForSeller',storeController.getOrderForSeller);
userRoutes.post('/orderDetail',storeController.orderDetail);


userRoutes.get('/getDashboardData',storeController.getDashboardData);
userRoutes.get('/getCuisineList',storeController.getCuisineList);
userRoutes.get('/getCategoryList',storeController.getCategoryList);
userRoutes.post('/getRestaurantAndStoreData',storeController.getRestaurantAndStoreData);
userRoutes.post('/addToFavourite',storeController.addToFavourite);
userRoutes.post('/getSubCategoryList',storeController.getSubCategoryList);
userRoutes.post('/getFavouriteList',storeController.getFavouriteList);
userRoutes.post('/getDeliverySlotList',storeController.getDeliverySlotList);
userRoutes.post('/getDeliveryCharge',storeController.getDeliveryCharge);
userRoutes.post('/getMenuData',storeController.getMenuData);
userRoutes.post('/addToCart',storeController.addToCart);
userRoutes.post('/updateCart',storeController.updateCart);
userRoutes.post('/getCartItem',storeController.getCartItem);
userRoutes.post('/clearCart',storeController.clearCart);




module.exports=userRoutes;