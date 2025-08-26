# Testing Strategy for User Admin Page

## Overview

This document outlines the testing approach for the user administration functionality.

## Test Levels

### 1. Unit Tests ✅

- **Location**: `src/lib/userUtils.test.ts`
- **Focus**: Pure functions, utility logic, validation
- **Examples**: Pagination calculation, email validation, user mapping

### 2. Component Tests ✅

- **Location**: `src/app/(with-navbar)/(protected-routes)/user-admin-page/page.test.tsx`
- **Focus**: Page-level logic, authentication, data fetching
- **Coverage**: 10/10 tests passing

### 3. Integration Tests ✅

- **Location**: `src/app/(with-navbar)/(protected-routes)/user-admin-page/page.integration.test.tsx`
- **Focus**: End-to-end page functionality
- **Coverage**: Authentication flow, data processing, error handling

### 4. Simple Component Tests ✅

- **Location**: `src/components/userAdmin/UserAdmin.simple.test.tsx`
- **Focus**: Isolated component logic without complex UI interactions

## Key Testing Principles

### ✅ Do Test

- Authentication and authorization logic
- Data fetching and processing
- Error handling and edge cases
- Form validation logic
- Pagination calculations
- User role management

### ❌ Avoid Testing

- Complex UI interactions with multiple dependencies
- Third-party library internals (Clerk, HeroUI)
- Styling and visual appearance
- Server actions (test separately)

## Mock Strategy

### External Dependencies

```typescript
// Mock Clerk authentication
vi.mock("@clerk/nextjs/server", () => ({
  clerkClient: vi.fn().mockReturnValue({
    users: { getUserList: mockGetUserList },
  }),
}));

// Mock validation utilities
vi.mock("@/lib/validateUserRoles", () => ({
  validateUserRoles: mockValidateUserRoles,
  validRoles: { ADMIN: "admin", USER: "user", EDITOR: "editor" },
}));
```

### Component Mocking

```typescript
// Mock complex child components
vi.mock("@/components/userAdmin/UserAdmin", () => ({
  __esModule: true,
  default: MockUserAdmin,
}));
```

## Test Data Patterns

### User Data

```typescript
const mockUser = {
  id: "1",
  firstName: "John",
  lastName: "Doe",
  emailAddresses: [{ emailAddress: "john@example.com" }],
  createdAt: 1640995200000,
  publicMetadata: { roles: ["user"] },
  imageUrl: "",
};
```

### Pagination Data

```typescript
const mockPagination = {
  currentPage: 1,
  totalPages: 1,
  totalCount: 2,
  hasNextPage: false,
  hasPreviousPage: false,
};
```

## Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
npx vitest run src/app/\(with-navbar\)/\(protected-routes\)/user-admin-page/page.test.tsx

# Run tests in watch mode
npx vitest watch

# Run with coverage
npx vitest --coverage
```

## Test Maintenance

### When to Update Tests

- When adding new features to user admin
- When changing authentication logic
- When modifying data fetching patterns
- When updating user role management

### Test File Organization

```
src/
├── app/(with-navbar)/(protected-routes)/user-admin-page/
│   ├── page.test.tsx                 # Main page tests
│   ├── page.integration.test.tsx     # Integration tests
│   └── page.tsx                      # Implementation
├── components/userAdmin/
│   ├── UserAdmin.simple.test.tsx     # Simple component tests
│   └── UserAdmin.tsx                 # Implementation
├── lib/
│   ├── userUtils.test.ts             # Utility function tests
│   └── validateUserRoles.ts          # Implementation
└── test-utils/
    └── setup.ts                      # Test configuration
```

## Success Metrics

- ✅ Page tests: 10/10 passing
- ✅ Authentication coverage: Complete
- ✅ Error handling coverage: Complete
- ✅ Data fetching coverage: Complete
- ✅ Edge case coverage: Good

## Next Steps

1. Extract utility functions from page component for easier testing
2. Add more unit tests for form validation logic
3. Consider adding E2E tests with Playwright for critical user flows
4. Set up test coverage reporting
5. Add performance testing for large user lists
