/*

* Title : token handler
* Description :  Token handler
* Author : Harun Biswas Rubel
* Date : 03/12/ 2021

*/

// Dependencies
const data = require('../../lib/data');
const {hash, createRandomString, parseJSON} = require('../../helpers/utilities')

// module scaffolding
const handler = {};
handler.tokenHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];

    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._token[requestProperties.method](requestProperties, callback);
    } else {
        callback(405);
    }
};

handler._token = {};

// post request
handler._token.post = (requestProperties, callback) => {
    const phone = typeof requestProperties.body.phone === 'string'&&
    requestProperties.body.phone.trim().length === 11 ? requestProperties.body.phone : false;
    const password = typeof requestProperties.body.password === 'string'&&
    requestProperties.body.phone.trim().length >= 4 ? requestProperties.body.password : false;

    if(phone && password) {
        data.read('users', phone, (err, userData) => {
            let hashedPassword = hash(password);
            if(!err && hashedPassword ===parseJSON(userData).password){
                let tokenId = createRandomString(20);
                let expires = Date.now() + 60 * 60 *1000;
                let tokenObject = {
                    phone, 
                    'id': tokenId,
                    expires,
                }

                // store the token
                data.create('tokens', tokenId, tokenObject, (err1) => {
                    if(!err1){
                        callback(200, tokenObject)
                    }else {
                        callback(500, {
                            error: "Token could not created!"
                        })
                    }
                })
            }else {
                callback(500, {
                    error: "user password is not valid!"
                })
            }
        })
    }else {
        callback(400, {
            error: "You have problems in your request!"
        })
    }
};
// get request
handler._token.get = (requestProperties, callback) => {
    // check the idnumber is valid
    const id = typeof requestProperties.queryStringObject.id === 'string'&&
    requestProperties.queryStringObject.id.trim().length === 20
        ? requestProperties.queryStringObject.id
        : false;

    if (id) {
        // lookup the teken
        data.read('tokens', id, (err, tokenData) => {
            const token = { ...parseJSON(tokenData) };
            if (!err && token) {
                callback(200, token);
            } else {
                callback(404, {
                    error: 'token read unable!',
                });
            }
        });
    } else {
        callback(404, {
            error: 'token could not found! ',
        });
    }
};
 // update request
handler._token.put = (requestProperties, callback) => {
    const id = typeof requestProperties.body.id === 'string'&&
    requestProperties.body.id.trim().length === 20 ? requestProperties.body.id : false;

    const extend = typeof requestProperties.body.extend === 'boolean'&&
    requestProperties.body.extend === true ? true : false;
    

    if(id && extend){
        data.read('tokens', id, (err, tokenData) => {
            let tokenObject = parseJSON(tokenData)
            if(!err && tokenObject.expires > Date.now()){
                tokenObject.expires = Date.now() + 60 * 60 * 1000;
                // store the updated token
                data.update('tokens', id, tokenObject, (err1) => {
                    if(!err1) {
                        callback(200)
                    }else {
                        callback(500, {
                            error: 'There was a server side error!'
                        })
                    }
                })
            }else {
                callback(400, {
                    error: 'token already expired!'
                })
            }
        })
    }else {
        callback(400, {
            error: 'There was a problem in your request!'
        })
    }
};
// delete request
handler._token.delete = (requestProperties, callback) => {
    const id =        typeof requestProperties.body.id === 'string' &&
    requestProperties.body.id.trim().length === 20
        ? requestProperties.body.id
        : false;
    if(id) {
        // lookup the user
        data.read('tokens', id, (err, tokenData) =>{
            if(!err && tokenData){
                data.delete('tokens', id,(err1) => {
                    if(!err1){
                        callback(200, {
                            message: "logout was successfully deleted!"
                        })
                        }else {
                            callback(500,{
                                error: "token not deleted!"
                            })
                    }
                })
            }else{
                callback(500, {
                    error: "tokens not fund!"
                })
            }
        })
    }else{
        callback(400, {
            error: "there was a problem in your request!"
        })
    }
};


handler._token.verify = (id, phone, callback) => {
    data.read('tokens', id, (err, tokenData) => {
        if(!err && tokenData) {
            if(parseJSON(tokenData).phone === phone && parseJSON(tokenData).expires > Date.now()) {
                callback(true);
            }else {
                callback(false)
            }
        }else {
            callback(false)
        }
    })
}

module.exports = handler;
