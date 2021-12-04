/*

* Title : User handler
* Description :  user handler
* Author : Harun Biswas Rubel
* Date : 01/12/ 2021

*/

// Dependencies
const data = require('../../lib/data');
const { hash } = require('../../helpers/utilities');
const { parseJSON } = require('../../helpers/utilities');
const tokenHandelar = require('./tokenHandelar')
// module scaffolding
const handler = {};

handler.userHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];

    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._users[requestProperties.method](requestProperties, callback);
    } else {
        callback(405);
    }
};

handler._users = {};

// post request
handler._users.post = (requestProperties, callback) => {
    const firstName =
        typeof requestProperties.body.firstName === 'string'
        && requestProperties.body.firstName.trim().length > 0
            ? requestProperties.body.firstName
            : false;

    const lastName = typeof requestProperties.body.lastName === 'string'&&
    requestProperties.body.lastName.trim().length > 0 ? requestProperties.body.lastName : false;

    const phone =        typeof requestProperties.body.phone === 'string' &&
        requestProperties.body.phone.trim().length === 11
            ? requestProperties.body.phone
            : false;

    const tosAgreement = typeof requestProperties.body.tosAgreement === 'boolean'&&
    requestProperties.body.tosAgreement === true ? requestProperties.body.tosAgreement : false;

    const password = typeof requestProperties.body.password === 'string'&&
    requestProperties.body.phone.trim().length >= 4 ? requestProperties.body.password : false;

    if (firstName && lastName && phone && password && tosAgreement) {
        // make sure that the user doesn't already exists!
        data.read('users', phone, (err) => {
            if (err) {
                const userObtect = {
                    firstName,
                    lastName,
                    phone,
                    tosAgreement,
                    password: hash(password),
                };

                // store the user to db
                data.create('users', phone, userObtect, (err1) => {
                    if (!err1) {
                        callback(200, {
                            message: 'user was create successfully!',
                        });
                    } else {
                        callback(500, {
                            error: 'could not create user!',
                        });
                    }
                });
            } else {
                callback(500, {
                    error: 'there was a problem in server side!',
                });
            }
        });
    } else {
        callback(400, {
            error: 'You have a problem in your request',
        });
    }
};
// get request
handler._users.get = (requestProperties, callback) => {
    // check the phone number is valid
    const phone = typeof requestProperties.queryStringObject.phone === 'string'&&
    requestProperties.queryStringObject.phone.trim().length === 11
        ? requestProperties.queryStringObject.phone
        : false;

    if (phone) {
        // verify token
        let token = typeof(requestProperties.headersObject.token) ==='string' ? requestProperties.headersObject.token : false;

        if(token) {
            tokenHandelar._token.verify(token, phone, (tokenId) => {
                if(tokenId){
                    // lookup the user
            data.read('users', phone, (err, u) => {
                const user = { ...parseJSON(u) };
                if (!err && user) {
                    delete user.password;
                    callback(200, user);
                } else {
                    callback(404, {
                        error: 'user read unable!',
                    });
                }
            });
                }else {
                    callback(403, {
                        error: 'Authentication failure!'
                    })
                }
            })
            
        } else {
            callback(404, {
                error: 'user could not found! ',
            });
        }
    }else {
        callback(400, {
            message: "Thare was a problem in your request!"
        })
        }
        
};


// update request
handler._users.put = (requestProperties, callback) => {
    const firstName =
        typeof requestProperties.body.firstName === 'string'
        && requestProperties.body.firstName.trim().length > 0
            ? requestProperties.body.firstName
            : false;

    const lastName = typeof requestProperties.body.lastName === 'string'&&
    requestProperties.body.lastName.trim().length > 0 ? requestProperties.body.lastName : false;

    const phone =        typeof requestProperties.body.phone === 'string' &&
        requestProperties.body.phone.trim().length === 11
            ? requestProperties.body.phone
            : false;


    const password = typeof requestProperties.body.password === 'string'&&
    requestProperties.body.phone.trim().length >= 4 ? requestProperties.body.password : false;






    if(phone){
        if(firstName || lastName|| password) {
            // verify token
            let token = typeof(requestProperties.headersObject.token) ==='string' ? requestProperties.headersObject.token : false;

            if(token) {
                tokenHandelar._token.verify(token, phone, (tokenId) => {
                    if(tokenId){
                        // lookup the user
                        data.read('users', phone, (err, uData) => {
                            const userData = { ...parseJSON(uData)};
                            if(!err && userData) {
                                if(firstName) {
                                    userData.firstName = firstName;
                                }
                                if(lastName) {
                                    userData.lastName = lastName;
                                }
                                if(password) {
                                    userData.password = hash(password);
                                }

                                // update to db
                                data.update('users', phone, userData,(err1) => {
                                    if(!err1) {
                                        callback(200, {
                                            message: "update successfully!"
                                        })
                                    }else {
                                        callback(500, {
                                            error: "there is a server side problem!"
                                        })
                                    }
                                })
                            }else{
                                callback(500, {
                                    error: "There was a server site problem!"
                                })
                            }
                        })
                    }else{
                        callback(400, {
                            error: 'invalid information'
                            })
                        } 
                })     
            }else {
                callback(403, {
                    error: 'Authentication failure!'
                })
            }
        }else {
            callback(400, {
                error: 'There was a problem in your request!'
            })
        }      
    }else{
        callback(400, {
            error: 'invalid phone number'
        })
    }
};


// delete request
handler._users.delete = (requestProperties, callback) => {
    const phone =        typeof requestProperties.body.phone === 'string' &&
    requestProperties.body.phone.trim().length === 11
        ? requestProperties.body.phone
        : false;

    if(phone) {

         // verify token
         let token = typeof(requestProperties.headersObject.token) ==='string' ? requestProperties.headersObject.token : false;

         if(token) {
             tokenHandelar._token.verify(token, phone, (tokenId) => {
                 if(tokenId){
                     // lookup the user
                    data.read('users', phone, (err, user) =>{
                        if(!err && user){
                            data.delete('users', phone,(err1) => {
                                if(!err1){
                                    callback(200, {
                                        message: "user was successfully deleted!"
                                    })
                                    }else {
                                        callback(500,{
                                            error: "user not deleted!"
                                        })
                                }
                            })
                        }else{
                            callback(500, {
                                error: "user not fund!"
                            })
                        }
                    })
                }else{
                    callback(400, {
                        error: "there was a problem in your request!"
                    })
                }
            })
                     
        }else {
            callback(403, {
                error: 'Authentication failure!'
            })
        }
    }else {
        callback(400, {
            error: 'phone number unvalid!'
        })
    }
        
};

module.exports = handler;
