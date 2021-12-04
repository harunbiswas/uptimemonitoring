/*

* Title : worker livrary 
* Description :  worker related files
* Author : Harun Biswas Rubel
* Date : 01/12/ 2021

*/

// Dependincies
const url = require('url');
const http = require('http')
const https = require('https')
const data = require('./data')
const {parseJSON} = require('../helpers/utilities');
const {sendTwilioSms} = require('../helpers/notification')

// app object - module scaffolding

const worker = {};

// lookup all the checks 
worker.gatherAllChecks = () => {
    // get all the checks
    data.list('checks', (err, checks) => {
        if(!err && checks && checks.length > 0) {
            checks.forEach(check => {
                // read the checkDate
                data.read('checks', check, (err1, originalCheckData) => {
                    if(!err1 && originalCheckData){
                        // pass the the data to the check validator
                        worker.validateCheckData(parseJSON(originalCheckData))
                    }else  {
                        console.log("error: Could not found check")
                    }
                })
            });
        }else {
            console.log('Error : coult not find any checks to process!');
        }
    })

} 


// validate chaek data
worker.validateCheckData = (originalCheckData) => {
    let originalData = originalCheckData;
    if(originalCheckData && originalCheckData.id) {
        originalData.state = typeof(originalCheckData.state) === 'string' && ['up', 'down'].indexOf(originalCheckData.state) > -1 ? originalCheckData.state : 'down';
        
        originalData.lastCheck = typeof(originalCheckData.lastCheck) === 'string' && originalCheckData.lastCheck > 0 ? originalCheckData.lastCheck : false;

        // pass to the next process 
        worker.performcheck(originalData);
    }else {
        console.log("Error: check was invalid or not properly formatteed")
    }
}


// perform check
worker.performcheck =(originalCheckData) => {
    // prepare the initial check outcome
    let checkOutCome = {
        error: false,
        responseCode: false,
    }
    // mark the outcome has not been sent yet
    let outcomeSent = false;
    // parse the hostname and full url from original data
    let parseUrl = url.parse(`${originalCheckData.protocol}://${originalCheckData.url}`, true);
    let hostname = parseUrl.hostname;
    let {path }= parseUrl.path;

    // construct the request 
    const requsetDetails = {
        'protocol' : `${originalCheckData.protocol}:`,
        hostname,
        'methed': originalCheckData.method.toUpperCase(),
        path,
        'timeout': originalCheckData.timeOutSecouds * 1000,
    }

   


const protocolToUse = originalCheckData.protocol=== 'http' ? http : https;


let req = protocolToUse.request(requsetDetails, (res) => {
    // frob the status of the rewponse
    const status = res.statusCode;
    // update the check outcome and pass to the next process
    checkOutCome.responseCode = status;

    if(!outcomeSent){
        worker.processCheckOutcome(originalCheckData, checkOutCome);
        outcomeSent = true;
    }

});
    req.on('error', (e) => {

        checkOutCome = {
           ' error': true,
            'value': e,
        };
        // update the check outcome and pass to the next process
        
        if(!outcomeSent){
            worker.processCheckOutcome(originalCheckData, checkOutCome);
            outcomeSent = true;
        }
    });

    req.on('timeout', () => {
        checkOutCome = {
            error: true,
             value: 'timeout',
         };
        // update the check outcome and pass to the next process
        if(!outcomeSent){
            worker.processCheckOutcome(originalCheckData, checkOutCome);
            outcomeSent = true;
        }
    });

    // req send
    req.end();
};


worker.processCheckOutcome = (originalCheckData, checkOutCome) => {
    // check if check out come is up or down
    let state = !checkOutCome.error && checkOutCome.responseCode && originalCheckData.successCode.indexOf(checkOutCome.responseCode) > -1? 'up': 'down';

    // decide whether we should alert the user or not 
    const alertWanted = !!(originalCheckData.lastCheck && originalCheckData.state !== state)


    // update the check data
    let newCheckData = originalCheckData;
    newCheckData.state = state;
    newCheckData.lastCheck = Date.now();

    // update the check to disk
    data.update('checks', newCheckData.id, newCheckData, (err) => {
        if(!err) {
            if(alertWanted) {
                worker.alertUserToStatusChange(newCheckData);
            }else {
                console.log('alert is not needed as no state change')
            }
        }else {
            console.log('error: trying to save of one of the checks')
        }
    })
}

// send  notification sms to user if state change
worker.alertUserToStatusChange = (newCheckData) => {
    let msg = `alert: your check fot ${newCheckData.method.toUpperCase()} ${newCheckData.protocol}://${newCheckData.url} is currently ${newCheckData.state}`;

    sendTwilioSms(newCheckData.userPhene, msg, (err) => {
        if(!err) {
            console.log(`user was alerted to a status change via sms: ${msg}`)
        }else {
            console.log('there was a problem sending sms to one of the user')
        }
    })

}


// timer to execute the worker prosecc once per minute
worker.loop = () => {
    setInterval(() => {
        worker.gatherAllChecks();
    }, 8000);
}


// start the worter
worker.init = () => {
    // excute all the checks
    worker.gatherAllChecks();

    // call the loop so that checks continue
    worker.loop();
}


// export
module.exports = worker;