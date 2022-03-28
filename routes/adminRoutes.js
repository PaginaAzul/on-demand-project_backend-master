const adminRoutes=require('express').Router();
const adminController=require('../controllers/adminController.js');
var authHandler = require('../authHandler/auth.js')
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();

adminRoutes.post('/adminLogin',adminController.adminLogin);
adminRoutes.post('/adminLogout',adminController.adminLogout);
adminRoutes.post('/staticContentGet',adminController.staticContentGet);
adminRoutes.post('/StaticContentUpdate',adminController.StaticContentUpdate);
adminRoutes.post('/getAdminDetail',adminController.getAdminDetail);
adminRoutes.post('/passwordChange',adminController.passwordChange);
adminRoutes.post('/updateCurrency',adminController.updateCurrency);


adminRoutes.post('/addServiceCat',multipartMiddleware,adminController.addServiceCat);
adminRoutes.post('/addServiceSubCat',multipartMiddleware,adminController.addServiceSubCat);
adminRoutes.post('/addServiceSubSubCat',adminController.addServiceSubSubCat);

adminRoutes.post('/totalCount',adminController.totalCount);
adminRoutes.post('/adminForgotPassword',adminController.adminForgotPassword);

adminRoutes.post('/contactUsList',adminController.contactUsList);
adminRoutes.post('/contactDetails',adminController.contactDetails);
adminRoutes.post('/contactDelete',adminController.contactDelete);

adminRoutes.post('/getAllRating',adminController.getAllRating);
adminRoutes.post('/ratingDelete',adminController.ratingDelete);

adminRoutes.post('/getLanguage',adminController.getLanguage);
adminRoutes.post('/addLanguage',adminController.addLanguage);
adminRoutes.post('/updateLanguage',adminController.updateLanguage);
adminRoutes.post('/deleteLangauge',adminController.deleteLangauge);

adminRoutes.post('/getCategory',adminController.getCategory);
adminRoutes.post('/deleteCategory',adminController.deleteCategory);
adminRoutes.post('/getSubCategory',adminController.getSubCategory);
adminRoutes.post('/deleteSubCategory',adminController.deleteSubCategory);
adminRoutes.post('/getSubSubCategory',adminController.getSubSubCategory);
adminRoutes.post('/deleteSubSubCategory',adminController.deleteSubSubCategory);
adminRoutes.post('/updateCategory',multipartMiddleware,adminController.updateCategory);
adminRoutes.post('/updateSubCategory',multipartMiddleware,adminController.updateSubCategory);
adminRoutes.post('/updateSubSubCategory',adminController.updateSubSubCategory);

adminRoutes.post('/userList',adminController.userList);
adminRoutes.post('/getUserDetail',adminController.getUserDetail);
adminRoutes.post('/updateUserStatus',adminController.updateUserStatus);
adminRoutes.post('/getDeliverPersion',adminController.getDeliverPersion);
adminRoutes.post('/getProfessionalWorkers',adminController.getProfessionalWorkers);


adminRoutes.post('/orderList',adminController.orderList);
adminRoutes.post('/orderDetails',adminController.orderDetails);
adminRoutes.post('/orderListDeliveryPersion',adminController.orderListDeliveryPersion);
adminRoutes.post('/orderListProfessionalWorker',adminController.orderListProfessionalWorker);

adminRoutes.post('/addSubAdmin',adminController.addSubAdmin);
adminRoutes.post('/getSubAdmin',adminController.getSubAdmin);
adminRoutes.post('/deleteSubAdmin',adminController.deleteSubAdmin);
adminRoutes.post('/subAdminDetails',adminController.subAdminDetails);
adminRoutes.post('/updateSubAdminDetails',adminController.updateSubAdminDetails);

adminRoutes.post('/addUser',multipartMiddleware,adminController.addUser);
adminRoutes.post('/getBanner',adminController.getBanner);

adminRoutes.post('/updateRating',adminController.updateRating);
adminRoutes.post('/deliveryPerson',adminController.deliveryPerson);
adminRoutes.post('/deleteUser',adminController.deleteUser);
adminRoutes.post('/professionalWorker',multipartMiddleware,adminController.professionalWorker);
adminRoutes.post('/updateUserDetails',adminController.updateUserDetails);

adminRoutes.post('/getBank',adminController.getBank);
adminRoutes.post('/deleteBank',adminController.deleteBank);
adminRoutes.post('/updateBank',adminController.updateBank);
adminRoutes.post('/updateCertificateStatus',adminController.updateCertificateStatus);
adminRoutes.post('/updateAdminProfile',adminController.updateAdminProfile);

adminRoutes.get('/getReceipt/:fileName',adminController.getReceipt);
adminRoutes.post('/createPdf/',adminController.createPdf);

adminRoutes.post('/getOrderReport',adminController.getOrderReport);
adminRoutes.post('/getAccountData',adminController.getAccountData);
adminRoutes.post('/updateAccountData',adminController.updateAccountData);
adminRoutes.post('/sendMessageToUser',adminController.sendMessageToUser);
adminRoutes.post('/sendNotificationToAll',adminController.sendNotificationToAll);

adminRoutes.post('/getUserDataForAccountingDelivery',adminController.getUserDataForAccountingDelivery);
adminRoutes.post('/getUserDataForAccountingProfessional',adminController.getUserDataForAccountingProfessional);

adminRoutes.post('/updateMeasurementStatus',adminController.updateMeasurementStatus);
adminRoutes.post('/updateMinimumOfferStatus',adminController.updateMinimumOfferStatus);


adminRoutes.post('/updateMinimumOfferAllDelivery',adminController.updateMinimumOfferAllDelivery);
adminRoutes.post('/updateOfferAllProfessional',adminController.updateOfferAllProfessional);
adminRoutes.post('/updateMeasurementAllDelivery',adminController.updateMeasurementAllDelivery);
adminRoutes.post('/updateMeasurementAllProfessional',adminController.updateMeasurementAllProfessional);
adminRoutes.post('/getActionList',adminController.getActionList);

adminRoutes.post('/deleteAction',adminController.deleteAction);

adminRoutes.post('/addReportReason',adminController.addReportReason);
adminRoutes.post('/deleteReportReason',adminController.deleteReportReason);
adminRoutes.post('/getReportReasonList',adminController.getReportReasonList);
adminRoutes.post('/getOfferList',adminController.getOfferList);
adminRoutes.post('/deleteOffer',adminController.deleteOffer);
adminRoutes.post('/acceptOffer',adminController.acceptOffer);
adminRoutes.post('/orderCancel',adminController.orderCancel);
adminRoutes.post('/orderDelete',adminController.orderDelete);
adminRoutes.post('/orderDelete',adminController.orderDelete);
adminRoutes.post('/cancelOrderByworker',adminController.cancelOrderByworker);
adminRoutes.post('/getChatHistory',adminController.getChatHistory);
adminRoutes.post('/createExcel',adminController.createExcel);
adminRoutes.get('/getExcel/:fileName',adminController.getExcel);

adminRoutes.post('/getNotificationList',adminController.getNotificationList);
adminRoutes.post('/deleteNotification',adminController.deleteNotification);

adminRoutes.post('/sendMail',adminController.sendMail);
adminRoutes.post('/sendMailToSubAdmin',adminController.sendMailToSubAdmin);
adminRoutes.post('/updateCategoryStatus',adminController.updateCategoryStatus);
adminRoutes.post('/updateSubCategoryStatus',adminController.updateSubCategoryStatus);


adminRoutes.post('/addCuisine',adminController.addCuisine);
adminRoutes.post('/updateCuisine',adminController.updateCuisine);
adminRoutes.post('/deleteCuisine',adminController.deleteCuisine);
adminRoutes.post('/updateStatusCuisine',adminController.updateStatusCuisine);
adminRoutes.post('/getCuisineList',adminController.getCuisineList);

adminRoutes.post('/addProductCategory',multipartMiddleware,adminController.addProductCategory);
adminRoutes.post('/updateProductCategory',multipartMiddleware,adminController.updateProductCategory);
adminRoutes.post('/deleteProductCategory',adminController.deleteProductCategory);
adminRoutes.post('/updateStatusProductCategory',adminController.updateStatusProductCategory);
adminRoutes.post('/getProductCategoryList',adminController.getProductCategoryList);

adminRoutes.post('/addProductSubCategory',multipartMiddleware,adminController.addProductSubCategory);
adminRoutes.post('/updateProductSubCategory',multipartMiddleware,adminController.updateProductSubCategory);
adminRoutes.post('/deleteProductSubCategory',adminController.deleteProductSubCategory);
adminRoutes.post('/updateStatusProductSubCategory',adminController.updateStatusProductSubCategory);
adminRoutes.post('/getProductSubCategoryList',adminController.getProductSubCategoryList);

adminRoutes.post('/getStoreList',adminController.getStoreList);
adminRoutes.post('/getResAndStoreDetail',adminController.getResAndStoreDetail);
adminRoutes.post('/deleteResAndStore',adminController.deleteResAndStore);
adminRoutes.post('/updateSellerDocumentStatus',adminController.updateSellerDocumentStatus);
adminRoutes.post('/updateSellerStatus',adminController.updateSellerStatus);
adminRoutes.post('/getRestaurantList',adminController.getRestaurantList);
adminRoutes.post('/getDriverList',adminController.getDriverList);
adminRoutes.post('/updateStatusDriver',adminController.updateStatusDriver);
adminRoutes.post('/deleteDriver',adminController.deleteDriver);
adminRoutes.post('/updateDriverDocumentStatus',adminController.updateDriverDocumentStatus);
adminRoutes.post('/getDriverDetail',adminController.getDriverDetail);
adminRoutes.post('/addCommission',adminController.addCommission);
adminRoutes.post('/updateCommission',adminController.updateCommission);
adminRoutes.post('/deleteCommission',adminController.deleteCommission);
adminRoutes.post('/getCommissinList',adminController.getCommissinList);
adminRoutes.get('/getSellerList',adminController.getSellerList);
adminRoutes.post('/getProductOrderList',adminController.getProductOrderList);
adminRoutes.post('/productOrderDetail',adminController.productOrderDetail);
adminRoutes.post('/deleteAdminContact',adminController.deleteAdminContact);

adminRoutes.post('/getMainServiceList',adminController.getMainServiceList);
adminRoutes.post('/deleteMainService',adminController.deleteMainService);
adminRoutes.post('/updateStatusMainService',adminController.updateStatusMainService);
adminRoutes.post('/updateMainService',multipartMiddleware,adminController.updateMainService);

adminRoutes.post('/getHomeBannerList',adminController.getHomeBannerList);
adminRoutes.post('/updateHomeBanner',multipartMiddleware,adminController.updateHomeBanner);

adminRoutes.post('/addBannerOffer',multipartMiddleware,adminController.addBannerOffer);
adminRoutes.post('/updateBannerOffer',multipartMiddleware,adminController.updateBannerOffer);
adminRoutes.post('/getBannerOfferList',adminController.getBannerOfferList);
adminRoutes.post('/updateStatusBannerOffer',adminController.updateStatusBannerOffer);
adminRoutes.post('/deleteBannerOffer',adminController.deleteBannerOffer);

module.exports=adminRoutes;
