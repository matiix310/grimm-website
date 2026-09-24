# authentik-users

Tiny CLI that creates or updates authentik users from a YAML file. Every user is linked to the **forge-id** source with the right OIDC attributes.

## Requirements

- [Bun](https://bun.sh) (any recent version)

## Setup

```bash
cd tools/authentik-users
cp .env.example .env
# edit .env: set AUTHENTIK_URL and AUTHENTIK_TOKEN
```

The API token must have access to the `users` and `groups` scopes.

## Input format

Create a YAML file (e.g. `users.yaml`):

```yaml
users:
  - login: alice.dupont
    display_name: Alice Dupont       # optional; falls back to login
    added_groups:                    # groups to add to this user
      - bde-members
    removed_groups:                  # groups to remove from this user
      - students
  - login: bob.martin                # no display_name → name = login
    added_groups:
      - students
  - login: charlie.admin
    display_name: Charlie (Admin)
    # no group changes — only other fields will be synced
```

- `login` — the authentik username
- `display_name` *(optional)* — the friendly name shown in the UI. On **creation**, falls back to `login` if omitted or empty. On **update**, omitting `display_name` leaves the existing value untouched (only `path`, `groups`, and attributes are synced).
- `added_groups` *(optional)* — list of group NAMES to add to the user
- `removed_groups` *(optional)* — list of group NAMES to remove from the user

**Group handling is additive**: existing groups are preserved. Only the listed `added_groups` / `removed_groups` are applied. Removing a group the user doesn't have is a no-op (no error).

**Conflict rule**: if a group appears in **both** `added_groups` and `removed_groups` (case-insensitive), the user is skipped with an error.

Every user will be created/updated with:

| Field | Value |
| --- | --- |
| `name` | `<display_name>` if set, otherwise `<login>` |
| `path` | `goauthentik.io/sources/forge-id` |
| `attributes.oidc_iss` | `null` |
| `attributes.oidc_sub` | `<login>` |
| `attributes.goauthentik.io/user/sources` | `["FORGE ID"]` |
| `is_active` | `true` |

## Usage

```bash
# Dry-run (default) — checks everything, prints what would happen, no API writes
bun run src/index.ts users.yaml

# Actually apply the changes
bun run src/index.ts users.yaml --apply

# Custom input file
bun run src/index.ts ./data/staff.yaml --apply

# Help
bun run src/index.ts --help
```

`.env` is read automatically from `tools/authentik-users/.env`. Variables already set in your shell take precedence.

## Behaviour

- **Dry-run by default** — nothing is sent to authentik unless you pass `--apply`
- **Upsert** — existing users are updated in place (groups, attributes, path)
- **No deletion** — the script never deletes users
- **Strict groups** — if a group named in the YAML doesn't exist in authentik, the script aborts before touching any user
- **Per-user error reporting** — if one user fails, the others still run

## Exit codes

- `0` — success (including no-op)
- `1` — at least one user failed, or a fatal config / network error occurred