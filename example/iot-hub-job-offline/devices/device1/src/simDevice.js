'use strict';

var Client = require('azure-iot-device').Client;
var Protocol = require('azure-iot-device-mqtt').Mqtt;
var connectionString = 'HostName=iot-joboffline-dev.azure-devices.net;DeviceId=device1;SharedAccessKey=sqpDRD+1JYoR32BqJS3l3jbnF/6zBCE3VNRk9cObKIM=';
var client = Client.fromConnectionString(connectionString, Protocol);

var onLockDoor = function(request, response) {

    // Respond the cloud app for the direct method
    response.send(200, function(err) {
        if (err) {
            console.error('An error occurred when sending a method response:\n' + err.toString());
        } else {
            console.log('Response to method \'' + request.methodName + '\' sent successfully.');
        }
    });

    console.log('Locking Door!');
};

client.open(function(err) {
    if (err) {
        console.error('Could not connect to IotHub client.');
    }  else {
        console.log('Client connected to IoT Hub. Register handler for lockDoor direct method.');
        client.onDeviceMethod('lockDoor', onLockDoor);
    }
});

