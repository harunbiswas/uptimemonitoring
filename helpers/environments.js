/*

* Title : Environments
* Description :  handle all environment related things
* Author : Harun Biswas Rubel
* Date : 01/12/ 2021

*/
// dependencies

const environments = {};

environments.staging = {
    port: 3000,
    envName: 'staging',
    secretKey: 'klajsdlkfjlkjshdalkfjladkfj',
    maxChecks: 5,
    twilio: {
        fromPhone: '+14235613557',
        accountSid: 'AC488c003a7e400f9c77aa10205adb8ec7',
        authToken: 'ab486f02052fd98df4d3b01cec61266e',
    },
};

environments.production = {
    port: 4000,
    envName: 'production',
    secretKey: 'kfdjklajsfjhfdlkjadifjhkjfnhadfjadjfdf',
    maxChecks: 5,
    twilio: {
        fromPhone: '01770201232',
        accountSid: 'AC488c003a7e400f9c77aa10205adb8ec7',
        authToken: 'ab486f02052fd98df4d3b01cec61266e',
    },
};

// determine whice enviroment was passed

const currentEnvironment =    typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'staging';

// export corresponding environment objece

const environmentToExport =
    typeof environments[currentEnvironment] === 'object'
        ? environments[currentEnvironment]
        : environments.staging;
// export module
module.exports = environmentToExport;
