targetScope = 'subscription'

@description('The Azure region into which the resources should be deployed.')
param location string

@description('Specify the base name.')
param baseName string

param uniqueName string

param adminPassword string = 'password1!'

param adminUsername string = 'iotadmin'

param childCount int = ((deployVM) ? 1 : 0)

param deployVM bool = false

param deployACR bool = false

resource rg 'Microsoft.Resources/resourceGroups@2021-01-01' = {
  name: 'rg-${baseName}-${uniqueName}'
  location: location
}

module iotHub 'modules/iot.bicep' = {
  name: 'iotDeploy'
  scope: rg
  params: {
      location: location
      iotHubName: 'iot-${baseName}-${uniqueName}'
      provisioningServiceName: 'dps-${baseName}-${uniqueName}'
  }
}

module vnet 'modules/vnet.bicep' = if (deployVM) {
  name: '${baseName}-vnet'
  scope: rg
  params: {
    location: location
    virtualNetworkName: '${baseName}-vnet'
  }
}


module vmGateway 'modules/vm.bicep' = if (deployVM) {
  name: '${baseName}-gateway'
  scope: rg
  params: {
    location: location
    vmName: '${baseName}-gateway'
    adminPassword: adminPassword
    adminUsername: adminUsername
    internetSubnetId: deployVM ? vnet.outputs.internetSubnetId : ''
    privateSubnetId: deployVM ? vnet.outputs.privateSubnetId : ''
    networkSecurityGroupName: '${baseName}-gateway-NSG'
  }
  dependsOn: [
    vnet
  ]
}

module vmChild 'modules/vm.bicep' = [for i in range(0, childCount): {
  name: '${baseName}-child${i}'
  scope: rg
  params: {
    location: location
    vmName: '${baseName}-child1'
    adminPassword: adminPassword
    adminUsername: adminUsername
    internetSubnetId: deployVM ? vnet.outputs.internetSubnetId : ''
    privateSubnetId: deployVM ? vnet.outputs.privateSubnetId : ''
    networkSecurityGroupName: '${baseName}-child${i}-NSG'
  }
  dependsOn: [
    vnet
  ]
} ]

module acr 'modules/acr.bicep' = if (deployACR) {
  name: 'acr${baseName}'
  scope: rg
  params: {
    location: location
    baseName: baseName
  }
}

output vmGatewaySSH string = ((deployVM) ? vmGateway.outputs.sshCommand : '')

output vmChildSSH array = [for i in range(0, childCount): {
  sshCommand: ((deployVM) ? vmChild[i].outputs.sshCommand : '')
}]
