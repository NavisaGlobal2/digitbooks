
# DigitBooks System Architecture

## System Overview

DigitBooks is a modern web application that follows a client-side architecture with a managed backend (Supabase). This document provides a high-level overview of how the different parts of the system work together.

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────────┐
│             │     │             │     │                     │
│  React UI   │◄────►  Context &  │◄────►  Supabase Backend   │
│  Components │     │  State Mgmt │     │  (Auth, DB, Storage)│
│             │     │             │     │                     │
└─────────────┘     └─────────────┘     └─────────────────────┘
```

## Client-Side Architecture

### Component Hierarchy

The application follows a component-based architecture:

```
App (Root)
├── Authentication Layer
├── Layout Components
│   ├── Sidebar/Navigation
│   ├── Header
│   └── Main Content Area
└── Feature Pages
    ├── Dashboard
    ├── Expenses
    ├── Invoicing
    ├── Revenue
    ├── Budget
    ├── Reports
    └── Settings
```

### State Management

DigitBooks uses React Context API for state management, organized by feature domains:

```
React Context Providers
├── AuthProvider
├── ClientProvider
├── ExpenseProvider
├── InvoiceProvider
├── RevenueProvider
├── BudgetProvider
└── LedgerProvider
```

Each provider:
1. Maintains state for its domain
2. Provides actions to modify that state
3. Handles syncing with the backend
4. Makes state available to components via custom hooks

## Data Flow

### User Interaction Flow

When a user performs an action:

1. **UI Event**: User interacts with a component (e.g., adds an expense)
2. **Component Handler**: Event handler in component processes the action
3. **Context Action**: Component calls an action from a context provider
4. **State Update**: Context provider updates local state
5. **Database Sync**: Changes are persisted to Supabase
6. **UI Update**: Components re-render with new state

### Database Sync Pattern

The application follows a "local-first" approach:
1. State is updated immediately in the browser
2. Changes are then pushed to the backend
3. If backend sync fails, user is notified but local changes remain
4. On next load, local and remote data are reconciled

## Backend Services (Supabase)

### Authentication & Authorization

- **JWT-based Auth**: Secure token authentication
- **Row-Level Security**: Database policies control data access
- **Role-Based Access**: Team members have different permission levels

### Database Schema

Key tables in the Supabase database:
- **profiles**: User business information
- **expenses**: Business expenses
- **invoices**: Client invoices
- **revenues**: Income records
- **team_members**: Team access management
- **clients**: Client information
- **budgets**: Budget planning data

### File Storage

Supabase storage is used for:
- Receipt images
- Company logos
- Invoice PDFs
- Imported statements

## Feature Implementation Details

### Expense Management

```
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│                │     │                │     │                │
│  Expense UI    │◄────►  ExpenseContext│◄────►  Supabase DB   │
│  Components    │     │                │     │                │
│                │     │                │     │                │
└────────────────┘     └────────────────┘     └────────────────┘
       ▲                      ▲
       │                      │
       │                      │
       ▼                      ▼
┌────────────────┐     ┌────────────────┐
│                │     │                │
│  Expense Hooks │     │  Expense Utils │
│                │     │                │
│                │     │                │
└────────────────┘     └────────────────┘
```

### Bank Statement Import

```
┌────────────┐       ┌────────────┐       ┌────────────┐       ┌────────────┐
│            │       │            │       │            │       │            │
│  Upload    │──────►│  File      │──────►│ Transaction│──────►│  Expense   │
│  Dialog    │       │  Parser    │       │  Tagging   │       │  Creation  │
│            │       │            │       │            │       │            │
└────────────┘       └────────────┘       └────────────┘       └────────────┘
```

### Team Invitation System

```
┌────────────┐       ┌────────────┐       ┌────────────┐
│            │       │            │       │            │
│ Add Team   │──────►│ Create     │──────►│ Send Email │
│ Member UI  │       │ Invitation │       │ Invitation │
│            │       │            │       │            │
└────────────┘       └────────────┘       └────────────┘
                                                │
┌────────────┐       ┌────────────┐       ┌────▼───────┐
│            │       │            │       │            │
│ Complete   │◄──────┤ Process    │◄──────┤ Accept     │
│ Onboarding │       │ Invitation │       │ Invitation │
│            │       │            │       │            │
└────────────┘       └────────────┘       └────────────┘
```

## Security Architecture

### Authentication Security

- **Email/Password**: Standard authentication with email verification
- **Token Management**: Short-lived JWT with refresh token pattern
- **Session Storage**: Secure browser storage for session persistence

### Data Security

- **Row-Level Security**: Database rules ensure users only access their data
- **Input Validation**: Client and server-side validation prevents injection
- **HTTPS**: All communication encrypted in transit

## Performance Optimization

The application employs several techniques to ensure good performance:

- **Code Splitting**: Only load code needed for current feature
- **Lazy Loading**: Defer loading of non-critical components
- **Memoization**: Prevent unnecessary re-renders
- **Pagination**: Limit data fetching for large collections
- **Local Storage**: Cache commonly used data

## Deployment Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  CI/CD Pipeline │────►│  Static Hosting │◄────┤  Supabase Cloud │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

- **Frontend**: Deployed as static assets to CDN/hosting service
- **Backend**: Managed by Supabase cloud service
- **Database**: PostgreSQL hosted by Supabase
- **Storage**: Cloud storage for files and assets

## Integration Points

The system is designed for integration with:

- **Accounting Software**: Export data to popular accounting platforms
- **Payment Processors**: Connect for invoice payment collection
- **Tax Software**: Export data for tax preparation
- **Banking APIs**: Direct bank connections (future enhancement)

## Future Architecture Considerations

The system is designed to evolve with:

- **Offline Support**: Enhanced offline capabilities
- **Mobile Apps**: Native mobile application architecture
- **AI Processing**: More advanced AI for receipt scanning and categorization
- **Webhooks**: Event-driven integrations with third-party systems
