/*

* Title : utilites
* Description :  Importants utilites
* Author : Harun Biswas Rubel
* Date : 01/12/ 2021

*/
// dependincies
const crypto = require('crypto');
const environments = require('./environments');

// module scaffolding
const utilities = {};

// hashing string
utilities.hash = (str) => {
    if (typeof str === 'string' && str.length > 0) {
        const hash = crypto.createHmac('sha256', environments.secretKey).update(str).digest('hex');
        return hash;
    }
    return false;
};
// parse JSON string to object
utilities.parseJSON = (jsonString) => {
    let output;

    try {
        output = JSON.parse(jsonString);
    } catch {
        output = {};
    }
    return output;
};

// create a random string 

utilities.createRandomString = (strlength) => {
    let length = typeof(strlength) === 'number' && strlength > 0 ? strlength : false;

    if(length){
        let possibleCharacters = 'abcdefghijklmnopqrstuvwxyz1234567890';
        let output = '';
        for(let i = 1; i <= length; i++) {
            let randomNumber = Math.floor(Math.random() * possibleCharacters.length);
            let randomCharacters = possibleCharacters.charAt(randomNumber);

            output += randomCharacters;
        }
        return output;
    }else {
        return false;
    }
};

// export module
module.exports = utilities;
