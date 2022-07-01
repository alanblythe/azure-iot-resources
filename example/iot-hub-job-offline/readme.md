
This exercise was modeled after the following article  
[https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-node-node-schedule-jobs](https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-node-node-schedule-jobs)  

# Steps
- az login
- az account set -s "SUBID"
- az group create -l eastus -n rg-jobofflinedevice
- az deployment group create -g rg-jobofflinedevice --template-file deploy/main.bicep --parameters deploy/main.parameters.json

```docker exec service-console node scheduleJobService.js```




