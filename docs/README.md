# FleetFlow Documentation

This directory contains the engineering documentation for FleetFlow.

## Documents

### `ARCHITECTURE.md`

Defines the system architecture, services, communication patterns, repository structure, authentication flow, and architectural decisions.

### `REQUIREMENTS.md`

Defines FleetFlow's users, roles, modules, functional requirements, non-functional requirements, and business rules.

### `API.md`

Documents backend API conventions, authentication endpoints, vehicle endpoints, request endpoints, service/history endpoints, and response conventions.

### `SECURITY.md`

Documents authentication, JWT, RBAC, password handling, validation, environment secrets, CORS, API security, database security, logging, and production security practices.

### `ROADMAP.md`

Tracks completed work, current development, planned services, production hardening, testing, deployment, and the recommended implementation sequence.

## Documentation Principle

These documents should remain synchronized with the implementation.

When a major architecture, API, security, or product decision changes:

1. Update the relevant document.
2. Update implementation.
3. Test the affected workflow.
4. Commit the documentation change with the feature.

## Source of Truth

The documentation describes the intended and currently known FleetFlow architecture. When implementation and documentation disagree, verify the actual code before extending the system and then update the documentation.
