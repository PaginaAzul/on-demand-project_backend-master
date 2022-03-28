const mongoose = require('mongoose')
let nodemailer = require('nodemailer')
var apn = require("apn"),
    options, connection, notification;
var FCM = require('fcm-node');
var serverKey = 'AAAAJAjEju4:APA91bHancAxXAgqbmfUqVBvccV-QSJo7eLZh1skW8moW6w0hhO5Nt6KzaHzJmP7NJzP8ptPzQY2cz_n2wIpwtciXvvzKOlDmM8fT3cJItpK6UeZKQi-RPCBz4flQxMgrKIFQQDI_LOn';
var fcm = new FCM(serverKey);
var bcrypt = require('bcryptjs');
let saltRounds = 10;
var realEmail = 'noreply.unodogs@gmail.com'
var realPassword = 'Angel@3011'

exports.bcrypt = function (divPass, cb) {
    bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(divPass, salt, function (err, hashPassword) {
            cb(null, hashPassword)
        });
    });
};

//* Send Forgot Mail Template

//==============================================Forgot password Template====================================//

exports.sendHtmlEmail = (email, subject, name, message, callback) => {
    let HTML;
    let welcomeMessage, copyrightMessage, imageLogo;
    imageLogo = "https://res.cloudinary.com/boss8055/image/upload/v1577683005/a.png";
    welcomeMessage = 'Welcome to Jokar App'
    copyrightMessage = "© Jokar"
    HTML = `<!DOCTYPE html>
    <html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
      <meta charset="utf-8">
      <meta http-equiv="x-ua-compatible" content="ie=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
      <meta name="x-apple-disable-message-reformatting">
      <title>Confirm Your Email</title>
      <!--[if mso]>
      <xml>
        <o:OfficeDocumentSettings>
          <o:AllowPNG/>
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
      <style>
        table {border-collapse: collapse;}
        .spacer,.divider {mso-line-height-rule:exactly;}
        td,th,div,p,a {font-size: 13px; line-height: 22px;}
        td,th,div,p,a,h1,h2,h3,h4,h5,h6 {font-family:"Segoe UI",Helvetica,Arial,sans-serif;}
      </style>
      <![endif]-->
    <style type="text/css">
        @import url('https://fonts.googleapis.com/css?family=Lato:300,400,700|Open+Sans');
        table {border-collapse:separate;}
          a, a:link, a:visited {text-decoration: none; color: #00788a;} 
          a:hover {text-decoration: underline;}
          h2,h2 a,h2 a:visited,h3,h3 a,h3 a:visited,h4,h5,h6,.t_cht {color:#000 !important;}
          .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td {line-height: 100%;}
          .ExternalClass {width: 100%;}
        @media only screen {
          .col, td, th, div, p {font-family: "Open Sans",-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI","Roboto","Helvetica Neue",Arial,sans-serif;}
          .webfont {font-family: "Lato",-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI","Roboto","Helvetica Neue",Arial,sans-serif;}
        }
    
        img {border: 0; line-height: 100%; vertical-align: middle;}
        #outlook a, .links-inherit-color a {padding: 0; color: inherit;}
    </style>
    </head>
    <body style="box-sizing:border-box;margin:0;padding:0;width:100%;word-break:break-word;-webkit-font-smoothing:antialiased;">
        <div width="100%" style="margin:0; background:#f5f6fa">
            <table cellspacing="0" cellpadding="0" border="0" align="center" width="600" style="margin:0 auto" class="">
                <tbody>
                    <tr style="margin:0;padding:0">
                        <td width="600" height="130" valign="top" class="" style="background-image:url(https://res.cloudinary.com/dnjgq0lig/image/upload/v1546064214/vyymvuxpm6yyoqjhw6qr.jpg);background-repeat:no-repeat;background-position:top center;">
                            <table width="460" height="50" class="" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto">
                                <tbody>
                                </tbody>
                            </table>
                            <table width="460" class="" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto">
                                <tbody>
                                <tr style="margin:0;padding:0">
                                <td style="text-align:center; padding: 10px;">
                                    <img src="${imageLogo}" alt="kryptoro" width="100" class="">
                                </td>
                            </tr>
                                    <tr bgcolor="#ffffff" style="margin:0;padding:0;text-align:center;background:#ffffff;border-top-left-radius:4px;border-top-right-radius:4px">
                                        <td>
                                            <table width="460" class="" bgcolor="#ffffff" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto;background:#ffffff;border-top-left-radius:4px;border-top-right-radius:4px">
                                                <tbody>
                                                    <tr style="margin:0;padding:0">
                                                        <td bgcolor="#ffffff" height="30" style="text-align:center;background:#ffffff;border-top-left-radius:4px;border-top-right-radius:4px">
                                                        </td>
                                                    </tr>
                                                    <tr style="margin:0;padding:0">
                                                        <td bgcolor="#ffffff" height="100" style="text-align:center;background:#ffffff">
                                                            <img src="https://res.cloudinary.com/dvflctxao/image/upload/v1544705930/wp0z7cswoqigji0whe7n.png" alt="Email register" class="">
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
    
                        </td>
                    </tr>
    
                    <tr>
                        <td>
                            <table width="460" class="" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto">
                                <tbody>
                                    <tr style="margin:0;padding:0">
                                        <td bgcolor="#ffffff" height="20" style="font-size:0;line-height:0;text-align:center;background:#ffffff">
                                        &nbsp;
                                        </td>
                                    </tr>
                                    <tr style="margin:0;padding:0">
                                        <td bgcolor="#ffffff" style="text-align:center;background:#ffffff">
                                            <p style="margin:0;font-family:'Open Sans',Open Sans,Verdana,sans-serif;font-size:26px;line-height:26px;color:#272c73!important;font-weight:600;margin-bottom:20px">${welcomeMessage}</p>
                                        </td>
                                    </tr>
                                    <tr style="margin:0;padding:0">
                                        <td bgcolor="#ffffff" style="font-family:'Open Sans',Open Sans,Verdana,sans-serif;font-size:14px;line-height:1.5;color:#3a4161;text-align:center;font-weight:300">
                                            <p style="margin:0 30px;color:#3a4161"><h3>New Password</h3></p>
                                            <p style="margin:0 30px;color:#3a4161"><h4>${message}</h4></p>
                                        </td>
                                    </tr>
                                    <tr style="margin:0;padding:0">
                                        <td bgcolor="#ffffff" style="font-family:'Open Sans',Open Sans,Verdana,sans-serif;font-size:14px;line-height:1.5;color:#3a4161;text-align:center;font-weight:300">
                                            <p style="margin:0 30px;color:#3a4161"><h5>Please reset your password immediately. Do not share your password with anyone.</h5></p>
                                        </td>
                                    </tr>
                                    <tr style="margin:0;padding:0">
                                        <td bgcolor="#ffffff" style="font-family:'Open Sans',Open Sans,Verdana,sans-serif;font-size:14px;line-height:1.5;color:#3a4161;text-align:center;font-weight:300">
                                            <p style="margin:0 30px;color:#3a4161"><h4>Use this password for further login process. This is system generated mail. Do not reply. </h4></p>
                                        </td>
                                    </tr>
                                    <tr style="margin:0;padding:0">
                                        <td bgcolor="#ffffff" height="30" style="font-size:0;line-height:0;text-align:center;background:#ffffff">
                                        &nbsp;
                                        </td>
                                    </tr>
                                    <tr style="margin:0;padding:0">
                                        <td bgcolor="#ffffff" style="font-family:'Open Sans',Open Sans,Verdana,sans-serif;font-size:17px;font-weight:bold;line-height:20px;color:#ffffff">
                                            <table cellspacing="0" cellpadding="0" border="0" align="center" style="margin:auto">
                                                <tbody>
                                                    <tr style="margin:0;padding:0">
                                                        <td>
                       
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        </td>
                                    </tr>
                                    <tr style="margin:0;padding:0">
                                        <td height="40" bgcolor="#ffffff" style="background:#ffffff;font-size:0;line-height:0;border-bottom-left-radius:4px;border-bottom-right-radius:4px">
                                            &nbsp;
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                    <tr style="margin:0;padding:0">
                        <td height="30" style="font-size:0;line-height:0;text-align:center">
                        &nbsp;
                        </td>
                    </tr>
                </tbody>
            </table>
            <table cellspacing="0" cellpadding="0" border="0" align="center" width="600" style="margin:auto" class="">
                <tbody>
    
          <tr style="margin:0;padding:0">
                    <td height="20" style="font-size:0;line-height:0">
                        &nbsp;
                    </td>
                </tr>
    
                <tr style="margin:0;padding:0">
                    <td valign="middle" style="width:100%;font-size:13px;text-align:center;color:#aeb2c6!important" class="m_-638414352698265372m_619938522399521914x-gmail-data-detectors">
                        <p style="font-family:'Open Sans',Open Sans,Verdana,sans-serif;line-height:16px;font-size:13px!important;color:#aeb2c6!important;margin:0 30px">${copyrightMessage}. All rights reserved.</p>
                    </td>
                </tr>
                <tr style="margin:0;padding:0">
                    <td height="20" style="font-size:0;line-height:0">
                        &nbsp;
                    </td>
                </tr>
            </tbody></table>
        </div>
    </body>
    </html>`

    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: realEmail,
            pass: realPassword
        }
    })
    var messageObj = {
        from: 'No reply<a2karya8055@gmail.com>',
        to: email,
        subject: subject,
        html: HTML,

    }
    transporter.sendMail(messageObj, (err, info) => {
        console.log("Error and Info is===========", err, info);
        if (err) {
            callback(null, err);
        } else if (info) {
            callback(null, info)

        }
    })




}

//* Ios Notification With Dynamic Badge Count And Type 

//============================================Send Notification Ios=========================================//

exports.sendiosNotification = (deviceToken, title, msg, badgeCount, type, callback) => {

    console.log("Device token is=======>", deviceToken);
    var options = {
        "cert": "User_Production.pem",
        "key": "User_Production.pem",
    //    "passphrase":"1234",
        "production": true
    };
    var apnProvider = new apn.Provider(options);
    var note = new apn.Notification();
    note.expiry = Math.floor(Date.now() / 1000) + 3600;
    note.badge = badgeCount;
    note.sound = "default";
    note.alert = msg;
    note.payload = { title: title, msg: msg, type: type };
    note.topic = "com.paginzul.app";
    console.log({ title: title, msg: msg, type: type })
    apnProvider.send(note, deviceToken).then((result) => {
        console.log("Ios notication send successfully is=============>", result);
    })
        .catch((e) => {
            console.log("err in sending ios notification is==================>", e);
        })

};


exports.sendiosNotificationProvider = (deviceToken, title, msg, badgeCount, type, callback) => {

    console.log("Device token is=======>", deviceToken);
    var options = {
        "cert": "Provider_Production.pem",
        "key": "Provider_Production.pem",
       "passphrase":"1234",
        "production": true
    };
    var apnProvider = new apn.Provider(options);
    var note = new apn.Notification();
    note.expiry = Math.floor(Date.now() / 1000) + 3600;
    note.badge = badgeCount;
    note.sound = "default";
    note.alert = msg;
    note.payload = { title: title, msg: msg, type: type };
    note.topic = "com.paginzulProvider.app";
    console.log({ title: title, msg: msg, type: type })
    apnProvider.send(note, deviceToken).then((result) => {
        console.log("Ios notication send successfully is=============>", result);
    })
        .catch((e) => {
            console.log("err in sending ios notification is==================>", e);
        })

};

//* Send Block And Unblock Mail Template

//==========================================Update user status=============================================//

exports.sendHtmlEmail1 = (email, subject, sms, message, callback) => {
    let HTML;
    let welcomeMessage, copyrightMessage, imageLogo;
    imageLogo = "https://res.cloudinary.com/a2karya80559188/image/upload/v1591876980/Logo_02_1_zmqflr.png";
    welcomeMessage = message,
        copyrightMessage = "© Paginazul"
    HTML = `<!DOCTYPE html>
    <html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
      <meta charset="utf-8">
      <meta http-equiv="x-ua-compatible" content="ie=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
      <meta name="x-apple-disable-message-reformatting">
      <title>Confirm Your Email</title>
      <!--[if mso]>
      <xml>
        <o:OfficeDocumentSettings>
          <o:AllowPNG/>
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
      <style>
        table {border-collapse: collapse;}
        .spacer,.divider {mso-line-height-rule:exactly;}
        td,th,div,p,a {font-size: 13px; line-height: 22px;}
        td,th,div,p,a,h1,h2,h3,h4,h5,h6 {font-family:"Segoe UI",Helvetica,Arial,sans-serif;}
      </style>
      <![endif]-->
    <style type="text/css">
        @import url('https://fonts.googleapis.com/css?family=Lato:300,400,700|Open+Sans');
        table {border-collapse:separate;}
          a, a:link, a:visited {text-decoration: none; color: #00788a;} 
          a:hover {text-decoration: underline;}
          h2,h2 a,h2 a:visited,h3,h3 a,h3 a:visited,h4,h5,h6,.t_cht {color:#000 !important;}
          .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td {line-height: 100%;}
          .ExternalClass {width: 100%;}
        @media only screen {
          .col, td, th, div, p {font-family: "Open Sans",-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI","Roboto","Helvetica Neue",Arial,sans-serif;}
          .webfont {font-family: "Lato",-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI","Roboto","Helvetica Neue",Arial,sans-serif;}
        }
    
        img {border: 0; line-height: 100%; vertical-align: middle;}
        #outlook a, .links-inherit-color a {padding: 0; color: inherit;}
    </style>
    </head>
    <body style="box-sizing:border-box;margin:0;padding:0;width:100%;word-break:break-word;-webkit-font-smoothing:antialiased;">
        <div width="100%" style="margin:0; background:#f5f6fa">
            <table cellspacing="0" cellpadding="0" border="0" align="center" width="600" style="margin:0 auto" class="">
                <tbody>
                    <tr style="margin:0;padding:0">
                        <td width="600" height="130" valign="top" class="" style="background-image:url(https://res.cloudinary.com/dnjgq0lig/image/upload/v1546064214/vyymvuxpm6yyoqjhw6qr.jpg);background-repeat:no-repeat;background-position:top center;">
                            <table width="460" height="50" class="" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto">
                                <tbody>
                                </tbody>
                            </table>
                            <table width="460" class="" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto">
                                <tbody>
                                <tr style="margin:0;padding:0">
                                <td style="text-align:center; padding: 10px;">
                                </td>
                            </tr>
                                    <tr bgcolor="#ffffff" style="margin:0;padding:0;text-align:center;background:#ffffff;border-top-left-radius:4px;border-top-right-radius:4px">
                                        <td>
                                            <table width="460" class="" bgcolor="#ffffff" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto;background:#ffffff;border-top-left-radius:4px;border-top-right-radius:4px">
                                                <tbody>
                                                    <tr style="margin:0;padding:0">
                                                        <td bgcolor="#ffffff" height="30" style="text-align:center;background:#ffffff;border-top-left-radius:4px;border-top-right-radius:4px">
                                                        </td>
                                                    </tr>
                                                    <tr style="margin:0;padding:0">
                                                        <td bgcolor="#ffffff" height="100" style="text-align:center;background:#ffffff">
                                                            <img src="https://res.cloudinary.com/dvflctxao/image/upload/v1544705930/wp0z7cswoqigji0whe7n.png" alt="Email register" class="">
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
    
                        </td>
                    </tr>
    
                    <tr>
                        <td>
                            <table width="460" class="" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto">
                                <tbody>
                                    <tr style="margin:0;padding:0">
                                        <td bgcolor="#ffffff" height="20" style="font-size:0;line-height:0;text-align:center;background:#ffffff">
                                        &nbsp;
                                        </td>
                                    </tr>
                                    <tr style="margin:0;padding:0">
                                        <td bgcolor="#ffffff" style="text-align:center;background:#ffffff">
                                            <p style="margin:0;font-family:'Open Sans',Open Sans,Verdana,sans-serif;font-size:26px;line-height:26px;color:#272c73!important;font-weight:600;margin-bottom:20px">${welcomeMessage}</p>
                                        </td>
                                    </tr>
                                    <tr style="margin:0;padding:0">
                                        <td bgcolor="#ffffff" style="font-family:'Open Sans',Open Sans,Verdana,sans-serif;font-size:14px;line-height:1.5;color:#3a4161;text-align:center;font-weight:300">
                                            <p style="margin:0 30px;color:#3a4161"><h4>${sms}</h4></p>
                                        </td>
                                    </tr>
                                    <tr style="margin:0;padding:0">
                                        <td bgcolor="#ffffff" height="30" style="font-size:0;line-height:0;text-align:center;background:#ffffff">
                                        &nbsp;
                                        </td>
                                    </tr>
                                    <tr>
                                    <td align="left" bgcolor="#ffffff" style="font-family:'Open Sans',Open Sans,Verdana,sans-serif;font-size:14px;font-weight:bold;line-height:20px;color:#000; padding:0 20px">
                                    Best regards, <br>
                                        Team Paginazul.
                                    </td>
                                </tr>
                                    <tr style="margin:0;padding:0">
                                        <td bgcolor="#ffffff" style="font-family:'Open Sans',Open Sans,Verdana,sans-serif;font-size:17px;font-weight:bold;line-height:20px;color:#ffffff">
                                            <table cellspacing="0" cellpadding="0" border="0" align="center" style="margin:auto">
                                                <tbody>
                                                    <tr style="margin:0;padding:0">
                                                        <td>
                       
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        </td>
                                    </tr>
                                    <tr style="margin:0;padding:0">
                                        <td height="40" bgcolor="#ffffff" style="background:#ffffff;font-size:0;line-height:0;border-bottom-left-radius:4px;border-bottom-right-radius:4px">
                                            &nbsp;
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                    <tr style="margin:0;padding:0">
                        <td height="30" style="font-size:0;line-height:0;text-align:center">
                        &nbsp;
                        </td>
                    </tr>
                </tbody>
            </table>
            <table cellspacing="0" cellpadding="0" border="0" align="center" width="600" style="margin:auto" class="">
                <tbody>
    
          <tr style="margin:0;padding:0">
                    <td height="20" style="font-size:0;line-height:0">
                        &nbsp;
                    </td>
                </tr>
    
                <tr style="margin:0;padding:0">
                    <td valign="middle" style="width:100%;font-size:13px;text-align:center;color:#aeb2c6!important" class="m_-638414352698265372m_619938522399521914x-gmail-data-detectors">
                        <p style="font-family:'Open Sans',Open Sans,Verdana,sans-serif;line-height:16px;font-size:13px!important;color:#aeb2c6!important;margin:0 30px">${copyrightMessage}. All rights reserved.</p>
                    </td>
                </tr>
                <tr style="margin:0;padding:0">
                    <td height="20" style="font-size:0;line-height:0">
                        &nbsp;
                    </td>
                </tr>
            </tbody></table>
        </div>
    </body>
    </html>`

    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: realEmail,
            pass: realPassword
        }
    })
    var messageObj = {
        from: 'No reply<a2karya8055@gmail.com>',
        to: email,
        subject: subject,
        text: sms,
        html: HTML,

    }
    transporter.sendMail(messageObj, (err, info) => {
        console.log("Error and Info is===========", err, info);
        if (err) {
            console.log("error", err);
        } else if (info) {
            console.log("infor", info)

        }
    })


},

    //* Android Notification With Type

    //===========================================Android notification===========================================//

    exports.sendNotificationForAndroid = (deviceToken, title, body, type, callback) => {

        console.log("Device token is===========>", deviceToken);
        var message = {
            to: deviceToken,
            notification: {
                title: title,
                body: body,
                type: type
            },
            data: {
                title: title,
                message: body,
                type: type
            },
        };
        console.log("Notification===========>", message);
        fcm.send(message, function (err, response) {
            if (err) {
                console.log("Error in sending android notification===========>", err);
                return;
            } else {
                console.log('Android notification send successfully', response);
                return;
            }
        });

    }

//* Send Android Notification By Admin

//==========================================Android notification from admin=================================//

exports.sendNotificationForAndroid1 = (deviceToken, title, body, type, callback) => {

    console.log("Device token is===========>", deviceToken);
    var message = {
        to: deviceToken,
        notification: {
            title: title,
            message: body,
        },
        data: {
            title: title,
            message: body,
            type: type
        },
    };
    console.log("Notification===========>", message);
    fcm.send(message, function (err, response) {
        if (err) {
            console.log("Error in sending android notification===========>", err);
        } else {
            console.log('Android notification send successfully', response);
        }
    });

}

//* Send Ios Notification By Admin

//========================================Ios notification from admin=======================================//

exports.sendiosNotification1 = (deviceToken, title, msg, callback) => {

    console.log("Device token is===========>", deviceToken);
    var options = {
        "cert": "CertificatesDistPushNew.pem",
        "key": "CertificatesDistPushNew.pem",
        // "passphrase": "1234",
        "production": true
    };
    var apnProvider = new apn.Provider(options);
    var note = new apn.Notification();
    note.expiry = Math.floor(Date.now() / 1000) + 3600;
    note.badge = 1;
    note.sound = "default";
    note.alert = {
        title: title,
        body: msg
    }
    note.payload = { title: title, msg: msg };
    note.topic = "com.mobulous.JokerApp";
    apnProvider.send(note, deviceToken).then((result) => {
        console.log("Ios notication1 send successfully is=============>", result);
    })
        .catch((e) => {
            console.log("err in sending ios notification is==================>", e);
        })

};


//* Send Ios Notification For Chat

//========================================Ios notification2=================================================//

exports.sendiosNotification2 = (deviceToken, title, msg, badgeCount, callback) => {

    console.log("Device token is===========>", deviceToken);
    var options = {
        "cert": "User_Production.pem",
        "key": "User_Production.pem",
    //    "passphrase":"1234",
        "production": true
    };
    var apnProvider = new apn.Provider(options);
    var note = new apn.Notification();
    note.expiry = Math.floor(Date.now() / 1000) + 3600;
    note.badge = badgeCount;
    note.sound = "default";
    note.alert = msg;
    note.payload = { title: title, msg: msg, type: 'chat' };
    note.topic = "com.paginzul.app";
    apnProvider.send(note, deviceToken).then((result) => {
        console.log("Ios notication admin send successfully is=============>", result);
    })
        .catch((e) => {
            console.log("err in sending ios notification is==================>", JSON.stringify(e));
        })

};


exports.sendiosNotification2Provider = (deviceToken, title, msg, badgeCount, callback) => {

    console.log("Device token is===========>", deviceToken);
    var options = {
        "cert": "Provider_Production.pem",
        "key": "Provider_Production.pem",
    //    "passphrase":"1234",
        "production": true
    };
    var apnProvider = new apn.Provider(options);
    var note = new apn.Notification();
    note.expiry = Math.floor(Date.now() / 1000) + 3600;
    note.badge = badgeCount;
    note.sound = "default";
    note.alert = msg;
    note.payload = { title: title, msg: msg, type: 'chat' };
    note.topic = "com.paginzulProvider.app";
    apnProvider.send(note, deviceToken).then((result) => {
        console.log("Ios notication admin send successfully is=============>", result);
    })
        .catch((e) => {
            console.log("err in sending ios notification is==================>", JSON.stringify(e));
        })

};

//==========================================Androin NotificationFor Work done===============================//


exports.sendNotificationForAndroidWorkDone = (deviceToken, title, body, type, workerId, orderId, callback) => {

    console.log("Device token is===========>", deviceToken);
    var message = {
        to: deviceToken,
        notification: {
            title: title,
            message: body,
            deliveryUserId: workerId,
            orderId: orderId
        },
        data: {
            title: title,
            message: body,
            type: type,
            deliveryUserId: workerId,
            orderId: orderId
        },
    };
    console.log("Notification===========>", message);
    fcm.send(message, function (err, response) {
        if (err) {
            console.log("Error in sending android notification===========>", err);
        } else {
            console.log('Android notification send successfully', response);
        }
    });

}

//=========================================Work done For Iso================================================//

exports.sendiosNotificationWorkDone = (deviceToken, title, msg, badgeCount, type, obj, callback) => {

    console.log("Device token is===========>", deviceToken);
    var options = {
        "cert": "User_Production.pem",
        "key": "User_Production.pem",
    //    "passphrase":"1234",
        "production": true
    };
    var apnProvider = new apn.Provider(options);
    var note = new apn.Notification();
    note.expiry = Math.floor(Date.now() / 1000) + 3600;
    note.badge = badgeCount;
    note.sound = "default";
    note.alert = msg;
    note.payload = { title: title, msg: msg, type: type, obj: obj };
    note.topic = "com.paginzul.app";
    apnProvider.send(note, deviceToken).then((result) => {
        console.log("Ios notication send successfully is=============>", result);
    })
        .catch((e) => {
            console.log("err in sending ios notification is==================>", e);
        })

};


exports.sendiosNotificationWorkDoneProvider = (deviceToken, title, msg, badgeCount, type, obj, callback) => {

    console.log("Device token is===========>", deviceToken);
    var options = {
        "cert": "Provider_Production.pem",
        "key": "Provider_Production.pem",
    //    "passphrase":"1234",
        "production": true
    };
    var apnProvider = new apn.Provider(options);
    var note = new apn.Notification();
    note.expiry = Math.floor(Date.now() / 1000) + 3600;
    note.badge = badgeCount;
    note.sound = "default";
    note.alert = msg;
    note.payload = { title: title, msg: msg, type: type, obj: obj };
    note.topic = "com.paginzulProvider.app";
    apnProvider.send(note, deviceToken).then((result) => {
        console.log("Ios notication send successfully is=============>", result);
    })
        .catch((e) => {
            console.log("err in sending ios notification is==================>", e);
        })

};