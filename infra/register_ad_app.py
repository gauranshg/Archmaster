import subprocess
import sys
import os
import shutil
import json
from dotenv import load_dotenv

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

    # 3. Get Static Web App URL
    print("\nStep 3: Retrieving Static Web App URL...")
    project_name = os.environ["AZURE_PROJECT_NAME"]
    env_name = os.environ["AZURE_ENV_NAME"]
    resource_group = os.environ["AZURE_RESOURCE_GROUP"]
    subscription_id = os.environ["AZURE_SUBSCRIPTION_ID"]
    # Correcting the SWA name generation based on user feedback
    swa_name = f"{project_name}-{env_name}-swa"

    swa_hostname_cmd = f"az staticwebapp show --name \"{swa_name}\" --resource-group \"{resource_group}\" --subscription \"{subscription_id}\" --query defaultHostname -o tsv"
    swa_hostname = run_command(swa_hostname_cmd)

    if not swa_hostname:
        print(f"Error: Could not retrieve the Static Web App hostname for '{swa_name}'.", file=sys.stderr)
        sys.exit(1)

    swa_url = f"https://{swa_hostname}"
    print(f" -> Found Public URL: {swa_url}")

    # 4. Create AAD App and Service Principal
    print("\nStep 4: Creating Azure AD application...")
    app_name = os.environ.get("AZURE_PROJECT_NAME", "CustomArchitecturePlatform")
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
    print("✅ Azure AD Application Setup Complete!")
    print("   The AUTH_CLIENT_ID and AUTH_TENANT_ID have been saved to your .env file.")
    print("------------------------------------------------------------------")

if __name__ == "__main__":
    main()
