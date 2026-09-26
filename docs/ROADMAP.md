# FleetFlow — Development Roadmap

**Document status:** Active  
**Version:** 1.0  
**Last updated:** 2026-09-26

## 1. Purpose

This roadmap defines the recommended implementation order for FleetFlow. It is intentionally incremental so the project can remain stable while new microservices and workflows are added.

Legend:

- `[x]` Implemented / established
- `[~]` In progress / partially implemented
- `[ ]` Planned

## 2. Phase 1 — Foundation

- [x] Create FleetFlow monorepo structure
- [x] Create Next.js web application
- [x] Establish TypeScript frontend
- [x] Establish authentication service
- [x] Connect MongoDB to backend services
- [x] Establish JWT authentication
- [x] Establish user roles
- [x] Create shared frontend authentication context
- [x] Create login/register flows
- [x] Establish light/dark theme
- [x] Create dashboard layout

## 3. Phase 2 — Vehicle Management

- [x] Vehicle domain/service foundation
- [x] Vehicle creation
- [x] Vehicle listing
- [x] Vehicle retrieval
- [x] Vehicle update
- [x] Vehicle deactivation
- [x] Vehicle status management
- [x] Vehicle filtering/search foundation
- [x] Vehicle dashboard UI
- [x] Vehicle service/history UI

## 4. Phase 3 — Vehicle Requests

- [~] Vehicle request page foundation
- [ ] Request creation API finalized
- [ ] Request lifecycle/state machine finalized
- [ ] Manager request review
- [ ] Request approval/rejection
- [ ] Vehicle assignment
- [ ] Customer request history
- [ ] Driver assignment workflow
- [ ] Request notifications

## 5. Phase 4 — Fleet Operations

- [ ] Driver management service
- [ ] Driver profiles
- [ ] Driver status
- [ ] Vehicle assignment
- [ ] Fleet availability management
- [ ] Operational dashboard
- [ ] Driver-specific workflows

## 6. Phase 5 — Maintenance

- [~] Vehicle service/history foundation
- [ ] Dedicated maintenance domain
- [ ] Maintenance schedules
- [ ] Maintenance status
- [ ] Maintenance costs
- [ ] Upcoming maintenance
- [ ] Maintenance reminders
- [ ] Maintenance reporting

## 7. Phase 6 — Notifications

- [ ] Notification service
- [ ] In-app notification model
- [ ] Read/unread state
- [ ] Request notifications
- [ ] Assignment notifications
- [ ] Maintenance notifications
- [ ] Notification preferences

## 8. Phase 7 — Analytics & Reporting

- [ ] Fleet utilization metrics
- [ ] Vehicle status analytics
- [ ] Request analytics
- [ ] Maintenance analytics
- [ ] Driver metrics
- [ ] Date filtering
- [ ] Exportable reports

## 9. Phase 8 — Production Hardening

- [ ] Automated unit tests
- [ ] API integration tests
- [ ] Frontend tests
- [ ] End-to-end tests
- [ ] Centralized error handling
- [ ] Structured logging
- [ ] Rate limiting
- [ ] Security review
- [ ] Dependency audit
- [ ] Database indexes
- [ ] Backup strategy
- [ ] Monitoring
- [ ] Health-check endpoints

## 10. Phase 9 — Deployment

Target deployment architecture:

```text
                    ┌─────────────────┐
                    │     Users       │
                    └────────┬────────┘
                             │ HTTPS
                             ▼
                    ┌─────────────────┐
                    │ Next.js Web App │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        Auth Service   Vehicle Service   Other Services
              │              │              │
              └──────────────┼──────────────┘
                             ▼
                       MongoDB Atlas
```

Deployment providers are implementation choices and should be finalized based on cost, reliability, and project requirements.

## 11. Definition of Done

A feature should not be marked complete merely because the UI exists.

A feature is done when:

- [ ] UI is implemented
- [ ] Backend endpoint exists where required
- [ ] Validation exists
- [ ] Authorization exists
- [ ] Database persistence works
- [ ] Loading states work
- [ ] Error states work
- [ ] Empty states work
- [ ] Responsive behavior is verified
- [ ] Relevant API documentation is updated
- [ ] Tests are added when test infrastructure supports them
- [ ] Git commit clearly describes the change

## 12. Recommended Development Order

The recommended next sequence is:

```text
Vehicle Requests
       ↓
Vehicle Assignment
       ↓
Driver Management
       ↓
Maintenance
       ↓
Notifications
       ↓
Analytics
       ↓
Testing
       ↓
Security Hardening
       ↓
Deployment
```

This order keeps the core operational workflow coherent before adding secondary platform features.

## 13. Portfolio Completion Target

Before presenting FleetFlow as a finished portfolio project, the project should demonstrate:

- Microservice architecture
- Next.js + TypeScript frontend
- Authentication
- JWT
- RBAC
- MongoDB
- REST APIs
- Input validation
- Vehicle management
- Vehicle request workflow
- Vehicle service/history
- Driver/assignment workflow
- Maintenance workflow
- Notifications
- Analytics
- Automated testing
- Deployment
- Professional documentation
