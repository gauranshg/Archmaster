# Workspace README
 
This document explains the structure and purpose of the files within this workspace.
 
## Files and Folders
 
-   **`task-list.md`**
    -   **Purpose**: This is the master list of all tasks for the project. It serves as our single source of truth for what needs to be done, what is currently being worked on, and what has been completed.
    -   **How to Use**: Before starting any work, both the Human and the Agent should consult this file to understand the current priorities. The Agent is responsible for keeping the status of each task up-to-date.
 
-   **`learning.md`**
    -   **Purpose**: To capture key insights, decisions, and lessons learned from completed tasks. This helps us avoid repeating mistakes and builds a knowledge base for the project.
    -   **How to Use**: After a significant task is completed, the Agent will add a summary of any important learnings to this file, linking back to the relevant task in the `task-list.md`.
 
-   **`pending-human-interaction/`**
    -   **Purpose**: This directory holds detailed, step-by-step guides for any task that requires the Human to perform an action (e.g., setting up accounts, providing API keys, making business decisions).
    -   **How to Use**: When a task in the `task-list.md` is assigned to the "Human", it will include a link to a specific guide file within this directory. The Human should follow the guide and provide the "Evidence Required for Verification" back to the Agent.
 
-   **`README.md` (this file)**
    -   **Purpose**: To provide an overview of the workspace itself.
    -   **How to Use**: This file should be the first stop for understanding how our collaboration is structured. The Agent is responsible for keeping this file updated if any new files or folders are added to the workspace.