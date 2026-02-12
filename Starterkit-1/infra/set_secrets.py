import os
import sys
from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient
from azure.mgmt.cosmosdb import CosmosDBManagementClient
from azure.mgmt.web import WebSiteManagementClient
from azure.mgmt.cognitiveservices import CognitiveServicesManagementClient
from azure.core.exceptions import ResourceNotFoundError
from dotenv import load_dotenv

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
        print("❌ Error: .env file not found. Please run 'azd env get-values > .env' first.", file=sys.stderr)
        sys.exit(1)

    # Try multiple encodings
    encodings = ['utf-8', 'utf-16', 'utf-16-le', 'latin-1', 'cp1252']
    loaded = False
    for encoding in encodings:
        try:
            load_dotenv(encoding=encoding)
            print(f"✓ .env file loaded successfully with {encoding} encoding.")
            loaded = True
            break
        except UnicodeDecodeError:
            continue
        except Exception as e:
            print(f"⚠ Warning: Error loading .env with {encoding}: {e}")
            continue

    if not loaded:
        print("❌ Error: Could not load .env file with any supported encoding.", file=sys.stderr)
        sys.exit(1)
    print("✓ .env file loaded successfully.")

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
            print(f"  ❌ Missing: {var} - {desc}", file=sys.stderr)
            missing_vars.append(var)
        else:
            print(f"  ✓ Found: {var}")
            env_vars[var] = value

    if missing_vars:
        print(f"\n❌ Error: Missing {len(missing_vars)} required environment variable(s).", file=sys.stderr)
        print("Please ensure your .env file contains these variables.", file=sys.stderr)
        sys.exit(1)

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

    print("\n[3/5] Checking for optional environment variables...")
    for var, desc in optional_vars.items():
        value = os.getenv(var)
        if value:
            env_vars[var] = value
            print(f"  ✓ Found: {var}")
        else:
            print(f"  ⚠ Optional (not found): {var} - {desc}")

    # 3. Initialize Azure Clients
    print("\n[4/5] Authenticating with Azure...")
    try:
        credential = DefaultAzureCredential()
        credential.get_token("https://management.azure.com/.default")
        print("✓ Authentication successful.")
    except Exception as e:
        print("❌ Authentication failed. Please ensure you are logged into Azure via 'az login'.", file=sys.stderr)
        print(f"Error details: {e}", file=sys.stderr)
        sys.exit(1)

    # --- Key Vault Client ---
    key_vault_name = env_vars["KEY_VAULT_NAME"]
    key_vault_uri = f"https://{key_vault_name}.vault.azure.net"

    try:
        secret_client = SecretClient(vault_url=key_vault_uri, credential=credential)
        print(f"✓ Connected to Key Vault: {key_vault_name}")
    except Exception as e:
        print(f"❌ Failed to connect to Key Vault: {e}", file=sys.stderr)
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
                print(f"  ❌ Cannot set required secret '{secret_name}': value is empty")
                secrets_failed += 1
            else:
                print(f"  ⊝ Skipping '{secret_name}': value not available")
            return False

        try:
            secret_client.set_secret(secret_name, secret_value)
            print(f"  ✓ Set secret: '{secret_name}'")
            secrets_set += 1
            return True
        except Exception as e:
            print(f"  ❌ Failed to set secret '{secret_name}': {e}")
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
            print(f"  ⚠ Warning: Could not fetch Cosmos DB connection string: {e}")
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
            print(f"  ⚠ Warning: Could not fetch Cosmos DB primary key: {e}")
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
            print(f"  ⚠ Warning: Could not fetch Azure OpenAI API key: {e}")
            secrets_failed += 1

    # Set Azure OpenAI Endpoint
    if env_vars.get("AZURE_OPENAI_ENDPOINT"):
        set_secret("AZURE-OPENAI-ENDPOINT", env_vars["AZURE_OPENAI_ENDPOINT"], required=True)

    # Get secrets from Function App Settings
    function_app_name = None
    if env_vars.get("FUNCTION_APP_NAME"):
        function_app_name = env_vars["FUNCTION_APP_NAME"]
    elif env_vars.get("AZURE_PROJECT_NAME") and env_vars.get("AZURE_ENV_NAME"):
        function_app_name = f"{env_vars['AZURE_PROJECT_NAME']}-{env_vars['AZURE_ENV_NAME']}-func"

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
            print(f"  ⚠ Warning: Could not fetch Function App settings: {e}")

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
    print("📊 Summary:")
    print(f"  ✓ Secrets successfully set: {secrets_set}")
    if secrets_failed > 0:
        print(f"  ⚠ Secrets failed/skipped: {secrets_failed}")

    if secrets_set > 0:
        print("\n✅ Key Vault secrets have been configured successfully!")
    else:
        print("\n⚠ Warning: No secrets were set. Please check your .env file and Azure resources.")

    print("=" * 70)

if __name__ == "__main__":
    main()
