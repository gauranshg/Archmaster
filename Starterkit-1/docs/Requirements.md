# Shwet’s Azure SaaS Starter Kit Requirements Document

## 1. Business Goals
- Accelerate SaaS/internal tool delivery on Azure with a reusable, secure starter kit.
- Enforce standardized, maintainable coding and architectural patterns.
- Support seamless onboarding for new developers and future expansion to AI, chatbot, and branding features.

## 2. Scope
- **Phase 1:**
  - Core starter kit with a **React + Vite** frontend.
  - Backend built on **Azure Functions**, with a sample implementation in **Python**.
  - **Ant Design** UI framework.
  - Modular integration with Azure services: Azure AD, Blob Storage, **Azure SQL**, **Cosmos DB**, and **Dynamics 365 F&O**.
  - Core services: Key Vault, Azure Communication Service for email.
  - No analytics or payments.
  - Email-only notifications.

- **Phase 2:**
  - MCP/AI tools integration.
  - Chatbot with agent-driven workflows.

- **Phase 3:**
  - Multi-layout page patterns.
  - Easy branding/theme engine.
  - Demo/dummy pages.

- **Explicitly Out of Scope:**
  - Non-Azure services.
  - Analytics.
  - Payment modules.
  - Non-email notifications.

## 3. Stakeholders & Users
- **Primary:** Shwet’s development team (internal Azure projects).
- **Secondary:** Future internal developers, Azure/IT/Security reviewers.
- **Maintainers:** DevOps team and assigned senior developers.

## 4. Assumptions / Dependencies / Constraints
- Azure-only platform.
- Development on Windows environments.
- GitHub used for CI/CD pipelines.
- All secrets managed via Azure Key Vault.
- English language only.
- Developers have or will obtain Azure access and necessary permissions for target services.

## 5. Glossary
- Azure, React, Vite, Azure Functions, Azure AD, Blob Storage, Azure SQL, Cosmos DB, Key Vault, CI/CD, RBAC, **OData**.

## 6. High-Level Context
- A unified foundation for rapid, secure internal app prototyping and delivery.
- Designed with forward-thinking extensibility in mind.

## 7. Functional Requirements per Feature

### Phase 1
- **Sample Customer Management Page (Azure SQL):** A full CRUD demonstration page for managing a `Customer` list, using **Azure SQL** as the data source.
- **Sample Chat Component (Cosmos DB):** A chat interface that stores and retrieves conversation history from **Cosmos DB**.
- **Sample F&O Customer Page (OData):** A full CRUD demonstration page for managing customers using the `CustomersV3` entity in **Dynamics 365 F&O via its OData API**.
- **Authentication and Authorization:** Secure user authentication through Azure AD, with pre-defined roles for RBAC.
- **Role-Based Access Control (RBAC) Roles:** Clearly defined standard user roles.
- **Database Migrations:** A mechanism for managing and versioning the Azure SQL database schema.
- **Core Services:**
  - Email sending via Azure Communication Service.
  - Secure file storage using Azure Blob Storage.
  - Secrets management via Key Vault.
- **UI Foundation:** A starter dashboard and UI built with Ant Design.
- **Onboarding Experience:** Turnkey onboarding with a README and setup guide enabling <1 hour local & Azure deployment launch.

### 7.1. Role Definitions
- **Admin:** Full access to all features. Can manage application settings and user roles.
- **Member:** Standard user. Can access core features of the application (e.g., view/edit customers, use the chat feature) but cannot access administrative panels.

### Phase 2
- Modular AI tools dashboard (MCP).
- Chatbot with orchestrated agent features.
- Agent memory management.
- File uploading integrated with Azure storage.
- Application-level settings management.

### Phase 3
- Multi-layout and page pattern support.
- Dummy/demo pages inclusion.
- Auto-theming and branding system.

## 8. Onboarding / Initial Setup
- Detailed README and setup instructions.
- Azure resource creation guides.
- Key Vault and configuration walkthrough.
- Documentation covering common “trouble spots.”
- GitHub push triggers Actions pipeline to deploy to Azure Static Web Apps (SWA).

## 9. Non-Functional Requirements
- **API Design:** APIs must include pagination for list-based endpoints and perform input validation.
- **Performance:** Fast load times.
- **Reliability:** Reliable Azure-based CI/CD.
- **Security:** Strong security defaults.
- **Accessibility:** Basic accessibility (a11y) compliance.
- **Code Quality:** Maintainable modular codebase.
- **Compatibility:** Compatibility with Windows and modern browsers.

## 10. Branding Automation
- Auto-update of logos, themes, and color schemes.
- Designed for SaaS products requiring custom branding per customer.

## 11. Data & Analytics
- Minimal logging only.
- No analytics tracking.
- Sample log dashboard included in documentation.

## 12. Integrations
- Azure AD, Blob Storage, Azure SQL, Cosmos DB, Key Vault.
- **Dynamics 365 F&O (via OData)**.
- Azure Communication Service.
- GitHub Actions for CI/CD.
- Ant Design UI framework.
- **Database Migration Tools** (e.g., Alembic for Python).
- Swagger/OpenAPI (for AI and branding features phased in).

## 13. Privacy & Compliance
- Authentication strictly via Azure AD.
- Secrets stored exclusively in Key Vault.
- No Personally Identifiable Information (PII) by default.
- Self-service compliance review enabled for teams.

## 14. Operational Considerations
- Health check endpoints.
- Optional Azure monitoring and logging.
- Documentation for scaling and backup procedures.
- Sample CI/CD workflows.
- DevOps support plan.

## 15. Acceptance & Sign-off
- Per-phase acceptance checklists.
- Onboarding completion within less than 1 hour.
- All feature demos completed successfully.
- Final sign-off by Shwet, team, and IT.

## 16. Traceability
- Requirements mapped to implemented features in code and documentation.
- Full cross-referencing maintained.

## 17. Open Issues & Risks
- Potential Azure API changes impacting integration.
- No support for non-Azure platforms.
- Telemetry and compliance responsibility lies with individual teams.
- Onboarding assumes active Azure account access.
