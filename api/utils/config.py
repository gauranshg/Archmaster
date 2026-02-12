"""
Configuration management for Azure Functions.

Loads settings from environment variables and Key Vault.
"""

import os
import logging
from typing import Optional
from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient
from azure.cosmos import CosmosClient
from azure.storage.blob import BlobServiceClient


logger = logging.getLogger(__name__)


def get_masked_string(s: str) -> str:
    """
    Returns a masked version of a string for logging.

    Args:
        s: String to mask

    Returns:
        Masked string showing first 4 characters only
    """
    if not s or len(s) < 5:
        return s
    return f"{s[:4]}{'*' * (len(s) - 4)}"


def get_config() -> dict:
    """
    Load configuration from environment variables.

    Returns:
        Dictionary containing all configuration values
    """
    return {
        "key_vault_name": os.environ.get("KEY_VAULT_NAME"),
        "cosmos_connection_string": os.environ.get("COSMOS_CONNECTION_STRING"),
        "storage_connection_string": os.environ.get("AzureWebJobsStorage"),
        "database_name": os.environ.get("DATABASE_NAME", "architecture-platform"),
    }


def get_secret(secret_name_kv: str, secret_name_env: str, key_vault_name: Optional[str] = None) -> Optional[str]:
    """
    Retrieve a secret from environment variables or Key Vault.

    Args:
        secret_name_kv: Secret name in Key Vault (with hyphens)
        secret_name_env: Environment variable name (with underscores)
        key_vault_name: Key Vault name (optional, uses env var if not provided)

    Returns:
        Secret value or None if not found
    """
    # Try environment variable first
    secret_value = os.environ.get(secret_name_env)
    if secret_value:
        logger.info(f"Found secret '{secret_name_env}' in environment variables")
        return secret_value

    # Try Key Vault
    if not key_vault_name:
        key_vault_name = os.environ.get("KEY_VAULT_NAME")

    if not key_vault_name:
        logger.warning(f"Key Vault name not configured")
        return None

    try:
        credential = DefaultAzureCredential()
        key_vault_uri = f"https://{key_vault_name}.vault.azure.net"
        secret_client = SecretClient(vault_url=key_vault_uri, credential=credential)

        logger.info(f"Retrieving secret '{secret_name_kv}' from Key Vault")
        kv_secret = secret_client.get_secret(secret_name_kv)
        return kv_secret.value
    except Exception as e:
        logger.warning(f"Could not retrieve secret '{secret_name_kv}' from Key Vault: {e}")
        return None


def get_cosmos_client() -> Optional[CosmosClient]:
    """
    Create and return a Cosmos DB client.

    Returns:
        CosmosClient instance or None if connection string not found
    """
    conn_str = get_secret("COSMOS-CONNECTION-STRING", "COSMOS_CONNECTION_STRING")
    if not conn_str:
        logger.error("Cosmos DB connection string not found")
        return None

    try:
        client = CosmosClient.from_connection_string(conn_str)
        logger.info("Cosmos DB client created successfully")
        return client
    except Exception as e:
        logger.error(f"Failed to create Cosmos DB client: {e}")
        return None


def get_blob_client() -> Optional[BlobServiceClient]:
    """
    Create and return a Blob Storage client.

    Returns:
        BlobServiceClient instance or None if connection string not found
    """
    conn_str = get_secret("STORAGE-CONNECTION-STRING", "AzureWebJobsStorage")
    if not conn_str:
        logger.error("Storage connection string not found")
        return None

    try:
        client = BlobServiceClient.from_connection_string(conn_str)
        logger.info("Blob Storage client created successfully")
        return client
    except Exception as e:
        logger.error(f"Failed to create Blob Storage client: {e}")
        return None
