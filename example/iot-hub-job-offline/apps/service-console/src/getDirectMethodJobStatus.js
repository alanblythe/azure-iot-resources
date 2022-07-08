var getDeviceJobStatus = function () {
    
    var genSasTokenForOwner = require('./genSasTokenForOwner.js')
    var token = genSasTokenForOwner(1440);
    var jobId = process.env.METHOD_JOB_ID;

    console.log(jobId);

    const https = require('https');

    var hostname = process.env.IOTHUB_NAME + '.azure-devices.net';

    const options = {
        hostname: hostname,
        path: "/devices/query?api-version=2020-05-31-preview",
        port: "443",
        method: "POST",
        body: '{ "query": "SELECT * FROM devices.jobs WHERE devices.jobs.jobId = \'' + jobId + '\'" }',
        headers : {
            'Authorization': token
        }
    };

    process.on('uncaughtException', function (err) {
//        console.log(err);
    }); 
    
    const request = https.request(options, (response) => {
        console.log(response.code);
        console.log(response.message);
        // response from server
    });

    request.on('error', (error) => {
        console.log('Error Code: ' + error.code);
        console.log('Error Message: ' + error.message);
    });
    
    request.end();
};

getDeviceJobStatus();

