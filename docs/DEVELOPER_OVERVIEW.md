# DigitBooks Developer Documentation

## Architecture Overview

DigitBooks is a React-based single-page application (SPA) built with the following technology stack:

- **Frontend Framework**: React with TypeScript
- **Build Tool**: Vite
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **State Management**: React Context API and React Query
- **Routing**: React Router
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Data Visualization**: Recharts
- **Forms**: React Hook Form with Zod validation

## Component Structure

The application follows a modular architecture with the following main sections:

### Core Application Structure

- `src/App.tsx`: Main application component and routing configuration
- `src/main.tsx`: Application entry point
- `src/pages/`: Page components that correspond to routes
- `src/components/`: Reusable UI components organized by feature

### Key Features and Their Implementation

#### 1. Authentication

- Implementation: Supabase Auth with JWT tokens
- Files:
  - `src/contexts/auth/`: Authentication context provider
  - `src/components/auth/`: Login, signup, and verification components
  - `src/components/auth/RequireAuth.tsx`: Protected route wrapper

#### 2. Expense Management

- Implementation: CRUD operations via context + database
- Files:
  - `src/contexts/expense/`: Expense state management
  - `src/components/expenses/`: UI components for expense operations
  - `src/components/expenses/upload/`: Bank statement import functionality

#### 3. Invoicing

- Implementation: PDF generation and client management
- Files:
  - `src/contexts/InvoiceContext.tsx`: Invoice state management
  - `src/components/invoicing/`: Invoice creation and management UI

#### 4. Team Management

- Implementation: Role-based access control and invitations
- Files:
  - `src/components/settings/team/`: Team management components
  - `src/lib/team/`: Team business logic

## Data Flow

### State Management

The application uses React Context API for global state management:

1. **Context Providers** create state containers for different features
2. **Hooks** expose context values and actions to components
3. **Local state** manages component-specific data

Example flow for expense management:

```
User Action → Component Event Handler → Context Action → 
State Update → Component Re-render → Database Sync
```

### API Integration

Supabase provides backend functionality:

1. **Authentication**: JWT-based user management
2. **Database**: PostgreSQL for data storage
3. **Storage**: File uploads for receipts and documents
4. **Functions**: Serverless functions for complex operations

## Key Code Patterns

### Context Pattern

```typescript
// Context definition
export const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

// Provider implementation
export const ExpenseProvider: FC<{children: ReactNode}> = ({children}) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  
  // Actions and derived data...
  
  return (
    <ExpenseContext.Provider value={{expenses, addExpense, /*...other values*/}}>
      {children}
    </ExpenseContext.Provider>
  );
};

// Custom hook for consuming context
export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) throw new Error("useExpenses must be used within ExpenseProvider");
  return context;
};
```

### Component Composition

```typescript
// Parent component
const ExpensePage = () => {
  const { expenses } = useExpenses();
  
  return (
    <PageLayout>
      <ExpenseHeader />
      <ExpenseFilters />
      <ExpenseList expenses={expenses} />
    </PageLayout>
  );
};

// Child component
const ExpenseList = ({expenses}: {expenses: Expense[]}) => {
  return (
    <div>
      {expenses.map(expense => (
        <ExpenseItem key={expense.id} expense={expense} />
      ))}
    </div>
  );
};
```

### Custom Hooks

```typescript
export const useExpenseForm = (initialValues?: Partial<Expense>) => {
  const [description, setDescription] = useState(initialValues?.description || "");
  const [amount, setAmount] = useState(initialValues?.amount?.toString() || "");
  // Other state and handlers...
  
  const handleSubmit = () => {
    // Form submission logic
  };
  
  return {
    description,
    setDescription,
    amount,
    setAmount,
    // Other values and handlers...
    handleSubmit
  };
};
```

## File Upload Process

Bank statement import follows these steps:

1. **File Selection**: User uploads CSV/Excel via `UploadDialogContent`
2. **Parsing**: `edgeFunctionParser.ts` processes file and extracts transactions
3. **Data Mapping**: Converts raw data to `ParsedTransaction[]`
4. **Tagging**: User reviews/categorizes transactions in `TransactionTaggingDialog`
5. **Storage**: Approved transactions saved via `saveTransactionsToDatabase()`
6. **Conversion**: Transactions converted to expenses via `prepareExpensesFromTransactions()`
7. **Addition**: New expenses added to state and database

## Team Invitation Process

Team member invitation follows these steps:

1. **Initiation**: Admin adds member in `TeamHeader`
2. **Validation**: Contact details validated
3. **Database Entry**: User added to `team_members` table with "pending" status
4. **Token Generation**: Secure invitation token created via database function
5. **Email Delivery**: Invitation email sent with secure link
6. **Registration**: New user registers or signs in via invitation link
7. **Activation**: User's account linked to team member record

## Error Handling Strategy

The application uses a multi-layered error handling approach:

1. **Form Validation**: Zod + React Hook Form for input validation
2. **API Error Handling**: Try/catch blocks with toast notifications
3. **Global Error Boundaries**: React error boundaries for component failures
4. **Fallback UI**: Graceful degradation when operations fail

## Performance Considerations

1. **Code Splitting**: Lazy loading for routes and large components
2. **Memoization**: React.memo and useMemo for expensive operations
3. **Virtualization**: For long lists (expenses, transactions)
4. **Batch Operations**: For multiple database operations

## Development Workflow

1. **Component Development**: Build and test components in isolation
2. **Feature Integration**: Combine components into features
3. **State Integration**: Connect features to global state
4. **Database Integration**: Connect state to database operations

## Extension Points

The application is designed for extension in these areas:

1. **Categories**: Add custom expense/revenue categories
2. **Reports**: Create new report types
3. **Integrations**: Connect to external services
4. **Team Roles**: Add granular permission levels
