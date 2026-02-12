# Azure SaaS Starter Kit

Welcome to the Azure SaaS Starter Kit! This project provides a comprehensive foundation for building and deploying modern web applications on Microsoft Azure. It is designed to accelerate development by providing a pre-configured setup for a React frontend, a Python Functions backend, and a suite of common Azure services.

The architecture is designed around a **hybrid deployment model**:
-   **Backend Infrastructure**: Deployed via the Azure Developer CLI (`azd`).
-   **Frontend Application**: Deployed via a GitHub Actions CI/CD pipeline.

## How It Works

This setup provides a clean separation of concerns:

1.  You run `azd up` once to provision all the long-lived backend resources (databases, Function App, Key Vault, etc.) and deploy your API code.
2.  You then connect your GitHub repository to the frontend infrastructure by setting a few secrets.
3.  From that point on, every `git push` to your `main` branch automatically builds and deploys the latest version of your frontend code.

## Prerequisites

Before you begin, ensure you have the following tools installed:
-   [Azure Developer CLI (`azd`)](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/install-azd)
-   [Node.js (LTS version)](https://nodejs.org/) (for the React frontend)
-   [Python 3.11+](https://www.python.org/downloads/) (for the Functions backend)
-   [Azure Functions Core Tools](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local)
-   A GitHub account.

---

## Deployment Instructions

Follow these steps to get your application up and running.

### Step 1: Provision Backend Infrastructure (`azd up`)

This step uses the Azure Developer CLI to create all the necessary backend resources in your Azure subscription.

1.  **Login to Azure:**
    Open a terminal, navigate to the project root, and run the following command. This will open a browser window for you to sign in to your Azure account.
    ```bash
    azd auth login
    ```

2.  **Provision the Infrastructure:**
    Run the `up` command. `azd` will prompt you for an environment name, subscription, location, and the SQL administrator password.
    ```bash
    azd up
    ```
    This command provisions all the Azure resources defined in the `/infra` folder. Note that the API code is **not** deployed by this step.

### Step 2: Configure and Deploy the Frontend (CI/CD)

This step connects your repository to Azure and deploys the frontend via a GitHub Actions pipeline.

1.  **Get the API URI:**
    After `azd up` is complete, get the URI for your deployed Function App by running:
    ```bash
    azd env get-value API_URI
    ```
    Copy the output value.

2.  **Go to your GitHub Repository Settings:**
    Navigate to your repository on GitHub, and go to `Settings` > `Secrets and variables` > `Actions`.

3.  **Create Repository Secrets:**
    You must create two new repository secrets:
    -   `AZURE_STATIC_WEB_APPS_API_TOKEN`: Leave this blank for now. The first pipeline run will provide the correct value.
    -   `API_URI`: Paste the `API_URI` value you just copied.

4.  **Trigger the GitHub Action:**
    Commit and push a change to trigger the workflow.
    ```bash
    git commit -m "Initial commit to trigger CI/CD" --allow-empty
    git push
    ```

5.  **Update the Deployment Token:**
    The first workflow run will fail. Copy the deployment token from the workflow log and update the `AZURE_STATIC_WEB_APPS_API_TOKEN` secret in GitHub. Re-run the failed job, which should now succeed.

### Step 3: Prepare Local Environment File (`.env`)

The automation scripts rely on a `.env` file to coordinate values.

1.  **Generate `.env` file from Azure:**
    Run the following command to populate a new `.env` file with the outputs from your Azure deployment.
    ```bash
    azd env get-values > .env
    ```

2.  **Add SQL Password to `.env`:**
    Open the newly created `.env` file in a text editor. Add the following line, replacing `<your-sql-password>` with the administrator password you provided during `azd up`.
    ```
    SQL_ADMIN_PASSWORD="<your-sql-password>"
    ```

### Step 4: Create and Configure Azure AD App

Run the app registration script. It will automatically find your `.env` file, create the AAD application, and append the new `AUTH_CLIENT_ID` and `AUTH_TENANT_ID` to your `.env` file.

```bash
python infra/register_ad_app.py
```

### Step 5: Populate Key Vault Secrets

Now that your `.env` file is complete, run the `set_secrets.py` script. It will read all the necessary values from `.env` and configure your Azure Key Vault automatically.

1.  **Install Python Dependencies:**
    If you haven't already, install the required libraries:
    ```bash
    pip install -r infra/requirements.txt
    ```

2.  **Run the script:**
    ```bash
    python infra/set_secrets.py
    ```
    The script will use the values in `.env` to set all required secrets in Key Vault.

### Step 6: Set Up Initial Data (Optional)

After your infrastructure is provisioned and secrets are set, you can run an additional script to set up the initial data structures in your databases.
```bash
python infra/setup_data.py
```
This step is idempotent, meaning you can safely run it multiple times.

## Project Structure
-   `/.github`: Contains the CI/CD workflow for the frontend.
-   `/src/api`: Contains the backend Python Azure Functions code.
-   `/src/frontend`: Contains the React frontend application.
-   `/infra`: Contains the Bicep files for the backend infrastructure.
-   `azure.yaml`: The main configuration file for `azd`.

## Features

This starter kit comes with a few built-in features to help you monitor and manage your application.

### Health Check Endpoint

-   **API Endpoint:** `/api/health`
    -   A backend endpoint that checks the status of all connected Azure services (Key Vault, SQL, Cosmos DB, etc.) and returns a JSON response with their health status.
-   **Frontend Page:** `/status`
    -   A simple page that consumes the `/api/health` endpoint and displays the status of each service, providing a quick, at-a-glance overview of the system's health.
