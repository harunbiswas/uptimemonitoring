/*

* Title : Sample handler
* Description :  sample handler
* Author : Harun Biswas Rubel
* Date : 01/12/ 2021

*/

// Dependencies
// module scaffolding
const handler = {};

handler.sampleHandler = (requestProperties, callback) => {
    console.log(requestProperties);
    callback(200, {
        message: 'Sample Handler',
    });
};

module.exports = handler;
