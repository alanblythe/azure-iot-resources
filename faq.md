# How does IoT Hub compare to a MQTT broker?
Updated: June 9th 2022  

IoT Hub supports a subset of the MQTT v3.1.1 spec. IoT Hub is not a full-featured MQTT broker and does not support all the behaviors specified in the MQTT v3.1.1 standard. Read more at the following link.

[https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-mqtt-support](https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-mqtt-support)  

# What are the features of Azure Device Update (ADU)?
Updated: June 9th 2022
- Provides storage, management, and delivery to IoT devices
- Is integrated with IoT Hub and also includes a content delivery network
- Works based on a manifest that declares the desired state and update resources 
- Supports image (SWUpdate), package based (apt), and custom update types
- Updates can be cached at the Edge
- Supports updating components of a device such as attached sensors

A presentation that includes more info and links: [/resources/20220214_azure_device_update.pdf](/resources/20220214_azure_device_update.pdf)  

See the following presentation for more details.  
[https://github.com/Azure/iot-hub-device-update/tree/main/docs/agent-reference](https://github.com/Azure/iot-hub-device-update/tree/main/docs/agent-reference)  

Some additional reference links  
- [https://github.com/Azure/iot-hub-device-update/blob/main/docs/agent-reference/whats-new.md](https://github.com/Azure/iot-hub-device-update/blob/main/docs/agent-reference/whats-new.md)  
- [https://github.com/Azure/iot-hub-device-update/blob/main/docs/agent-reference/how-to-build-agent-code.md](https://github.com/Azure/iot-hub-device-update/blob/main/docs/agent-reference/how-to-build-agent-code.md)  
- [https://docs.microsoft.com/en-us/azure/iot-hub-device-update/understand-device-update](https://docs.microsoft.com/en-us/azure/iot-hub-device-update/understand-device-update)  

# What's a good starting point to understand resource organization in Azure than can account for resource, and network, separation for compliance or multi-tenancy needs?
Updated: June 9th 2022  

The Cloud Adoption Framework (CAF) is a good starting point as well as the Hub and Spoke architecture reference architecture.

Hub and Spoke  
[https://docs.microsoft.com/en-us/azure/architecture/reference-architectures/hybrid-networking/hub-spoke?tabs=cli](https://docs.microsoft.com/en-us/azure/architecture/reference-architectures/hybrid-networking/hub-spoke?tabs=cli)

CAF  
[https://docs.microsoft.com/en-us/azure/cloud-adoption-framework/](https://docs.microsoft.com/en-us/azure/cloud-adoption-framework/)  

# How can a device connect to IoT Hub without using the Azure IoT Device SDK?  
Updated: June 9th 2022  

The device may use MQTT clients rather than the Azure IoT SDK by following the instructions for authentication found in the following article.

[https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-mqtt-support#using-the-mqtt-protocol-directly-as-a-device](https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-mqtt-support#using-the-mqtt-protocol-directly-as-a-device)

The same article provides guidance for connecting Azure IoT Edge Modules directly as well, see the following section.  

[https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-mqtt-support#using-the-mqtt-protocol-directly-as-a-device](https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-mqtt-support#using-the-mqtt-protocol-directly-as-a-device)

# How can mender be used to provision and update devices?  
Updated: June 9th 2022  

The following articles discusses, with video, the capabilities of mender.  

[https://techcommunity.microsoft.com/t5/internet-of-things-blog/automatic-device-provisioning-with-azure-iot-hub-using-mender-io/ba-p/3113698](https://techcommunity.microsoft.com/t5/internet-of-things-blog/automatic-device-provisioning-with-azure-iot-hub-using-mender-io/ba-p/3113698)  

The follow reference from mender further details how the integration with IoT Hub works.  

[https://mender.io/partners/device-update-azure](https://mender.io/partners/device-update-azure)  