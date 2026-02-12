targetScope = 'resourceGroup'

// GENERAL PARAMETERS
@description('The location for the resources. Defaults to the resource group location.')
param location string = resourceGroup().location

@description('The name of the project. Used as a prefix for all resources.')
param projectName string = 'custom-architecture-platform'

@description('The name of the environment (e.g., dev, test, prod).')
param environmentName string

// SECURE PARAMETERS
@description('The administrator password for the SQL server.')
@secure()
param sqlAdminPassword string

// VARIABLES
var prefix = toLower('${projectName}-${environmentName}')
var sanitizedPrefix = replace(prefix, '-', '')
var uniqueSuffix = substring(uniqueString(resourceGroup().id), 0, 5)
var tags = {
  'azd-env-name': environmentName
}

// RESOURCES
resource storageAccount 'Microsoft.Storage/storageAccounts@2022-09-01' = {
  name: toLower('${sanitizedPrefix}${uniqueSuffix}stg')
  location: location
  tags: tags
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: toLower('${prefix}-appi')
  location: location
  tags: tags
  kind: 'web'
  properties: {
    Application_Type: 'web'
  }
}

resource appServicePlan 'Microsoft.Web/serverfarms@2022-03-01' = {
  name: toLower('${prefix}-func-asp')
  location: location
  tags: tags
  sku: {
    name: 'Y1'
    tier: 'Dynamic'
  }
}

resource functionApp 'Microsoft.Web/sites@2022-09-01' = {
  name: toLower('${prefix}-func')
  location: location
  tags: union(tags, { 'azd-service-name': 'api' })
  kind: 'functionapp'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      appSettings: [
        {
          name: 'AzureWebJobsStorage'
          value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};EndpointSuffix=${environment().suffixes.storage};AccountKey=${listKeys(storageAccount.id, storageAccount.apiVersion).keys[0].value}'
        }
        {
          name: 'FUNCTIONS_EXTENSION_VERSION'
          value: '~4'
        }
        {
          name: 'FUNCTIONS_WORKER_RUNTIME'
          value: 'python'
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: appInsights.properties.ConnectionString
        }
      ]
    }
  }
}

resource cosmosDbAccount 'Microsoft.DocumentDB/databaseAccounts@2023-04-15' = {
  name: toLower('${prefix}-${uniqueSuffix}-cosmos')
  location: location
  tags: tags
  kind: 'GlobalDocumentDB'
  properties: {
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
    }
    locations: [
      {
        locationName: location
        failoverPriority: 0
        isZoneRedundant: false
      }
    ]
    databaseAccountOfferType: 'Standard'
  }
}

resource sqlServer 'Microsoft.Sql/servers@2022-05-01-preview' = {
  name: toLower('${prefix}-sqlsrv')
  location: location
  tags: tags
  properties: {
    administratorLogin: 'azduser'
    administratorLoginPassword: sqlAdminPassword
  }
}

resource sqlDatabase 'Microsoft.Sql/servers/databases@2022-02-01-preview' = {
  name: toLower('${prefix}-sqldb')
  parent: sqlServer
  location: location
  tags: tags
  sku: {
    name: 'Basic'
    tier: 'Basic'
  }
}

resource keyVault 'Microsoft.KeyVault/vaults@2023-02-01' = {
  name: toLower('${prefix}-kv')
  location: location
  tags: tags
  properties: {
    sku: {
      name: 'standard'
      family: 'A'
    }
    tenantId: tenant().tenantId
    enableRbacAuthorization: true
  }
}

// OUTPUTS REQUIRED BY AZD
output AZURE_LOCATION string = location
output AZURE_TENANT_ID string = tenant().tenantId
output AZURE_RESOURCE_GROUP string = resourceGroup().name
output AZURE_PROJECT_NAME string = projectName

// CUSTOM OUTPUTS
output API_URI string = functionApp.properties.defaultHostName
output KEY_VAULT_NAME string = keyVault.name
output COSMOS_DB_ACCOUNT_NAME string = cosmosDbAccount.name
output SQL_SERVER_NAME string = sqlServer.name
output SQL_DATABASE_NAME string = sqlDatabase.name
