'use strict';

var uuid = require('uuid');
var JobClient = require('azure-iothub').JobClient;

var hubName = process.env.IOTHUB_NAME;
var ownerSasKey = process.env.IOTHUBOWNER_SAS_KEY;

var connectionString = 'HostName=' + hubName + '.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=' + ownerSasKey;
console.log(connectionString);

var queryCondition = "deviceId IN ['device1','device2']";
var startTime = new Date();
var maxExecutionTimeInSeconds =  86400;
//var maxExecutionTimeInSeconds =  2592000;
var jobClient = JobClient.fromConnectionString(connectionString);

function monitorJob (jobId, callback) {
    var jobMonitorInterval = setInterval(function() {
        jobClient.getJob(jobId, function(err, result) {
        if (err) {
            console.error('Could not get job status: ' + err.message);
        } else {
            console.log('Job: ' + jobId + ' - status: ' + result.status);
            if (result.status === 'completed' || result.status === 'failed' || result.status === 'cancelled') {
            clearInterval(jobMonitorInterval);
            callback(null, result);
            }
        }
        });
    }, 5000);
}

var methodParams = {
    methodName: 'lockDoor',
    payload: null,
    responseTimeoutInSeconds: 15 // Timeout after 15 seconds if device is unable to process method
};

var methodJobId = uuid.v4();
process.env.METHOD_JOB_ID = methodJobId;
console.log('scheduling Device Method job with id: ' + methodJobId);
jobClient.scheduleDeviceMethod(methodJobId,
                            queryCondition,
                            methodParams,
                            startTime,
                            maxExecutionTimeInSeconds,
                            function(err) {
    if (err) {
        console.error('Could not schedule device method job: ' + err.message);
    } else {
        monitorJob(methodJobId, function(err, result) {
            if (err) {
                console.error('Could not monitor device method job: ' + err.message);
            } else {
                console.log(JSON.stringify(result, null, 2));
            }
        });
    }
});

var twinPatch = {
    etag: '*',
    properties: {
        desired: {
            building: '43',
            floor: 3
        }
    }
 };
 
 var twinJobId = uuid.v4();
 
 console.log('scheduling Twin Update job with id: ' + twinJobId);
 jobClient.scheduleTwinUpdate(twinJobId,
                             queryCondition,
                             twinPatch,
                             startTime,
                             maxExecutionTimeInSeconds,
                             function(err) {
     if (err) {
         console.error('Could not schedule twin update job: ' + err.message);
     } else {
         monitorJob(twinJobId, function(err, result) {
             if (err) {
                 console.error('Could not monitor twin update job: ' + err.message);
             } else {
                 console.log(JSON.stringify(result, null, 2));
             }
         });
     }
 });
 