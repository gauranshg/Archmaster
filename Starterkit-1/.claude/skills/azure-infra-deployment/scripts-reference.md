# Python Scripts Reference

## Naming Convention

Scripts follow the HSAP naming pattern (see [naming-convention.md](naming-convention.md)):

```
{org}-{project}-{version}-{env}-{region}-{resource}
```

Resource names are derived from environment variables:
- `AZURE_ORG` - Organization (default: `hsap`)
- `AZURE_PROJECT_NAME` - Project name
- `AZURE_VERSION` - Version (default: `v1`)
- `AZURE_ENV_NAME` - Environment (`dev`, `tst`, `prd`)
- `AZURE_REGION` - Region abbreviation (default: `aue`)

## Dependencies

All scripts require these Python packages:
```bash
pip install azure-identity azure-keyvault-secrets azure-mgmt-cosmosdb azure-mgmt-web azure-mgmt-cognitiveservices azure-cosmos azure-storage-blob python-dotenv
```

---

## set_secrets.py

Location: `infra/set_secrets.py`

### Purpose
Sets secrets in Azure Key Vault from environment variables and Azure resource connection strings.

### Prerequisites
- `.env` file with required variables
- Azure CLI logged in (`az login`)
- Key Vault Secrets Officer role on the Key Vault

### Required Environment Variables
- `AZURE_SUBSCRIPTION_ID`
- `KEY_VAULT_NAME`
- `AZURE_RESOURCE_GROUP`

### Optional Environment Variables (HSAP Naming)
- `AZURE_ORG` - Organization identifier
- `AZURE_PROJECT_NAME` - Project name
- `AZURE_VERSION` - Version identifier
- `AZURE_ENV_NAME` - Environment name
- `AZURE_REGION` - Region abbreviation

### Secrets Created
| Secret Name | Source |
|------------|--------|
| `AUTH-CLIENT-ID` | Environment variable |
| `AUTH-TENANT-ID` | Environment variable |
| `SQL-ADMIN-PASSWORD` | Environment variable |
| `SQL-CONNECTION-STRING` | Built from SQL variables |
| `COSMOS-CONNECTION-STRING` | Fetched from Cosmos DB |
| `COSMOS-KEY` | Fetched from Cosmos DB |
| `AZURE-OPENAI-API-KEY` | Fetched from Cognitive Services |
| `AZURE-OPENAI-ENDPOINT` | Environment variable |
| `APPINSIGHTS-CONNECTION-STRING` | Fetched from Function App |
| `STORAGE-CONNECTION-STRING` | Fetched from Function App |

### Usage
```bash
python infra/set_secrets.py
```

### Full Source Code (Updated for HSAP Naming Convention)

```python
import os
import sys
from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient
from azure.mgmt.cosmosdb import CosmosDBManagementClient
from azure.mgmt.web import WebSiteManagementClient
from azure.mgmt.cognitiveservices import CognitiveServicesManagementClient
from azure.core.exceptions import ResourceNotFoundError
from dotenv import load_dotenv

def get_hsap_resource_name(env_vars, resource_suffix):
    """
    Generate resource name following HSAP naming convention.
    Pattern: {org}-{project}-{version}-{env}-{region}-{resource}
    """
    org = env_vars.get("AZURE_ORG", "hsap")
    project = env_vars.get("AZURE_PROJECT_NAME", "saas")
    version = env_vars.get("AZURE_VERSION", "v1")
    env = env_vars.get("AZURE_ENV_NAME", "dev")
    region = env_vars.get("AZURE_REGION", "aue")
    return f"{org}-{project}-{version}-{env}-{region}-{resource_suffix}"

def main():
    """
    Sets secrets in Azure Key Vault based on environment variables from the .env file.
    Only sets secrets for values that are available.
    """
    print("Starting to set secrets in Key Vault from .env file...")
    print("=" * 70)

    # 1. Load environment variables from .env file
    print("\n[1/5] Loading environment variables from .env file...")
    if not os.path.exists(".env"):
        print("Error: .env file not found. Please run 'azd env get-values > .env' first.", file=sys.stderr)
        sys.exit(1)

    # Try multiple encodings
    encodings = ['utf-8', 'utf-16', 'utf-16-le', 'latin-1', 'cp1252']
    loaded = False
    for encoding in encodings:
        try:
            load_dotenv(encoding=encoding)
            print(f".env file loaded successfully with {encoding} encoding.")
            loaded = True
            break
        except UnicodeDecodeError:
            continue
        except Exception as e:
            print(f"Warning: Error loading .env with {encoding}: {e}")
            continue

    if not loaded:
        print("Error: Could not load .env file with any supported encoding.", file=sys.stderr)
        sys.exit(1)
    print(".env file loaded successfully.")

    # 2. Check for required environment variables (only the essentials)
    print("\n[2/5] Checking for required environment variables...")
    required_vars = {
        "AZURE_SUBSCRIPTION_ID": "The Azure subscription ID.",
        "KEY_VAULT_NAME": "The name of the Azure Key Vault.",
        "AZURE_RESOURCE_GROUP": "The Azure resource group name.",
    }

    env_vars = {}
    missing_vars = []
    for var, desc in required_vars.items():
        value = os.getenv(var)
        if not value:
            print(f"  Missing: {var} - {desc}", file=sys.stderr)
            missing_vars.append(var)
        else:
            print(f"  Found: {var}")
            env_vars[var] = value

    if missing_vars:
        print(f"\nError: Missing {len(missing_vars)} required environment variable(s).", file=sys.stderr)
        print("Please ensure your .env file contains these variables.", file=sys.stderr)
        sys.exit(1)

    # HSAP naming convention variables
    hsap_vars = {
        "AZURE_ORG": "Organization identifier (default: hsap)",
        "AZURE_VERSION": "Version identifier (default: v1)",
        "AZURE_REGION": "Region abbreviation (default: aue)",
    }

    # Optional variables (won't fail if missing)
    optional_vars = {
        "API_URI": "The URI of the API.",
        "APPLICATION_INSIGHTS_INSTRUMENTATION_KEY": "Application Insights instrumentation key",
        "AZURE_ENV_NAME": "Azure environment name",
        "AZURE_LOCATION": "Azure location",
        "AZURE_PROJECT_NAME": "Azure project name",
        "COSMOS_DB_ACCOUNT_NAME": "Cosmos DB account name",
        "AZURE_OPENAI_ACCOUNT_NAME": "Azure OpenAI account name",
        "AZURE_OPENAI_ENDPOINT": "Azure OpenAI endpoint",
        "COSMOS_DB_DATABASE_NAME": "Cosmos DB database name",
        "COSMOS_DB_ENDPOINT": "Cosmos DB endpoint",
        "AUTH_CLIENT_ID": "Azure AD Client ID (optional)",
        "AUTH_TENANT_ID": "Azure AD Tenant ID (optional)",
        "FUNCTION_APP_NAME": "Function App name",
        "STORAGE_ACCOUNT_NAME": "Storage account name",
        "APPLICATION_INSIGHTS_CONNECTION_STRING": "Application Insights connection string",
        "SQL_SERVER_NAME": "The SQL server name.",
        "SQL_DATABASE_NAME": "The SQL database name.",
        "SQL_ADMIN_PASSWORD": "The SQL administrator password."
    }
    optional_vars.update(hsap_vars)

    print("\n[3/5] Checking for optional environment variables...")
    for var, desc in optional_vars.items():
        value = os.getenv(var)
        if value:
            env_vars[var] = value
            print(f"  Found: {var}")
        else:
            print(f"  Optional (not found): {var} - {desc}")

    # 3. Initialize Azure Clients
    print("\n[4/5] Authenticating with Azure...")
    try:
        credential = DefaultAzureCredential()
        credential.get_token("https://management.azure.com/.default")
        print("Authentication successful.")
    except Exception as e:
        print("Authentication failed. Please ensure you are logged into Azure via 'az login'.", file=sys.stderr)
        print(f"Error details: {e}", file=sys.stderr)
        sys.exit(1)

    # --- Key Vault Client ---
    key_vault_name = env_vars["KEY_VAULT_NAME"]
    key_vault_uri = f"https://{key_vault_name}.vault.azure.net"

    try:
        secret_client = SecretClient(vault_url=key_vault_uri, credential=credential)
        print(f"Connected to Key Vault: {key_vault_name}")
    except Exception as e:
        print(f"Failed to connect to Key Vault: {e}", file=sys.stderr)
        sys.exit(1)

    # --- Management Clients ---
    subscription_id = env_vars["AZURE_SUBSCRIPTION_ID"]
    resource_group = env_vars["AZURE_RESOURCE_GROUP"]

    # --- Helper function ---
    secrets_set = 0
    secrets_failed = 0

    def set_secret(secret_name, secret_value, required=False):
        nonlocal secrets_set, secrets_failed
        if not secret_value or secret_value == "Not found":
            if required:
                print(f"  Cannot set required secret '{secret_name}': value is empty")
                secrets_failed += 1
            else:
                print(f"  Skipping '{secret_name}': value not available")
            return False

        try:
            secret_client.set_secret(secret_name, secret_value)
            print(f"  Set secret: '{secret_name}'")
            secrets_set += 1
            return True
        except Exception as e:
            print(f"  Failed to set secret '{secret_name}': {e}")
            secrets_failed += 1
            return False

    print("\n[5/5] Setting secrets in Key Vault...")
    print(f"Target Key Vault: {key_vault_name}")
    print("-" * 70)

    # Set Azure AD secrets (optional)
    if env_vars.get("AUTH_CLIENT_ID"):
        set_secret("AUTH-CLIENT-ID", env_vars["AUTH_CLIENT_ID"])

    if env_vars.get("AUTH_TENANT_ID"):
        set_secret("AUTH-TENANT-ID", env_vars["AUTH_TENANT_ID"])

    # Set SQL secrets if available
    if env_vars.get("SQL_ADMIN_PASSWORD"):
        set_secret("SQL-ADMIN-PASSWORD", env_vars["SQL_ADMIN_PASSWORD"])

    # Build and set SQL Connection String
    if env_vars.get("SQL_SERVER_NAME") and env_vars.get("SQL_DATABASE_NAME") and env_vars.get("SQL_ADMIN_PASSWORD"):
        print("\nBuilding SQL Connection String...")
        sql_connection_string = (
            f"Server=tcp:{env_vars['SQL_SERVER_NAME']}.database.windows.net,1433;"
            f"Initial Catalog={env_vars['SQL_DATABASE_NAME']};"
            "Persist Security Info=False;"
            "User ID=azduser;"
            f"Password={env_vars['SQL_ADMIN_PASSWORD']};"
            "MultipleActiveResultSets=False;"
            "Encrypt=True;"
            "TrustServerCertificate=False;"
            "Connection Timeout=30;"
        )
        set_secret("SQL-CONNECTION-STRING", sql_connection_string)

    # Get and Set Cosmos DB Connection String
    if env_vars.get("COSMOS_DB_ACCOUNT_NAME"):
        print("\nFetching Cosmos DB connection string...")
        try:
            cosmos_client = CosmosDBManagementClient(credential, subscription_id)
            cosmos_keys = cosmos_client.database_accounts.list_connection_strings(
                resource_group, env_vars["COSMOS_DB_ACCOUNT_NAME"]
            )
            cosmos_connection_string = cosmos_keys.connection_strings[0].connection_string
            set_secret("COSMOS-CONNECTION-STRING", cosmos_connection_string, required=True)

        except Exception as e:
            print(f"  Warning: Could not fetch Cosmos DB connection string: {e}")
            secrets_failed += 1

    # Get and Set Cosmos DB primary key
    if env_vars.get("COSMOS_DB_ACCOUNT_NAME"):
        print("\nFetching Cosmos DB primary key...")
        try:
            cosmos_client = CosmosDBManagementClient(credential, subscription_id)
            cosmos_keys = cosmos_client.database_accounts.list_keys(
                resource_group, env_vars["COSMOS_DB_ACCOUNT_NAME"]
            )
            cosmos_primary_key = cosmos_keys.primary_master_key
            set_secret("COSMOS-KEY", cosmos_primary_key, required=True)

        except Exception as e:
            print(f"  Warning: Could not fetch Cosmos DB primary key: {e}")
            secrets_failed += 1

    # Get and Set Azure OpenAI API Key
    if env_vars.get("AZURE_OPENAI_ACCOUNT_NAME"):
        print("\nFetching Azure OpenAI API key...")
        try:
            openai_client = CognitiveServicesManagementClient(credential, subscription_id)
            openai_keys = openai_client.accounts.list_keys(
                resource_group, env_vars["AZURE_OPENAI_ACCOUNT_NAME"]
            )
            set_secret("AZURE-OPENAI-API-KEY", openai_keys.key1, required=True)
        except Exception as e:
            print(f"  Warning: Could not fetch Azure OpenAI API key: {e}")
            secrets_failed += 1

    # Set Azure OpenAI Endpoint
    if env_vars.get("AZURE_OPENAI_ENDPOINT"):
        set_secret("AZURE-OPENAI-ENDPOINT", env_vars["AZURE_OPENAI_ENDPOINT"], required=True)

    # Get secrets from Function App Settings
    # HSAP naming: {org}-{project}-{version}-{env}-{region}-func
    function_app_name = None
    if env_vars.get("FUNCTION_APP_NAME"):
        function_app_name = env_vars["FUNCTION_APP_NAME"]
    elif env_vars.get("AZURE_PROJECT_NAME") and env_vars.get("AZURE_ENV_NAME"):
        # Use HSAP naming convention
        function_app_name = get_hsap_resource_name(env_vars, "func")

    if function_app_name:
        print(f"\nFetching settings from Function App '{function_app_name}'...")
        try:
            web_client = WebSiteManagementClient(credential, subscription_id)
            app_settings = web_client.web_apps.list_application_settings(
                resource_group, function_app_name
            ).properties

            set_secret("APPINSIGHTS-CONNECTION-STRING",
                      app_settings.get("APPLICATIONINSIGHTS_CONNECTION_STRING"))
            set_secret("STORAGE-CONNECTION-STRING",
                      app_settings.get("AzureWebJobsStorage"))
            set_secret("BLOB-STORAGE-CONNECTION-STRING",
                      app_settings.get("BLOB_STORAGE_CONNECTION_STRING"))
        except Exception as e:
            print(f"  Warning: Could not fetch Function App settings: {e}")

    # Set other environment variables as secrets
    if env_vars.get("APPLICATION_INSIGHTS_CONNECTION_STRING"):
        set_secret("APPINSIGHTS-CONNECTION-STRING",
                  env_vars["APPLICATION_INSIGHTS_CONNECTION_STRING"])
    if env_vars.get("API_URI"):
        set_secret("API-URI", env_vars["API_URI"])
    if env_vars.get("APPLICATION_INSIGHTS_INSTRUMENTATION_KEY"):
        set_secret("APPINSIGHTS-INSTRUMENTATION-KEY",
                  env_vars["APPLICATION_INSIGHTS_INSTRUMENTATION_KEY"])
    if env_vars.get("AZURE_ENV_NAME"):
        set_secret("AZURE-ENV-NAME", env_vars["AZURE_ENV_NAME"])
    if env_vars.get("AZURE_LOCATION"):
        set_secret("AZURE-LOCATION", env_vars["AZURE_LOCATION"])
    if env_vars.get("AZURE_PROJECT_NAME"):
        set_secret("AZURE-PROJECT-NAME", env_vars["AZURE_PROJECT_NAME"])
    if env_vars.get("COSMOS_DB_DATABASE_NAME"):
        set_secret("COSMOS-DB-DATABASE-NAME",
                  env_vars["COSMOS_DB_DATABASE_NAME"])
    if env_vars.get("COSMOS_DB_ENDPOINT"):
        set_secret("COSMOS-DB-ENDPOINT", env_vars["COSMOS_DB_ENDPOINT"])
    if env_vars.get("AZURE_TENANT_ID"):
        set_secret("AZURE-TENANT-ID", env_vars["AZURE_TENANT_ID"])

    print("\n" + "=" * 70)
    print("Summary:")
    print(f"  Secrets successfully set: {secrets_set}")
    if secrets_failed > 0:
        print(f"  Secrets failed/skipped: {secrets_failed}")

    if secrets_set > 0:
        print("\nKey Vault secrets have been configured successfully!")
    else:
        print("\nWarning: No secrets were set. Please check your .env file and Azure resources.")

    print("=" * 70)

if __name__ == "__main__":
    main()
```

---

## register_ad_app.py

Location: `infra/register_ad_app.py`

### Purpose
Automates Azure AD application registration for authentication.

### Prerequisites
- Azure CLI logged in (`az login`)
- `.env` file with azd environment values
- Static Web App already deployed

### Required Environment Variables
- `AZURE_RESOURCE_GROUP`
- `AZURE_PROJECT_NAME`
- `AZURE_ENV_NAME`
- `AZURE_SUBSCRIPTION_ID`

### HSAP Naming Variables (Optional)
- `AZURE_ORG` - Organization (default: `hsap`)
- `AZURE_VERSION` - Version (default: `v1`)
- `AZURE_REGION` - Region (default: `aue`)

### What It Does
1. Retrieves tenant ID from Azure CLI
2. Gets Static Web App URL for redirect URI (uses HSAP naming: `{org}-{project}-{version}-{env}-{region}-swa`)
3. Creates Azure AD application with `AzureADMyOrg` audience
4. Creates service principal
5. Configures SPA redirect URIs:
   - `http://localhost:5173`
   - `http://localhost:4280`
   - Static Web App URL
6. Appends `AUTH_CLIENT_ID` and `AUTH_TENANT_ID` to `.env`

### Usage
```bash
python infra/register_ad_app.py
```

### Full Source Code (Updated for HSAP Naming Convention)

```python
import subprocess
import sys
import os
import shutil
import json
from dotenv import load_dotenv

def get_hsap_resource_name(resource_suffix):
    """
    Generate resource name following HSAP naming convention.
    Pattern: {org}-{project}-{version}-{env}-{region}-{resource}
    """
    org = os.environ.get("AZURE_ORG", "hsap")
    project = os.environ.get("AZURE_PROJECT_NAME", "saas")
    version = os.environ.get("AZURE_VERSION", "v1")
    env = os.environ.get("AZURE_ENV_NAME", "dev")
    region = os.environ.get("AZURE_REGION", "aue")
    return f"{org}-{project}-{version}-{env}-{region}-{resource_suffix}"

def run_command(command):
    """Runs a command in the shell and returns its output."""
    try:
        # Using shell=True is okay here since we are constructing the commands internally
        # with trusted inputs. On Windows, it's often necessary for 'az' to be found.
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {command}", file=sys.stderr)
        print(f"Stderr: {e.stderr.strip()}", file=sys.stderr)
        sys.exit(1)
    except FileNotFoundError:
        print(f"Error: The command '{command.split()[0]}' was not found.", file=sys.stderr)
        sys.exit(1)

def main():
    """
    Main function to automate AAD App Registration using Azure CLI via Python.
    """
    print("Starting Azure AD application registration (Python script)...")
    print("------------------------------------------")

    # 1. Check for prerequisites
    print("Step 1: Checking prerequisites...")
    if not shutil.which("az"):
        print("Error: The Azure CLI ('az') is not installed or not in the system's PATH.", file=sys.stderr)
        sys.exit(1)

    print(" -> Checking Azure login status...")
    run_command("az account show")
    print(" -> Logged in to Azure.")

    print(" -> Loading environment variables from .env file...")
    load_dotenv()
    required_vars = ["AZURE_RESOURCE_GROUP", "AZURE_PROJECT_NAME", "AZURE_ENV_NAME", "AZURE_SUBSCRIPTION_ID"]
    for var in required_vars:
        if not os.environ.get(var):
            print(f"Error: Environment variable '{var}' is not set.", file=sys.stderr)
            print("Please ensure you have run 'azd env get-values > .env' in the project root.", file=sys.stderr)
            sys.exit(1)
    print(" -> Required environment variables are set.")

    # 2. Get Tenant ID
    print("\nStep 2: Retrieving Tenant ID...")
    tenant_id = run_command("az account show --query tenantId -o tsv")
    print(f" -> Tenant ID found: {tenant_id}")

    # 3. Get Static Web App URL using HSAP naming convention
    print("\nStep 3: Retrieving Static Web App URL...")
    resource_group = os.environ["AZURE_RESOURCE_GROUP"]
    subscription_id = os.environ["AZURE_SUBSCRIPTION_ID"]

    # HSAP naming: {org}-{project}-{version}-{env}-{region}-swa
    swa_name = get_hsap_resource_name("swa")
    print(f" -> Looking for Static Web App: {swa_name}")

    swa_hostname_cmd = f"az staticwebapp show --name \"{swa_name}\" --resource-group \"{resource_group}\" --subscription \"{subscription_id}\" --query defaultHostname -o tsv"
    swa_hostname = run_command(swa_hostname_cmd)

    if not swa_hostname:
        print(f"Error: Could not retrieve the Static Web App hostname for '{swa_name}'.", file=sys.stderr)
        sys.exit(1)

    swa_url = f"https://{swa_hostname}"
    print(f" -> Found Public URL: {swa_url}")

    # 4. Create AAD App and Service Principal
    print("\nStep 4: Creating Azure AD application...")
    # Use project name for app display name
    app_name = os.environ.get("AZURE_PROJECT_NAME", "AzureSaaSStarterKitApp")
    print(f" -> App Name: {app_name}")

    create_app_cmd = f"az ad app create --display-name \"{app_name}\" --sign-in-audience AzureADMyOrg --query appId -o tsv"
    app_id = run_command(create_app_cmd)
    print(f" -> App created successfully with Client ID (appId): {app_id}")

    print("\nStep 5: Creating a Service Principal...")
    run_command(f"az ad sp create --id \"{app_id}\"")
    print(" -> Service Principal created.")

    # 6. Configure Redirect URIs using 'az rest'
    print("\nStep 6: Configuring SPA redirect URIs via MS Graph...")

    # First, get the Object ID from the App ID
    object_id_cmd = f"az ad app show --id {app_id} --query id -o tsv"
    object_id = run_command(object_id_cmd)
    print(f" -> Found App Object ID: {object_id}")

    redirect_uris = [
        "http://localhost:5173",
        "http://localhost:4280",
        swa_url
    ]

    body = {"spa": {"redirectUris": redirect_uris}}
    # Escape quotes for cmd.exe/powershell
    body_json = json.dumps(body).replace('"', r'\"')

    rest_cmd = (
        f'az rest --method PATCH '
        f'--url "https://graph.microsoft.com/v1.0/applications/{object_id}" '
        f'--body "{body_json}"'
    )

    run_command(rest_cmd)
    print(" -> Redirect URIs updated successfully.")
    print("    - " + "\n    - ".join(redirect_uris))

    # 7. Append credentials to .env file
    print("\nStep 7: Appending credentials to .env file...")
    # Ensure the .env file exists, creating it if it doesn't
    if not os.path.exists(".env"):
        print(" -> .env file not found, creating a new one.")
        open(".env", "a").close()

    with open(".env", "a") as f:
        f.write("\n# === Authentication Values (added by register_ad_app.py) ===\n")
        f.write(f"AUTH_CLIENT_ID={app_id}\n")
        f.write(f"AUTH_TENANT_ID={tenant_id}\n")
    print(" -> .env file updated successfully.")

    # 8. Final Output
    print("\n------------------------------------------------------------------")
    print("Azure AD Application Setup Complete!")
    print("   The AUTH_CLIENT_ID and AUTH_TENANT_ID have been saved to your .env file.")
    print("------------------------------------------------------------------")

if __name__ == "__main__":
    main()
```

---

## setup_data.py

Location: `infra/setup_data.py`

### Purpose
Sets up initial data resources after infrastructure deployment.

### Prerequisites
- Infrastructure deployed
- `set_secrets.py` run (for connection strings in Key Vault)
- Azure CLI logged in

### Required Environment Variables
- `AZURE_SUBSCRIPTION_ID`
- `AZURE_RESOURCE_GROUP`
- `COSMOS_DB_ACCOUNT_NAME`
- `KEY_VAULT_NAME`

### What It Does

#### Cosmos DB Setup
- Creates database `SaaSKitDb`
- Creates container `ChatHistory` with `/id` partition key

#### Storage Setup
- Creates container `uploads`
- Uploads `infra/hello_world.txt` as test file

#### Data Seeding
- Inserts sample chat history documents into Cosmos DB

### Usage
```bash
python infra/setup_data.py
```

### Full Source Code

```python
import os
import sys
import uuid
from dotenv import load_dotenv
from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient
from azure.mgmt.cosmosdb import CosmosDBManagementClient
from azure.cosmos import CosmosClient
from azure.storage.blob import BlobServiceClient
from azure.core.exceptions import ResourceExistsError, ResourceNotFoundError

def main():
    """
    Main function to set up initial data resources.
    - Creates a Cosmos DB database and container.
    - Seeds the Cosmos DB container with sample data.
    - Creates an Azure Storage container and uploads a file.
    """
    # --- Load environment variables from .env file ---
    print("Loading environment variables from .env file...")
    load_dotenv()
    print(" -> .env file loaded.")

    # --- Configuration ---
    COSMOS_DB_DATABASE_NAME = "SaaSKitDb"
    COSMOS_DB_CONTAINER_NAME = "ChatHistory"
    STORAGE_CONTAINER_NAME = "uploads"
    DUMMY_FILE_PATH = "infra/hello_world.txt"

    # --- Check for required environment variables ---
    required_vars = {
        "AZURE_SUBSCRIPTION_ID": "The Azure subscription ID.",
        "AZURE_RESOURCE_GROUP": "The Azure resource group name.",
        "COSMOS_DB_ACCOUNT_NAME": "The Cosmos DB account name.",
        "KEY_VAULT_NAME": "The name of the Azure Key Vault."
    }
    env_vars = {}
    missing_vars = False
    for var, desc in required_vars.items():
        value = os.environ.get(var)
        if not value:
            print(f"Error: Environment variable {var} is not set. {desc}", file=sys.stderr)
            missing_vars = True
        env_vars[var] = value

    if missing_vars:
        print("\nError: Missing required environment variables.", file=sys.stderr)
        print("Please ensure the .env file is present and complete.", file=sys.stderr)
        sys.exit(1)

    # --- Initialize Azure Clients ---
    print("Authenticating with Azure...")
    try:
        credential = DefaultAzureCredential()
        credential.get_token("https://management.azure.com/.default")
    except Exception as e:
        print("Authentication failed. Please ensure you are logged into Azure via 'az login'.", file=sys.stderr)
        sys.exit(1)
    print(" -> Authentication successful.")

    subscription_id = env_vars["AZURE_SUBSCRIPTION_ID"]
    resource_group = env_vars["AZURE_RESOURCE_GROUP"]
    cosmos_account_name = env_vars["COSMOS_DB_ACCOUNT_NAME"]
    key_vault_name = env_vars["KEY_VAULT_NAME"]

    # --- Setup Cosmos DB ---
    print("\n--- Setting up Cosmos DB ---")
    try:
        cosmos_mgmt_client = CosmosDBManagementClient(credential, subscription_id)
        setup_cosmos_db(
            cosmos_mgmt_client,
            resource_group,
            cosmos_account_name,
            COSMOS_DB_DATABASE_NAME,
            COSMOS_DB_CONTAINER_NAME
        )
    except Exception as e:
        print(f"An error occurred during Cosmos DB setup: {e}", file=sys.stderr)

    # --- Setup Azure Storage and Seed Cosmos DB ---
    # This is grouped because both need secrets from Key Vault
    print("\n--- Setting up Storage and Seeding Data ---")
    try:
        key_vault_uri = f"https://{key_vault_name}.vault.azure.net"
        secret_client = SecretClient(vault_url=key_vault_uri, credential=credential)

        setup_storage(
            secret_client,
            STORAGE_CONTAINER_NAME,
            DUMMY_FILE_PATH
        )

        seed_cosmos_data(
            secret_client,
            COSMOS_DB_DATABASE_NAME,
            COSMOS_DB_CONTAINER_NAME
        )

    except Exception as e:
        print(f"An error occurred during Storage setup or Data Seeding: {e}", file=sys.stderr)


    print("\nData setup script finished.")


def setup_cosmos_db(client, resource_group, account_name, db_name, container_name):
    """Creates a Cosmos DB SQL database and container."""
    print(f"Creating/updating Cosmos DB database '{db_name}'...")
    db_poller = client.sql_resources.begin_create_update_sql_database(
        resource_group_name=resource_group,
        account_name=account_name,
        database_name=db_name,
        create_update_sql_database_parameters={"resource": {"id": db_name}, "options": {}}
    )
    db_poller.result()
    print(f" -> Database '{db_name}' is ready.")

    print(f"Creating/updating Cosmos DB container '{container_name}'...")
    container_poller = client.sql_resources.begin_create_update_sql_container(
        resource_group_name=resource_group,
        account_name=account_name,
        database_name=db_name,
        container_name=container_name,
        create_update_sql_container_parameters={
            "resource": {
                "id": container_name,
                "partition_key": {"paths": ["/id"], "kind": "Hash"}
            },
            "options": {}
        }
    )
    container_poller.result()
    print(f" -> Container '{container_name}' is ready.")


def setup_storage(secret_client, container_name, file_path):
    """Creates a storage container and uploads a file."""
    print("Fetching storage connection string from Key Vault...")
    try:
        storage_connection_secret = secret_client.get_secret("STORAGE-CONNECTION-STRING")
        storage_connection_string = storage_connection_secret.value
        print(" -> Connection string fetched successfully.")
    except ResourceNotFoundError:
        print("Error: 'STORAGE-CONNECTION-STRING' not found in Key Vault.", file=sys.stderr)
        print("Please run the `set_secrets.py` script first.", file=sys.stderr)
        return

    blob_service_client = BlobServiceClient.from_connection_string(storage_connection_string)

    print(f"Creating storage container '{container_name}'...")
    try:
        container_client = blob_service_client.get_container_client(container_name)
        container_client.create_container()
        print(f" -> Container '{container_name}' created.")
    except ResourceExistsError:
        print(f" -> Container '{container_name}' already exists.")

    print(f"Uploading file '{file_path}'...")
    try:
        blob_client = blob_service_client.get_blob_client(container=container_name, blob=os.path.basename(file_path))
        with open(file_path, "rb") as data:
            blob_client.upload_blob(data, overwrite=True)
        print(f" -> File '{os.path.basename(file_path)}' uploaded successfully.")
    except FileNotFoundError:
        print(f"Error: Dummy file not found at '{file_path}'", file=sys.stderr)
    except Exception as e:
        print(f"An error occurred during file upload: {e}", file=sys.stderr)


def seed_cosmos_data(secret_client, db_name, container_name):
    """Seeds the Cosmos DB container with sample data."""
    print("Fetching Cosmos DB connection string from Key Vault...")
    try:
        cosmos_connection_secret = secret_client.get_secret("COSMOS-CONNECTION-STRING")
        cosmos_connection_string = cosmos_connection_secret.value
        print(" -> Connection string fetched successfully.")
    except ResourceNotFoundError:
        print("Error: 'COSMOS-CONNECTION-STRING' not found in Key Vault.", file=sys.stderr)
        print("Please run the `set_secrets.py` script first.", file=sys.stderr)
        return

    print("Seeding Cosmos DB with sample data...")
    try:
        cosmos_client = CosmosClient.from_connection_string(cosmos_connection_string)
        database_client = cosmos_client.get_database_client(db_name)
        container_client = database_client.get_container_client(container_name)

        sample_chats = [
            {
                "id": str(uuid.uuid4()),
                "userId": "user1",
                "sessionId": "session1",
                "messages": [
                    {"role": "user", "content": "Hello, who are you?"},
                    {"role": "assistant", "content": "I am a helpful AI assistant."}
                ]
            },
            {
                "id": str(uuid.uuid4()),
                "userId": "user2",
                "sessionId": "session2",
                "messages": [
                    {"role": "user", "content": "What is the weather like today?"},
                    {"role": "assistant", "content": "I'm sorry, I don't have real-time weather information."}
                ]
            }
        ]

        for chat in sample_chats:
            container_client.upsert_item(body=chat)

        print(f" -> Successfully seeded {len(sample_chats)} documents into '{container_name}'.")

    except Exception as e:
        print(f"An error occurred during Cosmos DB data seeding: {e}", file=sys.stderr)


if __name__ == "__main__":
    main()
```
