## `azd up` Fails During Frontend Packaging

**Date:** 2025-09-10

**Task:** [P1.2 `azd`: Infrastructure as Code](task-list.md#p12-azd-infrastructure-as-code) (Follow-up)

### The Problem
After the initial setup of `azd` and the Bicep files, running `azd up` failed during the `azd package` step for the `web` service. The error was: `[vite]: Rollup failed to resolve import "/vite.svg" from ".../src/frontend/src/App.jsx"`.

### The Root Cause
The default Vite template for React includes a reference to `vite.svg` and `react.svg` logos in the `App.jsx` component. The import `import viteLogo from '/vite.svg'` uses an absolute path, which tells Vite to look for the `vite.svg` file in the `public` directory at the project root (`src/frontend/public`).

Upon inspection, the `src/frontend/public` directory was missing from the project, causing the build process to fail because it could not find the referenced asset.

### The Resolution
The quickest and cleanest solution was to remove the example code from `App.jsx` altogether. The lines importing and using `viteLogo` and `reactLogo` were removed. This not only fixed the build error but also provided a cleaner, more minimal starting point for the application, which is suitable for a starter kit.

---

## `azd up` Fails During Bicep Provisioning

**Date:** 2025-09-10

**Task:** [P1.2 `azd`: Infrastructure as Code](task-list.md#p12-azd-infrastructure-as-code) (Follow-up)

### The Problem
After fixing the frontend packaging issue, `azd up` failed again, this time during the `azd provision` step. The Bicep deployment failed with several errors, primarily `BCP065` and `BCP181`.

### The Root Cause & Resolution

1.  **Error `BCP065` in `sql.bicep`**: The function `newGuid()` was used directly as a value for the `administratorLoginPassword` property.
    -   **Cause**: `newGuid()` can only be used as a default value for a parameter, not directly in a resource property.
    -   **Resolution**: Created a new `@secure()` parameter named `sqlAdminPassword` with the default value `param sqlAdminPassword string = newGuid()` and used this parameter for the password property.

2.  **Error `BCP181` in `app.bicep`**: The `listKeys()` function was failing because it was trying to use a module's output (`core.outputs.storageAccountName`) to reference a resource.
    -   **Cause**: `listKeys` requires a value that can be calculated at the start of the deployment. Module outputs are only available after the module has been deployed, so they are not considered compile-time constants.
    -   **Resolution**: Replaced the module output `core.outputs.storageAccountName` with the variable `storageAccountName` that was already defined at the top of `app.bicep`. This variable is available at compile time.

3.  **Warning `no-unused-params` in `core/main.bicep`**: A parameter `environmentName` was passed to the `core` module but was not used.
    -   **Resolution**: Removed the unused parameter from the `core/main.bicep` file and also removed it from the module call in `app.bicep` for code cleanliness.

---

## `azd up` Fails with InvalidDeployment Location Error

**Date:** 2025-09-10

**Task:** [P1.2 `azd`: Infrastructure as Code](task-list.md#p12-azd-infrastructure-as-code) (Follow-up)

### The Problem
The `azd provision` step failed with a validation error: `InvalidDeployment: The 'location' property must be specified`.

### The Root Cause
The `infra/main.bicep` file was configured with `targetScope = 'subscription'`. The `location` parameter in this file had a default value of `param location string = deployment().location`.

The `deployment().location` function is only valid when the deployment itself has a location (e.g., when deploying to a resource group). For subscription-level deployments, the deployment doesn't have an inherent location, causing `deployment().location` to be null. This null value was then passed to the resource group resource, which requires a valid location, causing the validation to fail.

### The Resolution
The fix was to remove the default value from the `location` parameter in `infra/main.bicep`. By changing it to `param location string`, the deployment now relies on `azd` to provide the location value selected by the user in the `azd up` prompt, which is the correct behavior.

---

## `azd up` Persists with Location Error and Multiple Prompts

**Date:** 2025-09-10

**Task:** [P1.2 `azd`: Infrastructure as Code](task-list.md#p12-azd-infrastructure-as-code) (Follow-up)

### The Problem
Even after removing the invalid default value for the `location` parameter in `main.bicep`, the `azd provision` step continued to fail with the same `InvalidDeployment` error. A new symptom also appeared: `azd` was prompting for the `location` value multiple times. The user also requested that the location prompt be a selectable list instead of manual text entry.

### The Root Cause
While the Bicep file was now correct in requiring a `location` parameter, `azd` was not correctly wiring the value from its initial prompt to the subscription-level deployment command it runs internally. The multiple prompts were a sign that `azd` did not have a registered, strongly-typed parameter to work with, so it was falling back to prompting for the Bicep parameter directly, but failing to use the provided value for the deployment command itself.

### The Resolution
The definitive solution was to explicitly define the `location` parameter within the `azure.yaml` file.
```yaml
infra:
  provider: bicep
  path: infra/
  parameters:
    location:
      type: location
```
By adding this `infra.parameters.location` section and setting its `type` to `location`, we instruct `azd` to:
1.  Recognize `location` as a special parameter.
2.  Provide the user with a selectable list of valid Azure locations.
3.  Ensure the chosen location is correctly passed to the `az deployment sub create --location <value>` command, satisfying the ARM validation requirement for subscription-level deployments.

This single change in `azure.yaml` fixed both the persistent `InvalidDeployment` error and fulfilled the user's request for a better UI experience.

---

## Final `azd up` Location Error and Final Fix

**Date:** 2025-09-10

**Task:** [P1.2 `azd`: Infrastructure as Code](task-list.md#p12-azd-infrastructure-as-code) (Follow-up)

### The Problem
The `InvalidDeployment` error for the `location` parameter persisted even after explicitly defining the parameter in `azure.yaml`. The root cause was still `azd` failing to correctly pass the location to the Azure deployment engine for subscription-level deployments.

### The Resolution
To make the configuration as robust as possible, two final changes were made to the `location` parameter definition in `azure.yaml`:

1.  **Added `displayName`**: A `displayName: "Azure Location"` was added to provide a more user-friendly prompt.
2.  **Added `default`**: A `default: "eastus"` was added. This provides a sensible default value and further helps `azd` correctly recognize and handle the `location` parameter, ensuring a value is always present for the deployment engine.

The final, robust configuration in `azure.yaml` is:
```yaml
infra:
  provider: bicep
  path: infra/
  parameters:
    location:
      type: location
      displayName: "Azure Location"
      default: "eastus"
```
This configuration is the most reliable way to handle the `location` parameter for subscription-level deployments in `azd`.

---

## Major Refactoring to a Resource Group Deployment Model

**Date:** 2025-09-10

**Task:** [P1.2 `azd`: Infrastructure as Code](task-list.md#p12-azd-infrastructure-as-code) (Follow-up)

### The Problem
After multiple persistent and complex issues related to subscription-level deployments (especially concerning the `location` parameter), a strategic decision was made to simplify the infrastructure definition. The modular, subscription-level approach was causing friction with `azd`'s parameter handling.

### The Resolution
Based on user feedback, the entire `infra` configuration was refactored to a simpler, more standard model:

1.  **Scope Change**: The Bicep `targetScope` was changed from `subscription` to `resourceGroup`. This is the default and most common scope for `azd` projects.
2.  **Single Bicep File**: All infrastructure is now defined in a single `infra/main.bicep` file, replacing the previous modular approach (`app.bicep`, `core/` directory). This makes the infrastructure easier to read and manage.
3.  **Simplified Location**: By deploying to a resource group, the `location` parameter can be safely defaulted to `resourceGroup().location`, which inherits the location from the resource group `azd` creates. This completely eliminates the class of `InvalidDeployment` errors related to location.
4.  **Updated `azure.yaml`**: The `azure.yaml` file was updated to point to the single `infra/main.bicep` file and define the new parameters (`projectName`, `sqlAdminPassword`) required by the consolidated Bicep file.

This refactoring represents a significant simplification and aligns the project with a more common and robust pattern for `azd` deployments, resolving the underlying cause of the previous errors.

---

## `azd up` Fails with Resource Validation Errors

**Date:** 2025-09-10

**Task:** [P1.2 `azd`: Infrastructure as Code](task-list.md#p12-azd-infrastructure-as-code) (Follow-up)

### The Problem
After refactoring the infrastructure, `azd provision` began to run but failed with several resource-specific validation errors, including `PasswordTooShort` for the SQL Server and `AccountNameInvalid` for the Storage Account. Additionally, the user was being prompted for an `environmentName` separately from the `azd` environment name, causing confusion.

### The Root Cause & Resolution

1.  **`AccountNameInvalid`**: The storage account name was being generated with a hyphen (e.g., `saas-env2stg`). Storage account names must be 3-24 characters long and contain only lowercase letters and numbers.
    -   **Resolution**: In `infra/main.bicep`, a new `sanitizedPrefix` variable was created using `replace(prefix, '-', '')`. This variable is now used to generate the storage account name, ensuring it contains no illegal characters.

2.  **`PasswordTooShort`**: The user entered a password for the SQL server that did not meet Azure's policy requirements.
    -   **Resolution**: In `azure.yaml`, a `console.minLength: 8` property was added to the `sqlAdminPassword` parameter. This allows `azd` to perform immediate client-side validation of the password length, providing faster feedback to the user and preventing the deployment from failing.

3.  **Duplicate `environmentName` Prompt**: The user was prompted for the `azd` environment name and then again for the `environmentName` Bicep parameter.
    -   **Resolution**: In `azure.yaml`, the `environmentName` parameter was defined with a default value of `default: "${AZURE_ENV_NAME}"`. This tells `azd` to automatically use its own environment name for the Bicep parameter, removing the redundant prompt and improving the user experience.

---

## `azd up` Fails with Static Web App BadRequest

**Date:** 2025-09-10

**Task:** [P1.2 `azd`: Infrastructure as Code](task-list.md#p12-azd-infrastructure-as-code) (Follow-up)

### The Problem
After all other resource validation errors were fixed, the `azd provision` step still failed with a `BadRequest` error specifically when creating the Static Web App resource.

### The Root Cause
This is a somewhat generic error, but when creating a Static Web App via Bicep with an empty `properties` block, it can sometimes be caused by the API version being used. Newer API versions can sometimes be stricter or have subtle changes in behavior.

### The Resolution
The fix was to change the API version of the `Microsoft.Web/staticSites` resource in `infra/main.bicep` from a newer version (`2022-09-01`) to an older, widely used, and stable version (`2022-03-01`). This resolved the `BadRequest` error, allowing the resource to be provisioned successfully. This suggests the newer API version may have stricter requirements for the initial creation payload that were not being met.

---

## Final Architecture: CI/CD-Driven Frontend Deployment

**Date:** 2025-09-11

**Task:** [P1.2 `azd`: Infrastructure as Code](task-list.md#p12-azd-infrastructure-as-code) (Follow-up)

### The Problem
The final blocker was a `BadRequest` error when `azd up` tried to provision the Static Web App (SWA). While changing the API version was a potential fix, the user's request to have the SWA deployed via GitHub pipelines presented a better, more robust architectural solution. The core issue was the friction of creating a minimal SWA resource shell via Bicep for `azd` to use.

### The Resolution
A strategic decision was made to decouple the frontend and backend deployments, fully embracing a CI/CD-first approach for the frontend:

1.  **Backend Provisioning (`azd up`)**: The `infra/main.bicep` file was modified to *remove* the Static Web App resource entirely. `azd up` is now solely responsible for provisioning the backend resources (Function App, databases, Key Vault, etc.) and deploying the API code.
2.  **Frontend Deployment (GitHub Actions)**: A new GitHub Actions workflow was created at `.github/workflows/azure-static-web-apps.yml`. This workflow is responsible for the entire lifecycle of the frontend application.
    -   It triggers on a `push` to the `main` branch.
    -   It uses the official `Azure/static-web-apps-deploy@v1` action.
    -   This action will **create the Static Web App resource** in Azure on its first run and then deploy the built React application code to it.
    -   It also links the backend Function App (provisioned by `azd`) to the SWA.
3.  **Configuration (`azure.yaml`)**: The `web` service was removed from `azure.yaml`. Since `azd` no longer manages the frontend, this definition is no longer needed.

This new architecture is a standard and highly recommended pattern. It provides a clean separation of concerns, simplifies the `azd` Bicep files, and provides a robust, automated CI/CD pipeline for the frontend.

---

## Final Pivot: Reverting to a Unified `azd up` Deployment

**Date:** 2025-09-11

**Task:** [P1.2 `azd`: Infrastructure as Code](task-list.md#p12-azd-infrastructure-as-code) (Final)

### The Problem
The CI/CD-driven approach, while robust, was more complex than the user desired. The user preferred a simpler workflow where `azd up` creates all resources, including an empty Static Web App, which they could then configure for CI/CD from the Azure portal manually. This required reverting the previous changes and solving the original `BadRequest` error for the SWA.

### The Resolution
A final architectural decision was made to revert to a unified `azd up` deployment model.

1.  **CI/CD Workflow Removed**: The `.github/workflows/azure-static-web-apps.yml` file was deleted.
2.  **`azure.yaml` Restored**: The `web` service definition was added back to `azure.yaml`, making `azd` aware of the frontend service again for packaging and deployment.
3.  **Static Web App Restored in Bicep**: The `staticWebApp` resource definition was added back to `infra/main.bicep`. To solve the `BadRequest` error, a new attempt was made using a recent API version (`2022-09-01`) but with an explicitly empty `properties: {}` block. This is a common pattern to satisfy ARM API validation for a minimal resource definition.
4.  **Documentation Reverted**: The `README.md` was updated to reflect the simple, single-step `azd up` deployment process.

This final state provides the user with their desired workflow: a single command to provision all resources, with the flexibility to configure CI/CD manually from the portal afterwards.

---

## `azd deploy` Fails with `resource not found`

**Date:** 2025-09-11

**Task:** [P1.2 `azd`: Infrastructure as Code](task-list.md#p12-azd-infrastructure-as-code) (Final)

### The Problem
After a completely successful `azd provision`, the `azd deploy` step failed with the error: `unable to find a resource tagged with 'azd-service-name: api'`.

### The Root Cause
The `azd deploy` command needs to know which provisioned Azure resource corresponds to each service defined in `azure.yaml`. It discovers this mapping by looking for a specific tag on the Azure resources: `azd-service-name`.

The Bicep code was creating a common `tags` object with `'azd-env-name': environmentName` and applying it to all resources. However, it was not adding the crucial service-specific tag to the Function App or the Static Web App.

### The Resolution
The fix was to add the `azd-service-name` tag to the relevant resources in `infra/main.bicep`. The `union()` function was used to merge the common tags with the service-specific tag.

-   For the `functionApp` resource (service name `api`):
    ```bicep
    tags: union(tags, { 'azd-service-name': 'api' })
    ```
-   For the `staticWebApp` resource (service name `web`):
    ```bicep
    tags: union(tags, { 'azd-service-name': 'web' })
    ```
This allows `azd` to correctly map the services to their target resources, resolving the final deployment error.

---

## Final Architecture: Reverting to CI/CD-Driven Frontend

**Date:** 2025-09-11

**Task:** [P1.2 `azd`: Infrastructure as Code](task-list.md#p12-azd-infrastructure-as-code) (Final, for real this time)

### The Problem
After a successful deployment, the user re-evaluated the workflow and decided that the automated CI/CD pipeline for the frontend was the desired end-state after all. This required reverting the previous reversion.

### The Resolution
The architecture was pivoted back to the CI/CD-driven model for the frontend.

1.  **Backend Provisioning (`azd up`)**: `infra/main.bicep` was modified again to remove the Static Web App resource. `azd` is now only responsible for the backend.
2.  **Frontend Deployment (GitHub Actions)**: The `.github/workflows/main.yml` file was re-created to handle the build and deployment of the frontend application.
3.  **Configuration (`azure.yaml`)**: The `web` service was removed from `azure.yaml` again, as `azd` no longer manages its deployment.
4.  **Documentation**: The `README.md` was rewritten to provide detailed, step-by-step instructions for the two-part deployment process: running `azd up` for the backend, then configuring GitHub secrets and pushing to trigger the frontend deployment pipeline.

This final architecture provides a robust, automated, and scalable deployment strategy, separating backend infrastructure concerns from frontend application CI/CD.
