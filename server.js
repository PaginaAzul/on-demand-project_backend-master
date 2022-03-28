const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const app = express();
const cors = require('cors');
const ChatHistory = require('./models/chatHistoryModel.js');
const Tracking = require('./models/trackingModel.js');
const server = require('http').Server(app);
const io = require('socket.io')(server);
const User = require('./models/userModel.js');
const func = require('./controllers/function.js');
const Notification = require('./models/notificationModel.js');
const bodyParser = require('body-parser')
const cloudinary = require('cloudinary');
const shortUrl = require('node-url-shortener');
const urlMetadata = require('url-metadata');
const ServiceModel = require('./models/serviceModel.js');
const { ObjectId } = require('mongodb');
const fs = require('fs')
const Files = {};
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
const morgan = require('morgan');
app.use(morgan('combined'))
app.set('trust proxy', true); 
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
cloudinary.config({
  cloud_name: 'boss8055',
  api_key: '586377977311428',
  api_secret: 'uvX8_Mjf2QoArR-HxkeaHgyu-AQ'
});
require('./models/homeBannerModel.js')
require('./models/mainServiceTypeModel.js')

mongoose.connect('mongodb://127.0.0.1:27017/Paginazul2', { useNewUrlParser: true }, (error, result) => {
  if (error) {
    console.log("Error in connecting with mongodb");
  }
  else {
    console.log("Successfully connected with mongodb");
  }
})

process.on('uncaughtException', function (err) {
  console.log(err);
})
process.setMaxListeners(0);


app.get('/', (req, res) => {
  var message = "Please Use the following URL for connect socket " + req.protocol + '://' + req.get('host') + req.originalUrl
  res.send(message)
})

app.use(cors());
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/admin', adminRoutes);

var sockets = {};
module.exports.sockets = sockets;

//===========================Socket===============================//

io.on('connection', function (socket) {
  console.log('socket connected', socket.id);

  //======================Room Join====================================//

  socket.on('roomEventJoin', function (msg) {
    console.log('room join', msg);
    socket.join(msg.roomId, () => {
      io.to(msg.roomId).emit('roomEventJoinServer', { status: true, data: msg });
    });
  });

  //======================Room Join====================================//

  socket.on('room join', function (msg) {
    console.log('room join', msg.roomId);
    socket.join(msg.roomId, () => {
      io.to(msg.roomId).emit('room join', { status: true, roomId: msg.roomId });
    });
  });

  //======================Room Leave==================================//

  socket.on('room leave', (msg) => {
    console.log('room leave', msg.roomId);
    socket.leave(msg.roomId, () => {
      io.to(msg.roomId).emit('room leave', { status: true, roomId: msg.roomId });
    });
  })

  //======================Typing start================================//

  socket.on('typeIn', (msg) => {
    console.log('typeIn', msg.roomId);
    io.to(msg.roomId).emit('typeIn', { status: true, roomId: msg.roomId });
  })

  //======================Tracking===================================//

  socket.on('tracking', (msg) => {
    console.log('tracking', msg);
    io.to(msg.roomId).emit('tracking', msg);
    Tracking.findOne({ roomId: msg.roomId }, (err, trackingData) => {
      if (!trackingData) {
        let trackingObj = new Tracking({
          roomId: msg.roomId,
          latitude: msg.lattitude,
          longitude: msg.longitude
        })
        trackingObj.save((err1, trackingSucc) => {
          console.log("Tracking Data save", trackingSucc);
        })
      }
      else {
        let obj = {
          $set: {
            roomId: msg.roomId,
            latitude: msg.lattitude,
            longitude: msg.longitude
          }
        }
        Tracking.findByIdAndUpdate({ _id: trackingData._id }, obj, { new: true }, (err2, updateTracking) => {
          console.log("Updated Tracking is===========>", updateTracking);
        })

      }
    })

  })

  //======================Typing stop================================//

  socket.on('typeOut', (msg) => {
    console.log('typeOut', msg.roomId);
    io.to(msg.roomId).emit('typeOut', msg);
  })

  //=====================Message send================================//

  socket.on('message', function (msg, callback) {

    console.log("Request for chat is===========>", msg)
    let roomIdTemp = msg.roomId
    let orderId = roomIdTemp.substring(0, 24)
    ServiceModel.findOne({ _id: ObjectId(orderId) }, (errorOrder, resultOrder) => {
      if (resultOrder.status == "Cancel") {
        io.to(msg.roomId).emit('message', 'Oops! chat is not available at this moment.');
      }
      if (resultOrder.status == "Complete") {
        io.to(msg.roomId).emit('message', 'Oops! chat for this order has been closed.');
      }
      else {
        if (msg.messageType == 'Location') {
          urlMetadata(msg.message).then(
            function (metadata) {
              console.log(metadata.image)
              msg.createdAt = new Date().toISOString();

              var chat = new ChatHistory({
                "roomId": msg.roomId,
                "senderId": msg.senderId,
                "receiverId": msg.receiverId,
                "message": metadata.image,
                "messageType": msg.messageType,
                "url": msg.message
              });
              chat.save((error, result) => {
                io.to(msg.roomId).emit('message', result);
                console.log("Chat data is==========>", result);
                User.findOne({ "_id": msg.senderId }, (error1, result1) => {
                  if (error1) {
                    console.log("Error 1 is========>", error1);
                  }
                  else if (result1) {
                    User.findOne({ "_id": msg.receiverId }, (error2, result2) => {
                      if (error2) {
                        console.log("Error 2 is==========>", error2);
                      }
                      else if (result2) {
                        if (result2.deviceType == 'android') {
                          let title=`New Message Received`
                          let message=`${result1.name}:${msg.message}`
                          if(result2.appLanguage=='Portuguese'){
                             title=`Nova mensagem recebida`
                          }
                          func.sendNotificationForAndroid(result2.deviceToken, title, message, (error10, result10) => {
                            if (error10) {
                              console.log("Error 10 is=========>", error10);
                            }
                            else {
                              console.log("Send notification is=============>", result10);
                              return;
                            }
                          })

                        }
                        else if (result2.deviceType == 'iOS') {
                          let query2 = { $and: [{ "notiTo": msg.receiverId }, { "isSeen": "false" }] }
                          Notification.find(query2, (error12, result12) => {
                            if (error12) {
                              console.log("Error 12 is=========>", error12);
                            }
                            else {
                              let badgeCount = result12.length;
                              let title=`New Message Received`
                              let message=`${result1.name}:${msg.message}`
                              if(result2.appLanguage=='Portuguese'){
                                 title=`Nova mensagem recebida`
                              }
                              if(result12.userType=="Provider"){
                                func.sendiosNotification2Provider(result2.deviceToken, title, message, badgeCount, (error10, result10) => {
                                  if (error10) {
                                    console.log("Error 10 is=========>", error10);
                                  }
                                  else {
                                    console.log("Send notification is=============>", result10);
                                    return;
                                  }
                                })
                                
                              }
                              if(result12.userType=="User"){
                                func.sendiosNotification2(result2.deviceToken, title, message, badgeCount, (error10, result10) => {
                                  if (error10) {
                                    console.log("Error 10 is=========>", error10);
                                  }
                                  else {
                                    console.log("Send notification is=============>", result10);
                                    return;
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
              })
            },
            function (error) {
              console.log(error)
            })

        }
        else {
          msg.createdAt = new Date().toISOString();
          msg.url = msg.url
          io.to(msg.roomId).emit('message', msg);
          var chat = new ChatHistory({
            "roomId": msg.roomId,
            "senderId": msg.senderId,
            "receiverId": msg.receiverId,
            "message": msg.message,
            "messageType": msg.messageType,
          });
          chat.save((error, result) => {
            console.log("Chat data is==========>", result);
            User.findOne({ "_id": msg.senderId }, (error1, result1) => {
              if (error1) {
                console.log("Error 1 is========>", error1);
              }
              else if (result1) {
                User.findOne({ "_id": msg.receiverId }, (error2, result2) => {
                  if (error2) {
                    console.log("Error 2 is==========>", error2);
                  }
                  else if (result2) {
                    let title=`New Message Received`
                    let message=`${result1.name}:${msg.message}`
                    if(result2.appLanguage=='Portuguese'){
                       title=`Nova mensagem recebida`
                    }
                    if (result2.deviceType == 'android') {

                      func.sendNotificationForAndroid(result2.deviceToken, title, message, (error10, result10) => {
                        if (error10) {
                          console.log("Error 10 is=========>", error10);
                        }
                        else {
                          console.log("Send notification is=============>", result10);
                          return;
                        }
                      })

                    }
                    else if (result2.deviceType == 'iOS') {
                      let query2 = { $and: [{ "notiTo": msg.receiverId }, { "isSeen": "false" }] }
                      Notification.find(query2, (error12, result12) => {
                        if (error12) {
                          console.log("Error 12 is=========>", error12);
                        }
                        else {
                          let badgeCount = result12.length;
                          if(result12.userType=="Provider"){
                            func.sendiosNotification2Provider(result2.deviceToken, title, message, badgeCount, (error10, result10) => {
                              if (error10) {
                                console.log("Error 10 is=========>", error10);
                              }
                              else {
                                console.log("Send notification is=============>", result10);
                                return;
                              }
                            })
                            
                          }
                          if(result12.userType=="User"){
                            func.sendiosNotification2(result2.deviceToken, title, message, badgeCount, (error10, result10) => {
                              if (error10) {
                                console.log("Error 10 is=========>", error10);
                              }
                              else {
                                console.log("Send notification is=============>", result10);
                                return;
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
          })
        }
      }
    })


  });

  //======================Read message=================================//

  socket.on('message read', function (msg, callback) {
    if (msg.roomId != "" && msg.roomId != null && msg.message != null && msg.message != '') {
      msg.check_status = 'read';
      io.to(msg.roomId).emit('message read', msg);
    }
  })

  //=====================Chat history=================================//

  socket.on("chatHistory", (data) => {

    console.log("Request for chat history is===========>", data);
    ChatHistory.aggregate([
      {
        $match: {
          "roomId": data.roomId
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
    ], (error, result) => {
      if (error) {
        console.log("Error is===========>", error);
      }
      else if (result.length == 0) {
        socket.emit('chatHistory', {
          Data: result
        });
        console.log("Chat history is===========>", result)
      }
      else {
        socket.emit('chatHistory', {
          Data: result
        });
        console.log("Chat history is=============>", result);
      }
    })
  })

  //=========================Upload File Start===========================//

  socket.on('uploadFileStart', function (data) {

    console.log("Data is==========>", data);
    var fileName = data[0].Name;
    var fileSize = data[0].Size;
    var Place = 0;
    var directory = '/var/www/html/paginazul-version2/public/'
    if (fs.existsSync(directory)) {

    } else {
      fs.mkdir(directory)
    }
    var uploadFilePath = directory + '/' + fileName;
    console.log('uploadFileStart # Uploading file: %s to %s. Complete file size: %d', fileName, uploadFilePath, fileSize);
    Files[fileName] = {
      FileSize: fileSize,
      Data: "",
      Downloaded: 0
    }
    fs.open(uploadFilePath, "a", 0755, function (err, fd) {
      if (err) {
        console.log(err);
      }
      else {
        console.log('uploadFileStart # Requesting Place: %d Percent %d', Place, 0);
        Files[fileName]['Handler'] = fd;
        socket.emit('uploadFileMoreDataReq', { 'Place': Place, 'Percent': 0 });
      }
    });
  });

  //========================Upload file chunk========================//

  socket.on('uploadFileChuncks', (data) => {

    console.log("Upload request is============>", data);
    let roomIdTemp = data[0].room_id
    let orderId = roomIdTemp.substring(0, 24)
    ServiceModel.findOne({ _id: ObjectId(orderId) }, (errorOrder, resultOrder) => {
      if (resultOrder.status == "Cancel") {
        io.to(msg.roomId).emit('message', 'Oops! chat is not available at this moment.');
      }
      if (resultOrder.status == "Complete") {
        io.to(msg.roomId).emit('message', 'Oops! chat for this order has been closed.');
      }
      else {
        console.log(data[0].flag)
        var Name = data[0].Name;
        var base64Data = data[0].Data;
        var playload = new Buffer(base64Data, 'base64').toString('binary');
        console.log('uploadFileChuncks # Got name: %s, received chunk size %d.', Name, playload, playload.length);
        if (data[0].flag == 'new') {
          Files[Name]['Downloaded'] = playload.length;
          Files[Name]['Data'] = playload;
        } else {
          Files[Name]['Downloaded'] += playload.length;
          Files[Name]['Data'] += playload;
        }
        if (Files[Name]['Downloaded'] == Files[Name]['FileSize']) {
          console.log('uploadFileChuncks # File %s receive completed', Name);
          fs.write(Files[Name]['Handler'], Files[Name]['Data'], null, 'Binary', (err, Writen) => {
            fs.close(Files[Name]['Handler'], () => {
              console.log('file closed');
            });
            var message = data[0];
            message.roomId = data[0].room_id;
            message.senderId = data[0].sender_id;
            message.receiverId = data[0].receiver_id;
            message.messageType = "Media";
            message.profilePic = data[0].profilePic;
            message.createdAt = new Date().toISOString();
            message.time = new Date().toISOString();
            message.media = 'http://3.129.47.202/paginazul-version2/public/' + Name
            console.log('file complete')
            console.log(message);
            socket.emit('uploadFileCompleteRes', { 'IsSuccess': true });
            io.to(data[0].room_id).emit('message', message);
            cloudinary.v2.uploader.upload('/var/www/html/paginazul-version2/public/' + Name, { resource_type: "auto" }, (err1, result1) => {
              if (err1) {
                console.log("Err 1 is============>", err1)
              }
              else if (result1) {
                console.log("Url is==========>", result1.secure_url);
                let mediaObj = new ChatHistory({
                  "senderId": data[0].sender_id,
                  "receiverId": data[0].receiver_id,
                  "roomId": data[0].room_id,
                  "messageType": "Media",
                  "media": result1.secure_url,
                })
                mediaObj.save((error1, result2) => {
                  console.log("Media chat data saved===========>", result2);
                  User.findOne({ "_id": data[0].sender_id }, (error3, result3) => {
                    if (error3) {
                      console.log("Error 1 is========>", error3);
                    }
                    else if (result3) {
                      User.findOne({ "_id": data[0].receiver_id }, (error4, result4) => {
                        if (error4) {
                          console.log("Error 2 is==========>", error4);
                        }
                        else if (result4) {
                          let title=`New Message Received`
                          let message=`${result3.name}:[Image]`
                          if(result4.appLanguage=='Portuguese'){
                             title=`Nova mensagem recebida`
                          }
                          if (result4.deviceType == 'android') {

                            func.sendNotificationForAndroid(result4.deviceToken,title, message, (error10, result10) => {
                              if (error10) {
                                console.log("Error 10 is=========>", error10);
                              }
                              else {
                                console.log("Send notification is=============>", result10);
                                return;
                              }
                            })

                          }
                          else if (result4.deviceType == 'iOS') {
                            let query2 = { $and: [{ "notiTo": data[0].receiver_id }, { "isSeen": "false" }] }
                            Notification.find(query2, (error12, result12) => {
                              if (error12) {
                                console.log("Error 12 is=========>", error12);
                              }
                              else {
                                let badgeCount = result12.length;
                                if(result4.userType=="User"){
                                  func.sendiosNotification2(result4.deviceToken, title, message, badgeCount, (error10, result10) => {
                                    if (error10) {
                                      console.log("Error 10 is=========>", error10);
                                    }
                                    else {
                                      console.log("Send notification is=============>", result10);
                                      return;
                                    }
                                  })
                                }
                                if(result4.userType=="Provider"){
                                  func.sendiosNotification2Provider(result4.deviceToken, title, message, badgeCount, (error10, result10) => {
                                    if (error10) {
                                      console.log("Error 10 is=========>", error10);
                                    }
                                    else {
                                      console.log("Send notification is=============>", result10);
                                      return;
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
                })
              }
            })
          });
        }
        else if (Files[Name]['Data'].length > 10485760) {
          console.log('uploadFileChuncks # Updating file %s with received data', Name);
          fs.write(Files[Name]['Handler'], Files[Name]['Data'], null, 'Binary', (err, Writen) => {
            Files[Name]['Data'] = "";
            var Place = Files[Name]['Downloaded'];
            var Percent = (Files[Name]['Downloaded'] / Files[Name]['FileSize']) * 100;
            socket.emit('uploadFileMoreDataReq', { 'Place': Place, 'Percent': Percent });
          });
        }
        else {
          var Place = Files[Name]['Downloaded'];
          var Percent = (Files[Name]['Downloaded'] / Files[Name]['FileSize']) * 100;
          console.log('uploadFileChuncks # Requesting Place: %d, Percent %s', Place, Percent);
          socket.emit('uploadFileMoreDataReq', { 'Place': Place, 'Percent': Percent });
        }
      }
    })
  });
});

//=========================Terms & condition Html===================//

app.get('/terms', (req, res) => {
  res.sendFile(__dirname + '/view/terms.html')
});

//=========================Privacy Html============================//

app.get('/privacy', (req, res) => {
  res.sendFile(__dirname + '/view/privacy.html')
});

//===========================About us Html=========================//

app.get('/about', (req, res) => {
  res.sendFile(__dirname + '/view/about.html')
});

//===========================Server connection====================//

server.listen(3021, function () {
  console.log("Server running on port: 3021");
});