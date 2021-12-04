/*

* Title : check handler
* Description :  handle user defind checked
* Author : Harun Biswas Rubel
* Date : 04/12/ 2021

*/

// Dependencies
const data = require('../../lib/data');
const { hash } = require('../../helpers/utilities');
const { parseJSON, createRandomString } = require('../../helpers/utilities');
const tokenHandelar = require('./tokenHandelar');
const tokenHandler  = require('./tokenHandelar');
const {maxChecks} = require('../../helpers/environments');
const { user } = require('../../routes');
// module scaffolding
const handler = {};

handler.checkHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];

    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._check[requestProperties.method](requestProperties, callback);
    } else {
        callback(405);
    }
};

handler._check = {};

// post request
handler._check.post = (requestProperties, callback) => {
    // validate inputs
    let protocol = typeof(requestProperties.body.protocol) === 'string' && ['http', 'https'].indexOf(requestProperties.body.protocol) > -1 ? requestProperties.body.protocol : false;

    let url = typeof(requestProperties.body.url) === 'string' && requestProperties.body.url.trim().length > 0 ? requestProperties.body.url : false;

    let method = typeof(requestProperties.body.method) === 'string' && ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1  ? requestProperties.body.method : false;

    let successCode = typeof(requestProperties.body.successCode) === 'object' && requestProperties.body.successCode instanceof Array ? requestProperties.body.successCode : false;

    let timeOutSecouds = typeof requestProperties.body.timeOutSecouds === 'number' && requestProperties.body.timeOutSecouds % 1 === 0 && requestProperties.body.timeOutSecouds >= 1 && requestProperties.body.timeOutSecouds <= 5? requestProperties.body.timeOutSecouds : false

    if(protocol && url && method && successCode && timeOutSecouds){
        const token = typeof(requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token: false;

        // lookup the user phone by reading the token
        data.read('tokens', token, (err, tokenData) => {
            if(!err && tokenData) {
                let userPhone = parseJSON(tokenData).phone;
                //lookup the user data
                data.read('users', userPhone, (err1, userData) => {
                    if(!err1 && userData){
                        tokenHandler._token.verify(token, userPhone, (tokenIsValid) => {
                            if(tokenIsValid){
                                let userObtect = parseJSON(userData);
                                let userChecks = typeof(userObtect.checks) === 'object' && userObtect.checks instanceof Array ? userObtect.checks : [];

                                if(userChecks.length < maxChecks){
                                    let checkId = createRandomString(20);
                                    let checkObject = {
                                        'id': checkId,
                                        userPhone,
                                        protocol,
                                        url,
                                        method,
                                        successCode,
                                        timeOutSecouds,
                                    }

                                    // save the object
                                    data.create('checks', checkId, checkObject, (err2) => {
                                        if(!err2){
                                            // add check id to the user's object
                                            userObtect.checks = userChecks;
                                            userObtect.checks.push(checkId);

                                            // save the new user data
                                            data.update('users', userPhone, userObtect, (err3) => {
                                                if(!err3){
                                                    // return the data obout the new check
                                                    callback(200, checkObject)
                                                }else{
                                                    callback(500, {
                                                        error: 'There was a server side error!'
                                                    })
                                                }
                                            })
                                        }else {
                                            callback(500, {
                                                error: "check could not saved!"
                                            })
                                        }
                                    })
                                }else{
                                    callback(401, {
                                        error: "users already reached max limit!"
                                    })
                                }
                            }else{
                                callback(403, {
                                    error: "token not valid!"
                                })
                            }
                        })
                    }else {
                        callback(403, {
                            error: 'user not found'
                        })
                    }
                })
            }else {
                callback(403, {
                    error: 'authentication problems'
                })
            }
        })
    }else {
        callback(400, {
            error: "you have a problem in your request!"
        })
    }
};
// get request
handler._check.get = (requestProperties, callback) => {
    const id = typeof(requestProperties.queryStringObject.id) === 'string' && requestProperties.queryStringObject.id.trim().length === 20 ? requestProperties.queryStringObject.id : false;

    if(id){
        // lookup the eheck
        data.read('checks', id, (err, checkData) => {
            if(!err && checkData){
                const token = typeof(requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token: false;
                tokenHandler._token.verify(token, parseJSON(checkData).userPhone, (tokenIsValid) => {
                    if(tokenIsValid){
                        callback(200, parseJSON(checkData))
                    }else {
                        callback(403, {
                            error: "Authentication problems!"
                        })
                    }
                })

            }else{
                callback(500, {
                    error: "check not found!"
                })
            }
        })
    }else {
        callback(400, {
            error: "You have a problem in your request!"
        })
    }
};


// update request
handler._check.put = (requestProperties, callback) => {
     // validate inputs
     let protocol = typeof(requestProperties.body.protocol) === 'string' && ['http', 'https'].indexOf(requestProperties.body.protocol) > -1 ? requestProperties.body.protocol : false;

     let url = typeof(requestProperties.body.url) === 'string' && requestProperties.body.url.trim().length > 0 ? requestProperties.body.url : false;
 
     let method = typeof(requestProperties.body.method) === 'string' && ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1  ? requestProperties.body.method : false;
 
     let successCode = typeof(requestProperties.body.successCode) === 'object' && requestProperties.body.successCode instanceof Array ? requestProperties.body.successCode : false;
 
     let timeOutSecouds = typeof requestProperties.body.timeOutSecouds === 'number' && requestProperties.body.timeOutSecouds % 1 === 0 && requestProperties.body.timeOutSecouds >= 1 && requestProperties.body.timeOutSecouds <= 5? requestProperties.body.timeOutSecouds : false

    const id = typeof(requestProperties.body.id) === 'string' && requestProperties.body.id.trim().length === 20 ? requestProperties.body.id : false;


    if(id){
        if(protocol || url || method || successCode || timeOutSecouds){
            data.read('checks', id, (err, checkData) => {
                if(!err && checkData){
                    let checkObject = parseJSON(checkData);

                    const token = typeof(requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token: false;
                tokenHandler._token.verify(token, checkObject.userPhone, (tokenIsValid) => {
                    if(tokenIsValid){
                        if(protocol) {
                            checkObject.protocol = protocol;
                        }
                        if(url) {
                            checkObject.url = url;
                        }
                        if(method) {
                            checkObject.method = method;
                        }
                        if(successCode) {
                            checkObject.successCode = successCode;
                        }
                        if(timeOutSecouds) {
                            checkObject.timeOutSecouds = timeOutSecouds;
                        }

                        // store the check checkObject
                        data.update('checks', id, checkObject, (err1) => {
                            if(!err1){
                                callback(200, checkObject)
                            }else{
                                callback(500, {
                                    error: 'There was a serber site error!'
                                })
                            }
                        })
                    }else {
                        callback(403, {
                            error: 'Authontication faluer!'
                        })
                    }
                })
                }else {
                    callback(500, {
                        error: 'There was a problem in server side!'
                    })
                }
            })
        }else {
            callback(400, {
                error: "There was a problem in your request!"
            })
        }
    }else{
        callback(400, {
            error: 'check could not found!'
        })
    }

};


// delete request
handler._check.delete = (requestProperties, callback) => {
    const id = typeof(requestProperties.queryStringObject.id) === 'string' && requestProperties.queryStringObject.id.trim().length === 20 ? requestProperties.queryStringObject.id : false;

    if(id){
        // lookup the eheck
        data.read('checks', id, (err, checkData) => {
            if(!err && checkData){
                const token = typeof(requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token: false;
                tokenHandler._token.verify(token, parseJSON(checkData).userPhone, (tokenIsValid) => {
                    if(tokenIsValid){
                        // delete the cheake data
                        data.delete('checks', id, (err1) => {
                            if(!err1){
                                data.read('users', parseJSON(checkData).userPhone, (err2, userData) => {
                                    if(!err2 && userData){
                                        let userObtect = parseJSON(userData);
                                        let userChecks = typeof(userObtect.checks) === 'object' && userObtect.checks instanceof Array ?userObtect.checks : [];

                                        // remove the deleted checks id form user list of checks;
                                        let checkPossition = userChecks.indexOf(id);
                                        if(checkPossition > -1) {
                                            userChecks.splice(checkPossition, 1);
                                            // resave the user data
                                            userObtect.checks = userChecks;

                                            data.update('users', userObtect.phone, userObtect, (err3) => {
                                                if(!err3){
                                                    callback(200, {
                                                        message: "user Deleted successfully!"
                                                    })
                                                }else{
                                                    callback(500, {
                                                        error: "server side error!"
                                                    })
                                                }
                                            })
                                        }else {
                                            callback(500, {
                                                error: "check id not found!"
                                            })
                                        }
                                    }else{
                                        callback(500, {
                                            error: "there was a author essos"
                                        })
                                    }
                                })
                            }else {
                                callback(500, {
                                    error: "There was a problem in server side error"
                                })
                            }
                        })
                    }else {
                        callback(403, {
                            error: "Authentication problems!"
                        })
                    }
                })

            }else{
                callback(500, {
                    error: "check not found!"
                })
            }
        })
    }else {
        callback(400, {
            error: "You have a problem in your request!"
        })
    }
};

module.exports = handler;
