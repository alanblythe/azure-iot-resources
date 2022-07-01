@description('The Azure region into which the resources should be deployed.')
param location string = resourceGroup().location

@description('The type of environment. This must be nonprod or prod.')
@allowed([
  'dev'
  'qa'
  'prod'
])
param environment string

@description('Specify the base name.')
param baseName string

param adminPassword string = 'password1!'

param adminUsername string = 'iotadmin'

param childCount int = ((deployVM) ? 1 : 0)

param deployVM bool = false

param deployACR bool = false

module iotHub 'modules/iot.bicep' = {
  name: 'iotDeploy'
  params: {
      location: location
      iotHubName: 'iot-${baseName}-${environment}'
      provisioningServiceName: 'dps-${baseName}-${environment}'
  }
}

module vnet 'modules/vnet.bicep' = if (deployVM) {
  name: '${baseName}-vnet'
  params: {
    location: location
    virtualNetworkName: '${baseName}-vnet'
  }
}


module vmGateway 'modules/vm.bicep' = if (deployVM) {
  name: '${baseName}-gateway'
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
  params: {
    location: location
    baseName: baseName
  }
}

output vmGatewaySSH string = ((deployVM) ? vmGateway.outputs.sshCommand : '')

output vmChildSSH array = [for i in range(0, childCount): {
  sshCommand: ((deployVM) ? vmChild[i].outputs.sshCommand : '')
}]
