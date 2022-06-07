#  Scenario

This examples includes the following functionality.

- Cloud request to a device to upload a specific file
- Cloud request to a device to upload a collection of files to a Azure Blob Storage Container
- Device file synchronization from a device using the Azure IoT Edge Blob Storage Module
- Device file upload authorization using certificates

# Technologies / Services

- Azure IoT Hub
- Azure IoT Hub Service SDK
- Azure IoT Edge
- Azure IoT Hub Device SDK
- Azure IoT Edge Modules

# Scenario 1, Cloud initiated file upload request

```mermaid
sequenceDiagram
    participant app as Application
    participant func as Azure Durable Func
    participant hub as Azure IoT Hub
    participant dev as Azure IoT Device
    participant blob as Azure Blob Storage
    app->>+func: RequestFileUpload(deviceId, uploadType) 
    func->>app: jobId
    func->>blob: Create SAS Token
    Note over func: Create Message(jobId,blobUri w/sas, uploadType)
    func->>hub: Send C2D message
    hub->>dev: Deliver message
    loop Every minute
        func-->hub: Upload complete?
    end
    Note over dev: Collect files and upload to storage
    note over dev: Create message(jobId,files[])
    dev->>hub: D2C message, upload complete
    hub->>func: EventHub Trigger
    loop Every minute
        app->>func: Get Job Status? 
        func->>-app: RequestComplete(deviceId, fileType)
    end

```            

# Scenario 2


