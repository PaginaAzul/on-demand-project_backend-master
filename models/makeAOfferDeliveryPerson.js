var mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
var Schema = mongoose.Schema;
var MakeAOfferDeliveryPerson = mongoose.Schema({


    realOrderId: { type: Schema.Types.ObjectId, ref: "service" },
    userId: { type: Schema.Types.ObjectId, ref: "user" },
    orderOwner: { type: Schema.Types.ObjectId, ref: "user" },
    service: {
        type: String,
    },
    status: {
        type: String,
        enum: ['Pending', 'Active', 'Cancel','Complete','Request'],
        default: "Pending"
    },

    orderCancelReason: {
        type: String
    },
    orderCancelMesaage: {
        type: String
    },
    makeOfferById: { type: Schema.Types.ObjectId, ref: "user" },
    offerMakeByName: {
        type: String
    },
    offerMakeByProfile:{
        type:String
    },
    offerMakeByCountryCode:{
        type:String
    },
    offerMakeByMobileNumber:{
        type:String
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
    signupWithDeliveryPerson: {
        type:String,
    },
    adminVerifyDeliveryPerson:{
        type:String,
    },
    signupWithProfessionalWorker: {
        type:String,
    },
    adminVerifyProfessionalWorker:{
        type:String,
    },
    name:{
        type:String
    },
    countryCode:{
        type:String
    },
    profilePic:{
        type:String
    },
    mobileNumber:{
        type:String
    },
    orderNumber: {
        type: String
    },
    price: {
        type: Number
    },
    serviceType: {
        type: String,
    },
    seletTime: {
        type: String
    },
    serviceCategoryId: { type: Schema.Types.ObjectId, ref: "subSubCategory" },
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
    reportReason:{
        type:String
    },
    reportMessage:{
        type:String
    },
    deliveryOffer:{
        type:String,
        default:"100"
    },
    tax:{
        type:String,
        default:"5"
    },
    total:{
        type:String,
        default:"105"
    },
    invoiceCreatedAt: {
        type: Date,
        default: new Date()
    },
    offerAcceptedById:{
        type:Schema.Types.ObjectId
    },
    offerAcceptedByName:{
        type:String
    },
    offerAcceptedStatus:{
        type:Boolean
    },
    offerAcceptedByProfile:{
        type:String
    },
    invoiceStatus:{
        type:String,
        default:"false"
    },
    invoiceSubtoatl:{
        type:Number
    },
    invoiceTax:{
        type:Number
    },
    invoiceTotal:{
        type:Number
    },
    invoiceImage:{
        type:String
    },
    invoicePdf:{
        type:String
    },
    orderCancelledBy:{
        type:Schema.Types.ObjectId
    },
    arrivedStatus:{
        type:String,
        default:"false"
    },
    workDoneStatus:{
        type:String,
        default:"false"
    },
    goStatus:{
        type:String,
        default:"false"
    },
    roomId:{
        type:String
    },
    deleteStatus:{
        type:Boolean,
        default:false
    },
    time:{
        type:Number
    },
    pastOrderTime:{
        type:Number
    },
    popupStatus:{
        type:String,
        default:'Show'
    },
    currency:{
        type:String
    },
    categoryNameArray:[],
    subCategoryNameArray:[],
    portugueseCategoryName:{
        type:String
    },
    portugueseSubCategoryName:{
        type:String
    },
    selectCategoryName :{
        type:String
    },
    selectSubCategoryName:{
        type:String
    }
   
}, {
        timestamps: true
    })

MakeAOfferDeliveryPerson.plugin(mongoosePaginate)
MakeAOfferDeliveryPerson.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('makeaofferdeliverypeoples', MakeAOfferDeliveryPerson);