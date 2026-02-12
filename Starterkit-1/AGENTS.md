# Agent Instructions for the Azure SaaS Starter Kit Project

Welcome, Agent! This document provides instructions on how to approach the tasks for this project. Our primary goal is to collaborate effectively to build the Azure SaaS Starter Kit.


## Development Guidelines

-   **Modularity:** Keep the codebase as modular as possible. This will make it easier to maintain and extend in the future.
-   **Code Comments:** Write clear and concise comments where necessary to explain complex logic.
-   **Error Handling:** Implement robust error handling in both the frontend and backend to ensure a smooth user experience.
-   **Security:** Follow security best practices at all times, especially when handling secrets and authentication.

## Communication

-   **Ask for Clarification:** If any task or requirement is unclear, please ask for clarification before proceeding.
-   **Provide Regular Updates:** Keep me informed of your progress. A brief message after completing a major task is sufficient.

By following these guidelines, we can ensure a smooth and successful project. Let's get started!

# Agent Collaboration Protocol
 
This document outlines the protocol for collaboration between the Human and the Agent.
 
## Workspace
 
All work is tracked in the `docs/workspace/` directory.
 
-   **Task List:** [docs/workspace/task-list.md](./docs/workspace/task-list.md)

-   **Learnings & Notes:** [docs/workspace/learning.md](./docs/workspace/learning.md)

-   **Guides for Human Tasks:** [docs/workspace/pending-human-interaction/](./docs/workspace/pending-human-interaction/)
 
## Protocol
 
The Agent must always follow this protocol:
 
1.  **Task List Management:** The Agent will keep the Task List updated with the status of all tasks (Current, Next, Done). Each task entry must include a `Created Date` and a `Completed Date`.

2.  **Verification:** Every task requires a clear Verification step. When a task is complete, the Agent will record the verification date and who verified it.

3.  **Human-Owned Tasks:**

    -   For any task assigned to the Human, the Agent will first create a detailed guide file under `docs/workspace/pending-human-interaction/`.

    -   This guide will include prerequisites, step-by-step actions, and the specific evidence the Human must provide for verification (e.g., IDs, logs, screenshots).

    -   The Agent will link this guide from the Task List.

    -   After the Human reports completion, the Agent will review the evidence. If the evidence is sufficient, the task will be marked as Done (Verified). If not, the Agent will create follow-up tasks to address any issues.

4.  **Agent-Owned Tasks:**

    -   The Agent will execute the work and document the precise steps and results so the Human can verify the work.

    -   The Agent will specify exactly how the Human should verify the task (e.g., commands to run, pages to check, values to confirm).

    -   The Agent will only mark a task as Done (Verified) after the verification checks pass.

5.  **Learning:** The Agent will keep the `docs/workspace/learning.md` file updated with key lessons from completed tasks, linking back to the relevant task entries.

6.  **Pre-Task Review:** Before beginning any new coding task, the Agent must review the `task-list.md`, `learning.md`, and `docs/workspace/README.md` to ensure full context.

7.  **Workspace Maintenance:** The Agent must keep `docs/workspace/README.md` updated, explaining any new files or folders added to the workspace.

8.  **Task Confirmation:** If there is no "Current Task" in the task list, the Agent must not start any new work. Instead, the Agent must create a new task, assign it, and then explicitly ask the Human for confirmation before beginning work on that task.

9.  **Environment Variable Management:** If the Agent adds a new environment variable required by the application, the Agent must:

    -   Add the new variable with a placeholder value to the `.example` file. like for .env file create env.example.
    

10. **Status Page Maintenance:** If the Agent adds or removes a component or configuration that affects system connectivity, the Agent must update the `/api/health` Azure Function and the corresponding frontend component (`src/frontend/src/pages/Status.jsx`) to include a test for the new component.
 