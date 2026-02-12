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
