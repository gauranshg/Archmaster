---
name: azure-infra-deployment
description: Deploy and manage Azure infrastructure using Bicep templates and Python scripts. Use when deploying Azure resources, setting up Key Vault secrets, configuring Cosmos DB, registering Azure AD apps, or working with Azure infrastructure automation.
allowed-tools: Read, Bash, Grep, Glob
---

# Azure Infrastructure Deployment

This skill provides guidance for deploying and managing Azure infrastructure for the SaaS starter kit project.

## Naming Convention

All resources follow the HSAP naming pattern (see [naming-convention.md](naming-convention.md)):

```
{org}-{project}-{version}-{env}-{region}-{resource}
```

Example: `hsap-expagent-v1-dev-aue-func`

## Overview

The infrastructure consists of:
- **Bicep template** (`infra/main.bicep`) - Defines all Azure resources
- **Python scripts** - Automate post-deployment configuration

## Resources Deployed

The Bicep template provisions:

| Resource | Purpose |
|----------|---------|
| Storage Account | Blob storage for uploads and function app storage |
| Application Insights | Monitoring and telemetry |
| App Service Plan | Consumption plan for Azure Functions |
| Function App | Python-based serverless API |
| Cosmos DB | NoSQL database for chat history |
| SQL Server & Database | Relational database |
| Key Vault | Secure secret storage |

## Deployment Workflow

### 1. Deploy Infrastructure

```bash
# Using Azure Developer CLI (azd)
azd up

# Or using Azure CLI directly
az deployment group create \
  --resource-group <rg-name> \
  --template-file infra/main.bicep \
  --parameters environmentName=dev sqlAdminPassword=<secure-password>
```

### 2. Export Environment Variables

```bash
azd env get-values > .env
```

### 3. Set Key Vault Secrets

```bash
python infra/set_secrets.py
```

This script:
- Loads environment variables from `.env`
- Authenticates with Azure using DefaultAzureCredential
- Fetches connection strings from Cosmos DB and Function App
- Sets all secrets in Key Vault

### 4. Register Azure AD Application (Optional)

```bash
python infra/register_ad_app.py
```

This script:
- Creates an Azure AD application registration
- Creates a service principal
- Configures SPA redirect URIs
- Saves `AUTH_CLIENT_ID` and `AUTH_TENANT_ID` to `.env`

### 5. Setup Initial Data

```bash
python infra/setup_data.py
```

This script:
- Creates Cosmos DB database and container
- Seeds sample chat history data
- Creates storage container and uploads test file

## Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `AZURE_SUBSCRIPTION_ID` | Azure subscription ID | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `AZURE_RESOURCE_GROUP` | Target resource group name | `hsap-expagent-v1-dev-aue-rg` |
| `AZURE_ENV_NAME` | Environment code (3 chars) | `dev`, `tst`, `prd` |
| `AZURE_PROJECT_NAME` | Project name (3-10 chars) | `expagent` |
| `KEY_VAULT_NAME` | Name of the Key Vault | `hsap-expagent-v1-dev-kv` |
| `COSMOS_DB_ACCOUNT_NAME` | Cosmos DB account name | `hsap-expagent-v1-dev-aue-cosmos` |

### HSAP Naming Variables (Optional)

| Variable | Description | Default |
|----------|-------------|---------|
| `AZURE_ORG` | Organization identifier | `hsap` |
| `AZURE_VERSION` | Version identifier | `v1` |
| `AZURE_REGION` | Region abbreviation | `aue` |

## Bicep Template Reference

For detailed Bicep template information, see [bicep-reference.md](bicep-reference.md).

## Python Scripts Reference

For detailed script documentation, see [scripts-reference.md](scripts-reference.md).

## Common Tasks

### Add a new Azure resource

1. Edit `infra/main.bicep`
2. Add resource definition following the naming convention: `${prefix}-<resource-suffix>`
3. Add output if the resource name/endpoint is needed by other scripts
4. Run `azd up` to deploy changes

### Update Key Vault secrets

1. Ensure `.env` file has the required variables
2. Run `python infra/set_secrets.py`
3. The script will skip secrets with missing values

### Troubleshooting

**Authentication errors**: Run `az login` to refresh credentials

**Missing environment variables**: Run `azd env get-values > .env`

**Key Vault access denied**: Ensure your user has Key Vault Secrets Officer role
