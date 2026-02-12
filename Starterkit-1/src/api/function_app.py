import azure.functions as func
import datetime
import json
import logging
import os
import time

from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient
from azure.cosmos import CosmosClient
import pyodbc
from azure.storage.blob import BlobServiceClient
import requests

app = func.FunctionApp()

def get_masked_string(s):
    """Returns a masked version of a string."""
    if not s or len(s) < 5:
        return s
    return f"{s[:4]}{'*' * (len(s) - 4)}"

@app.route(route="test_endpoint", auth_level=func.AuthLevel.ANONYMOUS)
def test_endpoint(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')
    now = datetime.datetime.now()
    return func.HttpResponse(
        body=json.dumps({'time': now.strftime('%H:%M:%S')}),
        status_code=200,
        headers={'Content-Type': 'application/json'}
    )

@app.route(route="health", auth_level=func.AuthLevel.ANONYMOUS)
def health_check(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a health check request.')

    statuses = {}
    secret_client = None

    # --- Bootstrap: Check for Key Vault Name and create client ---
    key_vault_name = os.environ.get("KEY_VAULT_NAME")
    if not key_vault_name:
        statuses["key_vault_status"] = "Configuration Missing"
        statuses["key_vault_name"] = "Not configured"
    else:
        statuses["key_vault_name"] = get_masked_string(key_vault_name)
        try:
            credential = DefaultAzureCredential()
            key_vault_uri = f"https://{key_vault_name}.vault.azure.net"
            secret_client = SecretClient(vault_url=key_vault_uri, credential=credential)
            list(secret_client.list_properties_of_secrets())
            statuses["key_vault_status"] = "Healthy"
        except Exception as e:
            logging.error(f"Key Vault health check failed: {e}")
            statuses["key_vault_status"] = "Unhealthy"
            secret_client = None

    # --- Helper to get secrets ---
    def get_secret(secret_name_kv, secret_name_env):
        secret_value = os.environ.get(secret_name_env)
        if secret_value:
            logging.info(f"Found secret '{secret_name_env}' in environment variables.")
            return secret_value

        if secret_client:
            try:
                logging.info(f"Secret '{secret_name_env}' not in env, trying Key Vault with name '{secret_name_kv}'...")
                kv_secret = secret_client.get_secret(secret_name_kv)
                return kv_secret.value
            except Exception:
                logging.warning(f"Could not retrieve secret '{secret_name_kv}' from Key Vault.")
                return None
        return None

    # --- Service Checks ---
    # Note: Key Vault name in infra/set_secrets.py uses hyphens. Env vars from App Settings replace these with underscores.
    # The get_secret function checks both.

    # 2. Check Azure SQL
    try:
        sql_conn_str = get_secret("SQL-CONNECTION-STRING", "SQL_CONNECTION_STRING")
        if not sql_conn_str:
            statuses["azure_sql_status"] = "Configuration Missing"
        else:
            with pyodbc.connect(sql_conn_str, timeout=10) as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT 1")
                cursor.fetchone()
            statuses["azure_sql_status"] = "Healthy"
    except Exception as e:
        logging.error(f"Azure SQL health check failed: {e}")
        statuses["azure_sql_status"] = "Unhealthy"

    # 3. Check Cosmos DB
    try:
        cosmos_conn_str = get_secret("COSMOS-CONNECTION-STRING", "COSMOS_CONNECTION_STRING")
        if not cosmos_conn_str:
            statuses["cosmos_db_status"] = "Configuration Missing"
        else:
            client = CosmosClient.from_connection_string(cosmos_conn_str)
            list(client.list_databases(max_item_count=1))
            statuses["cosmos_db_status"] = "Healthy"
    except Exception as e:
        logging.error(f"Cosmos DB health check failed: {e}")
        statuses["cosmos_db_status"] = "Unhealthy"

    # 4. Check Azure Storage
    try:
        storage_conn_str = get_secret("STORAGE-CONNECTION-STRING", "AzureWebJobsStorage")
        if not storage_conn_str:
             statuses["azure_storage_status"] = "Configuration Missing"
        else:
            blob_service_client = BlobServiceClient.from_connection_string(storage_conn_str)
            list(blob_service_client.list_containers(max_results=1))
            statuses["azure_storage_status"] = "Healthy"
    except Exception as e:
        logging.error(f"Azure Storage health check failed: {e}")
        statuses["azure_storage_status"] = "Unhealthy"

    # 5. Check Dynamics 365 F&O (OData)
    try:
        dynamics_endpoint = get_secret("DYNAMICS-FO-ENDPOINT", "DYNAMICS_FO_ENDPOINT")
        if not dynamics_endpoint:
            statuses["dynamics_365_fo_status"] = "Configuration Missing"
        else:
            response = requests.get(f"{dynamics_endpoint}/data/$metadata", timeout=10)
            response.raise_for_status()
            statuses["dynamics_365_fo_status"] = "Healthy"
    except Exception as e:
        logging.error(f"Dynamics 365 F&O health check failed: {e}")
        statuses["dynamics_365_fo_status"] = "Unhealthy"

    # 6. Check Azure Communication Service
    comm_conn_str = get_secret("COMMUNICATION-SERVICE-CONNECTION-STRING", "COMMUNICATION_SERVICE_CONNECTION_STRING")
    if comm_conn_str:
        statuses["communication_service_status"] = "Configured"
    else:
        statuses["communication_service_status"] = "Configuration Missing"

    return func.HttpResponse(
        body=json.dumps(statuses),
        status_code=200,
        headers={'Content-Type': 'application/json'}
    )
