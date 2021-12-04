/*

* Title : Routes
* Description :  application's routes
* Author : Harun Biswas Rubel
* Date : 01/12/ 2021

*/

// Dependencies
const { sampleHandler } = require('./handlers/routeHandlers/sampleHandler');
const { userHandler } = require('./handlers/routeHandlers/userHandler');
const { tokenHandler } = require('./handlers/routeHandlers/tokenHandelar');
const { checkHandler } = require('./handlers/routeHandlers/checkHandler');

// module scaffholding
const routes = {
    sample: sampleHandler,
    user: userHandler,
    token: tokenHandler,
    check: checkHandler,
};
module.exports = routes;
