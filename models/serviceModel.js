var mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const db = mongoose.connection;
var Schema = mongoose.Schema;
var Service = mongoose.Schema({

    userId: { type: Schema.Types.ObjectId, ref: "user" },
    service: {
        type: String,
        enum: ["RequireService", "ProvideService"],
        default: 'ProvideService'
    },
    orderPdf: {
        type: String
    },
    status: {
        type: String,
        enum: ['Pending', 'Active', 'Cancel', 'Complete', 'Request'],
        default: "Pending"
    },
    orderCraetedByName: {
        type: String
    },
    adminVerifyDeliveryPerson: {
        type: String,
    },
    adminVerifyProfessionalWorker: {
        type: String,
    },
    signupWithNormalPerson: {
        type: String
    },
    signupWithDeliveryPerson: {
        type: String,
    },
    signupWithProfessionalWorker: {
        type: String,
    },
    orderCancelReason: {
        type: String
    },
    orderCancelMesaage: {
        type: String
    },
    orderNumber: {
        type: String
    },
    profilePic: {
        type: String
    },
    name: {
        type: String
    },
    countryCode: {
        type: String
    },
    mobileNumber: {
        type: String
    },
    price: {
        type: Number
    },
    serviceType: {
        type: String,
        enum: ['DeliveryPersion', 'ProfessionalWorker'],
        default: 'ProfessionalWorker'
    },
    seletTime: {
        type: String
    },
    selectCategoryName: {
        type: String
    },
    selectSubCategoryName: {
        type: String
    },
    selectSubSubCategoryName: {
        type: String
    },
    orderDetails: {
        type: String
    },
    pickupLocation: {
        type: String
    },
    location: {
        type: { type: String, default: 'Point', enum: ['Point'] },
        coordinates: [{ type: Number, createIndexes: true }],
        coordinates1: [{ type: Number, createIndexes: true }],
    },
    loc: {
        type: { type: String, default: 'Point', enum: ['Point'] },
        coordinates: [{ type: Number, createIndexes: true }],
    },
    orderCanelReason: {
        type: String
    },
    orderCancelMessage: {
        type: String
    },
    orderIssueReason: {
        type: String
    },
    orderIssueMessage: {
        type: String
    },
    pickupLat: {
        type: Number
    },
    pickupLong: {
        type: Number
    },
    dropOffLocation: {
        type: String
    },
    dropOffLat: {
        type: Number
    },
    dropOffLong: {
        type: Number
    },
    makeOfferByDeliveryPerson: [{
        makeOfferById: { type: Schema.Types.ObjectId, ref: "user" },
        minimumOffer: {
            type: String
        },
        message: {
            type: String
        },
        apprxTime: {
            type: String
        },
    }],
    makeOfferById: { type: Schema.Types.ObjectId, ref: "user" },
    offerMakeByName: {
        type: String
    },
    minimumOffer: {
        type: String
    },
    message: {
        type: String
    },
    apprxTime: {
        type: String
    },
    name: {
        type: String
    },
    countryCode: {
        type: String
    },
    profilePic: {
        type: String
    },
    mobileNumber: {
        type: String
    },
    offerAcceptedOfId: {
        type: { type: Schema.Types.ObjectId, ref: "user" },
    },
    offerAcceptedOfName: {
        type: String
    },
    offerAcceptedStatus: {
        type: Boolean
    },
    offerId: {
        type: Schema.Types.ObjectId, ref: "makeAOfferDeliveryPerson"
    },
    offerAcceptedOfProfile: {
        type: String
    },
    workDoneById: {
        type: Schema.Types.ObjectId, ref: "user",
    },
    deliveryOffer: {
        type: String
    },
    tax: {
        type: String
    },
    total: {
        type: String
    },
    reportReason: {
        type: String
    },
    reportMessage: {
        type: String
    },
    invoiceStatus: {
        type: String,
        default: "false"
    },
    invoiceSubtoatl: {
        type: String
    },
    invoiceTax: {
        type: String
    },
    invoiceImage: {
        type: String
    },
    invoicePdf: {
        type: String
    },
    invoiceTotal: {
        type: String
    },
    minimumOffer: {
        type: String
    },
    orderCancelledBy: { type: Schema.Types.ObjectId, ref: "user" },
    goStatus: {
        type: String,
        default: "false"
    },
    arrivedStatus: {
        type: String,
        default: "false"
    },
    workDoneStatus: {
        type: String,
        default: "false"
    },
    orderReported: {
        type: String,
        default: "false"
    },
    invoiceCreatedAt: {
        type: Date
    },
    invoiceMonth: {
        type: Number
    },
    invoiceYear: {
        type: Number
    },
    roomId: {
        type: String
    },
    orderCreatedByName: {
        type: String
    },
    deleteStatus: {
        type: Boolean,
        default: false
    },
    time: {
        type: Number
    },
    pastOrderTime: {
        type: Number
    },
    popupStatus: {
        type: String,
        default: 'Show'
    },
    currency:{
        type:String
    },
    orderImages: [],
    skipProvider:[{
        userId:{ type: Schema.Types.ObjectId, ref: "user" }
    }],
    categoryNameArray:[],
    subCategoryNameArray:[],
    serviceCategoryId:{ type: Schema.Types.ObjectId, ref: "categories" },
    serviceSubCategoryId:{ type: Schema.Types.ObjectId, ref: "subcategories" },
    portugueseCategoryName:{
        type:String
    },
    portugueseSubCategoryName:{
        type:String
    },


}, {
    timestamps: true
})
Service.index({ location: '2dsphere' });
Service.plugin(mongoosePaginate)
Service.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('service', Service);