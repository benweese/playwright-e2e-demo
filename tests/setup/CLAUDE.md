# tests/setup/

Account setup and teardown around the `ui` project. These are not test cases: they have ids (`#0003`, `#0004`) only so every test in the repo does, and no tags, because the `setup` and `teardown` projects select them by file name.

1. **`auth.setup.ts`** (project `setup`) creates a fresh account through `POST /api/createAccount` with `buildAccount()`, signs in through `LoginPage`, and saves the session to `.auth/state.json` and the credentials to `.auth/user.json` (both git-ignored; paths in `config.auth`).
2. **`ui`** depends on `setup` and starts from that session.
3. **`auth.teardown.ts`** (project `teardown`) runs after `ui` finishes: deletes the account, checks it's gone, and removes `.auth/`.

There are no credentials to manage, and every run leaves the shared site as it found it.

- Setup's login check is hard (`{ soft: false }`): saving a session that isn't logged in would make every ui test fail confusingly.
- If ui tests land on the login page instead of the expected page, the session is stale: delete `.auth/` and re-run. Don't change locators for it.
- Only setup and teardown go here. Tests that check signing in or creating accounts are UI or API tests in their own folders.
