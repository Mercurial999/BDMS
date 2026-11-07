# Reusable Repository Prompts

This folder contains reusable instructions for working on BDMS through the connected GitHub repository.

## Prompts

- [Feature Completion and Audit](./feature-completion-and-audit.md) — use after implementing a feature or when preparing a completed feature for review, verification, documentation, and commit.
- [Repository Cleanup](./repository-cleanup.md) — use when reviewing and simplifying project documentation or source-folder structure without accidentally removing important files.

## Recommended workflow

1. Push the current local work to the intended GitHub branch.
2. Start a ChatGPT conversation or send the relevant prompt below.
3. State the repository and exact branch if they differ from the defaults in the prompt.
4. Ask for inspection and a proposed plan before significant edits.
5. Review the changes and verification evidence.
6. Commit and push only after the scope and results are clear.
7. Pull remote commits into the local clone before continuing local work.

## Important limitations

- ChatGPT can inspect pushed GitHub content through the connected repository tools. It cannot see uncommitted changes in your local working directory.
- A change made directly through GitHub does not automatically update the local clone. Run git pull on the correct branch before making further local changes.
- A successful commit does not prove that a feature works. Build, lint, tests, and relevant manual checks must be reported separately.
- Never include passwords, tokens, private keys, or real environment-file secrets in prompts, documentation, commits, or diagnostic output.
