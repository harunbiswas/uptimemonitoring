/*

* Title : project initial file
* Description :  Initial file to start the node server and workers
* Author : Harun Biswas Rubel
* Date : 01/12/ 2021

*/

// Dependincies
const server = require('./lib/server')
const workers = require('./lib/workers')

// app object - module scaffolding

const app = {};


app.init = () => {
    // start the server 
    server.init();

    // start the workers
    workers.init();
}


app.init();


//export the app
module.exports = app;