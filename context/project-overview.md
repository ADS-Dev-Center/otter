# Otter — Organized Token & Trusted Environment Repository

## Overview

Otter is a secure credential management platform built for QA engineers and developers. It provides a centralized, encrypted vault for storing URLs, passwords, API keys, and environment variables — organized by division and project. Every login requires OTP verification to ensure only authorized personnel access sensitive credentials.

Otter uses an **organization model**: users belong to one or more divisions (e.g. Dev, QA, DevOps), and each division is a fully isolated workspace. When a user logs in, they land on their own **division dashboard** — they only see the divisions they are a member of, the projects within those divisions, and the credentials scoped to those projects. A QA member cannot see Dev division data, and vice versa. This scoping is enforced at the API level, not just the UI.

## Goals

1. Eliminate credential sprawl by centralizing all team secrets in one encrypted, access-controlled platform
2. Enforce strong authentication (OTP-required login) so no session can be established with password alone
3. Enable per-division and per-project credential organization with strict data isolation between divisions
4. Give each user a dashboard that reflects only their own division context — no cross-division data leakage

## Core User Flow

1. User navigates to the login page and enters their email + password (via Clerk)
2. Clerk enforces OTP verification before granting access (email or authenticator app)
3. User lands on their **Division Dashboard** — a personalized view showing only the divisions they belong to, recent activity within those divisions, and quick-access to their projects
4. User selects a Division (e.g. QA) to enter that division's workspace
5. Inside the division, the user sees its projects and member list
6. User opens a Project within the division to view its credentials
7. User can add, edit, view (with reveal toggle), or delete credentials within the project (subject to their role)
8. Credential values are encrypted at rest using AES-256-GCM; decryption only happens server-side on an authorized request

## Organization Model

Otter's data is structured in three nested scopes:

```
Organization (Otter platform)
└── Division  (e.g. QA, Dev, DevOps, Design)
    ├── Members (with roles: Owner, Admin, Member)
    └── Projects
        └── Credentials (URL, Password, API Key, Token, Env Var, SSH Key, Other)
```

**Isolation rules:**

- A user only has access to divisions they are explicitly a member of.
- The dashboard renders exclusively from the user's own division memberships — no global project or credential list exists for non-admin users.
- Projects and credentials inside one division are never visible to members of another division.
- A Super Admin is the only role with cross-division visibility, and only for administrative purposes (not credential viewing).

## Features

### Authentication & Security

- Clerk-based authentication with mandatory OTP (email code or TOTP authenticator)
- Session invalidation on suspicious activity
- All credential values encrypted with AES-256-GCM before storage
- Decryption only performed on authorized server-side API calls
- Audit log of who viewed or modified a credential

### Division Dashboard

- After login, the user lands on a dashboard scoped to their divisions only
- Dashboard shows: divisions the user belongs to, recent activity across those divisions, and quick-links to frequently accessed projects
- Users with membership in multiple divisions see a division switcher; each division opens its own isolated workspace
- No data from other divisions is ever fetched or rendered, even partially

### Division Management

- Create and name divisions (e.g. Dev, QA, DevOps, Design) — Super Admin only
- Assign members to divisions with roles: Owner, Admin, Member
- View member list within a division
- Division Owners can invite or remove members
- Division data is fully isolated; cross-division access is not possible at any UI or API layer for non-admin roles

### Project Management

- Create projects inside a division
- Projects are isolated — credentials in one project are not visible to another division
- Project-level metadata: name, description, environment tag (e.g. staging, production, dev)

### Credential Vault

- Credential types: URL, Password, API Key, Token, Environment Variable, SSH Key, Other
- Fields per credential: name, type, value (encrypted), description, tags, last updated
- Reveal toggle: credential value is masked by default; click-to-reveal within an active session
- Copy-to-clipboard action with auto-clear after 30 seconds
- Search and filter credentials by name, type, or tag

### Administration

- Super Admin role can manage all divisions and users; is the only role with cross-division visibility
- Division Admin can manage members and projects within their division
- Invite users by email; they receive an onboarding link and are added to a specific division

## Scope

### In Scope

- OTP-enforced Clerk authentication
- Division-scoped dashboard (users see only their own divisions)
- Division, project, and credential CRUD
- AES-256-GCM encryption/decryption via Node crypto (server-side only)
- Member management per division with roles
- Credential type system with masked values
- Audit log per credential
- Search and filter within a project

### Out of Scope

- Mobile native app (web only, but must be responsive)
- Secret rotation or expiry automation (future phase)
- SSO / SAML integration (future phase)
- External secret provider sync (Vault, AWS Secrets Manager — future phase)

## Success Criteria

1. A user cannot access any credential without completing OTP verification
2. After login, a user's dashboard shows only the divisions they belong to — no other division data is accessible or fetched
3. A Division Member can view and copy credentials in their division's projects
4. A Division Admin can add/remove members and create projects
5. All credential values are stored encrypted and never exposed in API responses in plain text unless explicitly requested and authorized
6. Audit log correctly records every view and mutation event with actor identity and timestamp
7. A member of Division A cannot access any project or credential belonging to Division B, even by direct URL or API call
