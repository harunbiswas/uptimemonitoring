/*

* Title : notification library
* Description : inportant functions to notity users
* Author : Harun Biswas Rubel
* Date : 04/12/ 2021

*/

// Dependencies
const https = require('https');
const querystring = require('querystring');
const { twilio } = require('./environments');

// module scaffholding
const notification = {};
// send sms to user using twilio api

notification.sendTwilioSms = (phone, msg, callback) => {
    // input validation
    const userPhone =        typeof phone === 'string' && phone.trim().length === 11 ? phone.trim() : false;

    const userMsg =
        typeof msg === 'string' && msg.trim().length > 0 && msg.trim().length < 1600 ? msg : false;

    if (userPhone && userMsg) {
        // configure the requset payload
        const payload = {
            From: twilio.fromPhone,
            To: `+88${userPhone}`,
            Body: userMsg,
        };

        // querystring payload
        const stringifyPayload = querystring.stringify(payload);

        // configure the requset defaultMaxListeners
        const requsetDetails = {
            hostname: 'api.twilio.com',
            method: 'POST',
            path: `/2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
            auth: `${twilio.accountSid}: ${twilio.authToken}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        };

        // instantiate the request object;
        const req = https.request(requsetDetails, (res) => {
            // get the status of the sent request
            const status = res.statusCode;
            // callback successfully if the requset went through
            if (status === 200 || status === 201) {
                callback(false);
            } else {
                callback(`status code returned was ${status}`);
            }
        });

        req.on('error', (e) => {
            callback(e);
        });

        req.write(stringifyPayload);
        req.end();
    } else {
        callback('paramiter were missing or invalid');
    }
};

// exports the module
module.exports = notification;
