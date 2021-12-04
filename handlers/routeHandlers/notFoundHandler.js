/*

* Title : Not found handler
* Description : 404 not found  handler
* Author : Harun Biswas Rubel
* Date : 01/12/ 2021

*/

// Dependencies
// module scaffolding
const handler = {};

handler.notFoundHandler = (requestProperties, callback) => {
    console.log('404(Not found))');
    callback(404, {
        message: 'page not found',
    });
};

module.exports = handler;
