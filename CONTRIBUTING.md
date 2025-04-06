[Leer este documento en Español](CONTRIBUTING.es.md)

---

# How to Contribute to the Cardano Ecosystem Map

Thank you for your interest in contributing to this map! Below are the steps to propose adding or modifying ecosystem actors.

## Contribution Process (Via Pull Requests)

We use GitHub Pull Requests (PRs) to manage contributions. The basic workflow is:

1.  **Fork:** Fork this repository to your own GitHub account.
2.  **Branch:** Create a new branch in your fork with a descriptive name (e.g., `add-project-xyz` or `update-ambassador-abc`).
3.  **Edit:** Modify the `data/cardano-actors.json` file in your branch:
    * **Add:** Add a new JSON object to the end of the list (before the final `]`), ensuring you maintain correct JSON syntax (commas between objects, etc.).
    * **Modify:** Find the existing object you want to change and update its values.
4.  **Commit:** Save your changes with a clear commit message (e.g., "feat: Add Project XYZ to map").
5.  **Pull Request (PR):** Open a Pull Request from your branch to the `main` branch of this original repository. In the PR description, briefly explain what you added or modified and provide links or references if possible to verify the information.

## Data Format (`data/cardano-actors.json`)

Each actor in the `data/cardano-actors.json` file is a JSON object with the following fields:

* `lat` (Number): Geographic latitude. (Required)
* `lng` (Number): Geographic longitude. (Required)
    * *You can get approximate coordinates using Google Maps (right-click on a point -> "What's here?").*
* `name` (String): Name of the actor (person, project, hub, etc.). (Required)
* `type` (String): Category of the actor. Current valid values: `Founder`, `Hub`, `University`, `Project`, `Ambassador`. (This list may grow). (Required)
* `city` (String): Main city of location. (Required)
* `country` (String): Country of location. (Required)
* `description` (String): Brief description (1-2 sentences) about the actor or their relevance to Cardano. (Required)
* *(Optional: We might add `url` (String) for a web link, `twitter` (String) for the handle, etc., in the future).*
* `description` (String): Brief description (1-2 sentences)... (Required)
* `twitter` (String): The actor's Twitter handle (username **without** the leading '@'). (Optional)
* `website` (String): The actor's main website URL (including `https://` or `http://`). (Optional)
* `relationship_codes` (Array of numbers/strings): List of codes representing groups or connections this actor belongs to (for future visualization). (Optional)

**Important:** Ensure the entire `cardano-actors.json` file remains valid JSON after your changes. You can use an online JSON validator if unsure.

## Review

A repository maintainer will review your Pull Request. They may ask for changes or clarifications. Once approved, your contribution will be merged and will appear on the map shortly after.

Thank you again for helping keep this resource up-to-date!