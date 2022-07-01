param subnetNames array = [
  'internet'
  'private'
]

@description('The Azure region into which the resources should be deployed.')
param location string = resourceGroup().location

@description('Name of the VNET')
param virtualNetworkName string

resource virtualNetwork 'Microsoft.Network/virtualNetworks@2018-11-01' = {
  name: virtualNetworkName
  location: location
  properties: {
    addressSpace: {
      addressPrefixes: [
        '10.0.0.0/16'
      ]
    }
    subnets: [for (subnetName, i) in subnetNames: {
      name: subnetName
      properties: {
        addressPrefix: '10.0.${i}.0/24'
      }
    }]
  }
}

output virtualNetworkId string = virtualNetwork.id
output internetSubnetId string = virtualNetwork.properties.subnets[0].id
output privateSubnetId string = virtualNetwork.properties.subnets[1].id
