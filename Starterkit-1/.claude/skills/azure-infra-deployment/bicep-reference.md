# Bicep Template Reference

Location: `infra/main.bicep`

## Naming Convention

Resources follow the HSAP naming pattern (see [naming-convention.md](naming-convention.md)):

```
{org}-{project}-{version}-{env}-{region}-{resource}
```

| Component | Description | Format | Example |
|-----------|-------------|--------|---------|
| `org` | Organization | 2-5 lowercase chars | `hsap` |
| `project` | Project name | 3-10 lowercase chars | `expagent` |
| `version` | Version identifier | `v` + number | `v1` |
| `env` | Environment | 3 chars | `dev`, `tst`, `prd` |
| `region` | Azure region abbreviation | 2-4 chars | `aue`, `eus` |
| `resource` | Resource type abbreviation | 2-6 chars | `func`, `cosmos` |

### Resource Type Abbreviations

| Resource Type | Abbreviation | Special Rules |
|---------------|--------------|---------------|
| Resource Group | `rg` | Hyphens allowed |
| Storage Account | `st` | **Lowercase only, NO hyphens**, max 24 chars |
| Function App | `func` | Hyphens allowed |
| App Service Plan | `asp` | Hyphens allowed |
| Cosmos DB Account | `cosmos` | Lowercase, hyphens allowed |
| Key Vault | `kv` | Max 24 chars, may omit region |
| Application Insights | `appi` | Hyphens allowed |
| SQL Server | `sql` | Lowercase, hyphens allowed |
| SQL Database | `sqldb` | Hyphens allowed |

## Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `location` | string | No | Resource group location | Azure region for resources |
| `org` | string | No | `hsap` | Organization identifier |
| `project` | string | No | `saas` | Project name |
| `version` | string | No | `v1` | Version identifier |
| `environmentName` | string | Yes | - | Environment (dev/tst/prd) |
| `region` | string | No | `aue` | Region abbreviation |
| `sqlAdminPassword` | securestring | Yes | - | SQL Server admin password |

## Tagging Strategy

All resources must include these tags:

| Tag Name | Description | Example |
|----------|-------------|---------|
| `Environment` | Environment name | `Development` |
| `Project` | Project name | `Expense Agent` |
| `Organization` | Organization | `HSAP` |
| `Version` | Application version | `v1` |
| `Owner` | Team/person responsible | `team@example.com` |
| `CostCenter` | Billing code | `HSAP-AI-001` |
| `CreatedBy` | Deployment method | `Bicep` |

## Outputs

| Output | Description |
|--------|-------------|
| `AZURE_LOCATION` | Resource location |
| `AZURE_TENANT_ID` | Azure AD tenant ID |
| `AZURE_RESOURCE_GROUP` | Resource group name |
| `AZURE_PROJECT_NAME` | Project name |
| `API_URI` | Function App default hostname |
| `KEY_VAULT_NAME` | Key Vault name |
| `COSMOS_DB_ACCOUNT_NAME` | Cosmos DB account name |
| `SQL_SERVER_NAME` | SQL Server name |
| `SQL_DATABASE_NAME` | SQL Database name |

## Full Source Code (Updated for HSAP Naming Convention)

```bicep
targetScope = 'resourceGroup'

// GENERAL PARAMETERS
@description('The location for the resources. Defaults to the resource group location.')
param location string = resourceGroup().location

@description('Organization identifier (2-5 lowercase chars)')
param org string = 'hsap'

@description('The name of the project (3-10 lowercase chars)')
param project string = 'saas'

@description('Version identifier (v + number)')
param version string = 'v1'

@description('The name of the environment (dev, tst, uat, stg, prd)')
@allowed(['dev', 'tst', 'uat', 'stg', 'prd', 'poc'])
param environmentName string

@description('Region abbreviation (2-4 chars)')
param region string = 'aue'

// SECURE PARAMETERS
@description('The administrator password for the SQL server.')
@secure()
param sqlAdminPassword string

// VARIABLES - HSAP Naming Convention: {org}-{project}-{version}-{env}-{region}-{resource}
var prefix = toLower('${org}-${project}-${version}-${environmentName}-${region}')
var sanitizedPrefix = toLower('${org}${project}${version}${environmentName}${region}')

// Tags following HSAP tagging strategy
var tags = {
  Environment: environmentName == 'dev' ? 'Development' : environmentName == 'tst' ? 'Test' : environmentName == 'prd' ? 'Production' : environmentName
  Project: project
  Organization: toUpper(org)
  Version: version
  CreatedBy: 'Bicep'
  'azd-env-name': environmentName
}

// RESOURCES

// Storage Account: {org}{project}{version}{env}{region}st (no hyphens, max 24 chars)
resource storageAccount 'Microsoft.Storage/storageAccounts@2022-09-01' = {
  name: take('${sanitizedPrefix}st', 24)
  location: location
  tags: tags
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
}

// Application Insights: {org}-{project}-{version}-{env}-{region}-appi
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: '${prefix}-appi'
  location: location
  tags: tags
  kind: 'web'
  properties: {
    Application_Type: 'web'
  }
}

// App Service Plan: {org}-{project}-{version}-{env}-{region}-asp
resource appServicePlan 'Microsoft.Web/serverfarms@2022-03-01' = {
  name: '${prefix}-asp'
  location: location
  tags: tags
  sku: {
    name: 'Y1'
    tier: 'Dynamic'
  }
}

// Function App: {org}-{project}-{version}-{env}-{region}-func
resource functionApp 'Microsoft.Web/sites@2022-09-01' = {
  name: '${prefix}-func'
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

// Cosmos DB: {org}-{project}-{version}-{env}-{region}-cosmos
resource cosmosDbAccount 'Microsoft.DocumentDB/databaseAccounts@2023-04-15' = {
  name: '${prefix}-cosmos'
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

// SQL Server: {org}-{project}-{version}-{env}-{region}-sql
resource sqlServer 'Microsoft.Sql/servers@2022-05-01-preview' = {
  name: '${prefix}-sql'
  location: location
  tags: tags
  properties: {
    administratorLogin: 'azduser'
    administratorLoginPassword: sqlAdminPassword
  }
}

// SQL Database: {org}-{project}-{version}-{env}-{region}-sqldb
resource sqlDatabase 'Microsoft.Sql/servers/databases@2022-02-01-preview' = {
  name: '${prefix}-sqldb'
  parent: sqlServer
  location: location
  tags: tags
  sku: {
    name: 'Basic'
    tier: 'Basic'
  }
}

// Key Vault: {org}-{project}-{version}-{env}-kv (region omitted for length)
resource keyVault 'Microsoft.KeyVault/vaults@2023-02-01' = {
  name: take('${org}-${project}-${version}-${environmentName}-kv', 24)
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
output AZURE_PROJECT_NAME string = project
output AZURE_ORG string = org
output AZURE_VERSION string = version
output AZURE_REGION string = region

// CUSTOM OUTPUTS
output API_URI string = functionApp.properties.defaultHostName
output KEY_VAULT_NAME string = keyVault.name
output COSMOS_DB_ACCOUNT_NAME string = cosmosDbAccount.name
output SQL_SERVER_NAME string = sqlServer.name
output SQL_DATABASE_NAME string = sqlDatabase.name
output STORAGE_ACCOUNT_NAME string = storageAccount.name
output FUNCTION_APP_NAME string = functionApp.name
```

## Adding New Resources

1. Follow the naming pattern: `{org}-{project}-{version}-{env}-{region}-{resource}`
2. Use the `prefix` variable for standard resources
3. Use `sanitizedPrefix` for resources that don't allow hyphens (storage, container registry)
4. Apply `tags` for resource organization
5. Add outputs for values needed by scripts

Example:
```bicep
// Service Bus: {org}-{project}-{version}-{env}-{region}-sb
resource serviceBus 'Microsoft.ServiceBus/namespaces@2022-10-01-preview' = {
  name: '${prefix}-sb'
  location: location
  tags: tags
  sku: {
    name: 'Standard'
    tier: 'Standard'
  }
}

output SERVICE_BUS_NAME string = serviceBus.name
```

## Validation Checklist

Before deploying, verify:
- [ ] Names follow the HSAP naming pattern
- [ ] Storage account names are lowercase with no hyphens (max 24 chars)
- [ ] Key Vault names are under 24 characters
- [ ] All required tags are defined
- [ ] Names are unique within their scope
