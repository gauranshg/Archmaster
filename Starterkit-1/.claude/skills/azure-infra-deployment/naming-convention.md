# Azure Resource Naming Convention

## Overview

This document defines the standard naming convention for Azure resources in HSAP projects.

## Naming Pattern

```
{org}-{project}-{version}-{env}-{region}-{resource}
```

### Components

| Component | Description | Format | Examples |
|-----------|-------------|--------|----------|
| **org** | Organization name | 2-5 lowercase chars | `hsap` |
| **project** | Project/workload name | 3-10 lowercase chars | `expagent` |
| **version** | Version identifier | `v` + number | `v1`, `v2` |
| **env** | Environment | 3 chars | `dev`, `tst`, `uat`, `stg`, `prd` |
| **region** | Azure region abbreviation | 2-4 chars | `aue`, `eus`, `wus` |
| **resource** | Resource type abbreviation | 2-6 chars | `rg`, `func`, `cosmos` |

## Environment Codes

| Environment | Code | Description |
|-------------|------|-------------|
| Development | `dev` | Development and debugging |
| Test | `tst` | Testing and QA |
| UAT | `uat` | User acceptance testing |
| Staging | `stg` | Pre-production |
| Production | `prd` | Live production |
| Proof of Concept | `poc` | Experimental/demo |

## Region Codes

| Azure Region | Code |
|--------------|------|
| Australia East | `aue` |
| Australia Southeast | `ause` |
| East US | `eus` |
| East US 2 | `eus2` |
| West US | `wus` |
| West Europe | `weu` |
| North Europe | `neu` |
| Southeast Asia | `sea` |
| Japan East | `jpe` |

## Resource Type Abbreviations

| Resource Type | Abbreviation | Max Length | Special Rules |
|---------------|--------------|------------|---------------|
| Resource Group | `rg` | 90 | Hyphens allowed |
| Storage Account | `st` | 24 | **Lowercase only, NO hyphens** |
| Function App | `func` | 60 | Hyphens allowed |
| App Service Plan | `asp` | 40 | Hyphens allowed |
| Cosmos DB Account | `cosmos` | 44 | Lowercase, hyphens allowed |
| Key Vault | `kv` | 24 | Hyphens allowed |
| Application Insights | `appi` | 260 | Hyphens allowed |
| Log Analytics Workspace | `log` | 63 | Hyphens allowed |
| Virtual Network | `vnet` | 64 | Hyphens allowed |
| Subnet | `snet` | 80 | Hyphens allowed |
| Network Security Group | `nsg` | 80 | Hyphens allowed |
| Public IP | `pip` | 80 | Hyphens allowed |
| Load Balancer | `lb` | 80 | Hyphens allowed |
| SQL Server | `sql` | 63 | Lowercase, hyphens allowed |
| SQL Database | `sqldb` | 128 | Hyphens allowed |
| App Configuration | `appcs` | 50 | Hyphens allowed |
| Service Bus | `sb` | 50 | Hyphens allowed |
| Event Hub | `evh` | 50 | Hyphens allowed |
| Container Registry | `cr` | 50 | **Alphanumeric only** |

## Naming Examples

### Expense Agent Project (v1, Development, Australia East)

| Resource | Name |
|----------|------|
| Resource Group | `hsap-expagent-v1-dev-aue-rg` |
| Storage Account | `hsapexpagentv1devaue` |
| Function App | `hsap-expagent-v1-dev-aue-func` |
| App Service Plan | `hsap-expagent-v1-dev-aue-asp` |
| Cosmos DB | `hsap-expagent-v1-dev-aue-cosmos` |
| Key Vault | `hsap-expagent-v1-dev-kv` |
| Application Insights | `hsap-expagent-v1-dev-aue-appi` |
| Log Analytics | `hsap-expagent-v1-dev-aue-log` |

### Expense Agent Project (v1, Production, Australia East)

| Resource | Name |
|----------|------|
| Resource Group | `hsap-expagent-v1-prd-aue-rg` |
| Storage Account | `hsapexpagentv1prdaue` |
| Function App | `hsap-expagent-v1-prd-aue-func` |
| Cosmos DB | `hsap-expagent-v1-prd-aue-cosmos` |
| Key Vault | `hsap-expagent-v1-prd-kv` |

## Tagging Strategy

All resources should include the following tags:

| Tag Name | Description | Example |
|----------|-------------|---------|
| `Environment` | Environment name | `Development`, `Production` |
| `Project` | Project name | `Expense Agent` |
| `Organization` | Organization | `HSAP` |
| `Version` | Application version | `1.0.0` |
| `Owner` | Team/person responsible | `ggupta@hsdyn.com` |
| `CostCenter` | Billing code | `HSAP-AI-001` |
| `CreatedBy` | Deployment method | `Bicep` |
| `CreatedDate` | Deployment date | `2025-01-05` |

## Special Cases

### Storage Account Names
Storage accounts have strict naming rules:
- 3-24 characters
- Lowercase letters and numbers only
- NO hyphens or special characters
- Must be globally unique

**Pattern**: `{org}{project}{version}{env}{region}`
**Example**: `hsapexpagentv1devaue`

If too long, abbreviate:
- `hsapexpv1devaue` (15 chars)

### Key Vault Names
Key Vaults have a 24-character limit:
- May need to omit region for longer names
- **Pattern**: `{org}-{project}-{version}-{env}-kv`
- **Example**: `hsap-expagent-v1-dev-kv` (22 chars)

### Container Registry Names
Container registries only allow alphanumeric:
- **Pattern**: `{org}{project}{version}{env}{region}cr`
- **Example**: `hsapexpagentv1devauecr`

## Bicep Variables

```bicep
// Naming convention variables
var org = 'hsap'
var project = 'expagent'
var version = 'v1'
var env = environmentName  // dev, tst, prd
var region = 'aue'

// Resource names
var resourceGroupName = '${org}-${project}-${version}-${env}-${region}-rg'
var storageAccountName = '${org}${project}${version}${env}${region}'
var functionAppName = '${org}-${project}-${version}-${env}-${region}-func'
var cosmosDbName = '${org}-${project}-${version}-${env}-${region}-cosmos'
var keyVaultName = '${org}-${project}-${version}-${env}-kv'
var appInsightsName = '${org}-${project}-${version}-${env}-${region}-appi'
var appServicePlanName = '${org}-${project}-${version}-${env}-${region}-asp'
```

## Validation Checklist

Before deploying, verify:

- [ ] Names follow the convention pattern
- [ ] Storage account names are lowercase with no hyphens
- [ ] Key Vault names are under 24 characters
- [ ] Container Registry names are alphanumeric only
- [ ] All required tags are defined
- [ ] Names are unique within their scope (subscription/global)

## References

- [Microsoft Cloud Adoption Framework - Naming Convention](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/azure-best-practices/resource-naming)
- [Azure Resource Naming Rules](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/resource-name-rules)
