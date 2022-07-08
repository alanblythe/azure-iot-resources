
This exercise was modeled after the following article  
[https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-node-node-schedule-jobs](https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-node-node-schedule-jobs)  

Updated 7/8/2022.
Note as of this writing this sample is incomplete and will require some troubleshooting to get working fully.

# Working the PoC
## Steps

  1. Login to the Azure CLI
  ```bash
  az login --use-device-code
  ```
  Get the code given and follow the flow from https://login.microsoftonline.com/organizations/oauth2/v2.0/authorize  
  2. Set the active subscription
  ```bash
  az account set -s "SUBID"
  ```
  3. Create a resource group
  ```bash
  az group create -l eastus -n rg-jobofflinedevice
  ```
  4. Create a deployment to deploy the Azure resources
  ```bash
  az deployment group create -g rg-jobofflinedevice --template-file deploy/main.bicep --parameters deploy/main.parameters.json
  ```
  5. Create two devices
  ```bash
  az iot hub device-identity create -n {iothub_name} -d device1  
  e.g. az iot hub device-identity create -n iot-joboffline-dev -d device1  

  az iot hub device-identity create -n {iothub_name} -d device2
  ```
  6. Update docker-compose.yml
     1. update the DEVICE_CONNECTIONSTRING for device1 and device2 
     2. update the IOTHUBOWNER_CONNECTIONSTRING for service-console. On the Azure Portal find the Shared Access Policies sections and grab the primary connection string from the iothubowner policy.
  7. Bring up the 3 containers, two devices, one service console  
  In VSCode open the terminal and run the following command
```bash
docker-compose -f docker-compose.yml up -d
```
  8. Exec into the service-console container
```bash
docker exec -it service-console /bin/bash
```
  9. Once exec'ed in you should be in the /src directory, run the following command
  ```
  node genSasTokenForOwner.js 1440
  ```
  10. The previous command will generate a shared access signature you can use in Postman 
  11. Run the following script to create two IoT Hub jobs, one twin update job, and one direct method job
      ```
      node scheduleJobService.js
      ```
  12. The previous command submits two jobs, one for twin update and one for calling a direct method. Make sure you update the command with your IoT Hub URL and iothubowner primary sas token
  13.  Use the postman collection, located at `example/iot-hub-job-offline/postman/Azure IoT Hub Jobs.postman_collection.json` to query the jobs devices. Use the `Query Devices` API. Be sure to:
  Update the following variables in the postman collectionbody for the request.  
    1. jobId: which was output when you ran step 11. 
        ```json
            { "query": "SELECT * FROM devices.jobs WHERE devices.jobs.jobId = '0ebf6e8f-78dc-41a9-a6fd-56f4c3aaa77c'" }          
        ```  
        next  
    2. sasToken: your SAS token. You created this in step 9. Or, you can use the Azure CLI to generate a new one. You can use the Azure CLI to generate your SAS token as follows:  
        ```bash
          az iot hub generate-sas-token -n iot-joboffline-dev
        ```  
</br>  


# A note about shared access policies for talking with the IoT Hub Service API for jobs

The `service` shared access policy does not provide enough permissions to call the `/jobs/v2/{jobiId}` api.  
iothubowner should be used if using the built in shared access policies.  

The repo includes a NodeJS file `devices/service-console/src/genSasToken.js` which shows how to gen a token.  

node genSasToken.js "iot-joboffline-dev.azure-devices.net" "asdf" "iothubowner" "1440" 

# Links for learning more

Describes how to create and query jobs   
[https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-devguide-jobs](https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-devguide-jobs)  

Shows how to query jobs, devices, and device specific status for jobs  
[https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-devguide-query-language#get-started-with-jobs-queries](https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-devguide-query-language#get-started-with-jobs-queries)  

Examples of queries:  
SELECT * FROM devices.jobs  WHERE devices.jobs.deviceId = 'myDeviceId'  
SELECT * FROM devices.jobs  WHERE devices.jobs.deviceId = 'myDeviceId' AND devices.jobs.jobId = 'myJobId'  

The API endpoint for executing queries  
[https://docs.microsoft.com/en-us/rest/api/iothub/service/query/get-twins\](https://docs.microsoft.com/en-us/rest/api/iothub/service/query/get-twins)  
Note: requires use of a ‘x-ms-continuation’ header for paging with the API  

IoT Hub REST API  
[https://docs.microsoft.com/en-us/rest/api/iothub/](https://docs.microsoft.com/en-us/rest/api/iothub/)  

IoT Hub Authentication  
[https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-devguide-security](https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-devguide-security)  

IoT Hub Azure AD RBAC  
[https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-dev-guide-azure-ad-rbac](https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-dev-guide-azure-ad-rbac)  

IoT Hub SAS Auth  
[https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-dev-guide-sas?tabs=node](https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-dev-guide-sas?tabs=node)  

IoT Get Scheduled Job  
[https://docs.microsoft.com/en-us/rest/api/iothub/service/jobs/get-scheduled-job](https://docs.microsoft.com/en-us/rest/api/iothub/service/jobs/get-scheduled-job)  





