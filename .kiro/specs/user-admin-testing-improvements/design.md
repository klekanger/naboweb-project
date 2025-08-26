# Design Document

## Overview

This design improves the UserAdmin component testing by replacing hardcoded test data with actual component logic testing, implementing comprehensive component rendering tests, and ensuring proper validation of user interactions. The solution focuses on testing the real implementation rather than mock data, improving test reliability and catching regressions effectively.

## Architecture

### Testing Approach

The improved testing strategy will use a hybrid approach:

1. **Logic Extraction**: Extract testable functions from the component for pure unit testing
2. **Component Testing**: Use React Testing Library for component behavior testing
3. **Mock Strategy**: Mock external dependencies while testing real component logic
4. **Integration Testing**: Test component integration with context and external libraries

### Test File Structure

```
src/components/userAdmin/
├── UserAdmin.tsx                    # Main component
├── UserAdmin.test.tsx              # Comprehensive component tests
├── UserAdmin.logic.ts              # Extracted testable logic
└── UserAdmin.logic.test.ts         # Pure logic tests
```

## Components and Interfaces

### Extracted Logic Module

Create `UserAdmin.logic.ts` to extract testable functions:

```typescript
// Email validation function
export const validateEmail = (value: string): boolean => {
  return !!value.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i);
};

// Form validation function
export const validateForm = (user: NewUser): boolean => {
  return (
    validateEmail(user?.email) &&
    user?.firstName !== "" &&
    user?.lastName !== ""
  );
};

// Menu elements (exported from component)
export const menuElements = [
  {
    id: 0,
    name: "Vis brukere",
    description: "Viser alle brukere som er registrert...",
    menuIcon: Users,
  },
  // ... rest of menu items
];
```

### Test Utilities

Create test utilities for consistent component testing:

```typescript
// Test setup utility
export const renderUserAdminWithContext = (props: Partial<UserAdminProps> = {}) => {
  const defaultProps = {
    users: mockUsers,
    pagination: mockPagination,
  };

  return render(
    <UserAdminContext.Provider value={mockContextValue}>
      <UserAdmin {...defaultProps} {...props} />
    </UserAdminContext.Provider>
  );
};

// Mock data factories
export const createMockUser = (overrides: Partial<UserWithEmails> = {}) => ({
  id: "1",
  firstName: "John",
  lastName: "Doe",
  emailAddresses: [{ emailAddress: "john@example.com" }],
  ...overrides,
});
```

## Data Models

### Test Data Interfaces

```typescript
interface MockUserAdminContext {
  generalError: string;
  setGeneralError: vi.Mock;
  selectedMenu: number;
  setSelectedMenu: vi.Mock;
  isCreatingUser: boolean;
  setIsCreatingUser: vi.Mock;
  emailValue: string;
  setEmailValue: vi.Mock;
  newUser: NewUser;
  setNewUser: vi.Mock;
  // ... other context properties
}

interface TestScenario {
  name: string;
  setup: () => void;
  expectedBehavior: string;
  assertions: () => void;
}
```

### Component Test Categories

```typescript
enum TestCategory {
  MENU_STRUCTURE = "Menu Structure",
  FORM_VALIDATION = "Form Validation",
  USER_INTERACTIONS = "User Interactions",
  ERROR_HANDLING = "Error Handling",
  ACCESSIBILITY = "Accessibility",
  LOCALIZATION = "Norwegian Localization",
}
```

## Error Handling

### Test Error Scenarios

1. **Invalid Form Data**: Test validation with missing required fields
2. **Network Errors**: Mock server action failures and test error display
3. **Context Errors**: Test behavior when context is not available
4. **Invalid Props**: Test component behavior with invalid or missing props

### Error Message Testing

```typescript
// Test Norwegian error messages
const errorScenarios = [
  {
    clerkError: "form_password_not_strong_enough",
    expectedNorwegian: "velg et sikrere passord",
  },
  {
    clerkError: "email_address_not_available",
    expectedNorwegian: "E-postadressen er ikke tilgjengelig",
  },
];
```

## Testing Strategy

### Unit Tests (Logic)

Test extracted pure functions:

```typescript
describe("UserAdmin Logic", () => {
  describe("validateEmail", () => {
    it("validates correct email formats", () => {
      expect(validateEmail("user@example.com")).toBe(true);
      expect(validateEmail("invalid-email")).toBe(false);
    });
  });

  describe("menuElements", () => {
    it("contains all required menu items", () => {
      expect(menuElements).toHaveLength(5);
      expect(menuElements[0].name).toBe("Vis brukere");
      expect(menuElements[0].id).toBe(0);
    });
  });
});
```

### Component Tests (Behavior)

Test component rendering and interactions:

```typescript
describe("UserAdmin Component", () => {
  describe("Menu Rendering", () => {
    it("renders all menu items from menuElements", () => {
      renderUserAdminWithContext();

      menuElements.forEach(element => {
        expect(screen.getByText(element.name)).toBeInTheDocument();
      });
    });

    it("highlights selected menu item", () => {
      const contextWithSelectedMenu = {
        ...mockContextValue,
        selectedMenu: 1
      };

      render(
        <UserAdminContext.Provider value={contextWithSelectedMenu}>
          <UserAdmin users={[]} pagination={mockPagination} />
        </UserAdminContext.Provider>
      );

      expect(screen.getByText("Inviter bruker")).toHaveClass("font-bold");
    });
  });
});
```

### Integration Tests (Context)

Test component integration with UserAdminContext:

```typescript
describe("UserAdmin Context Integration", () => {
  it("updates context when menu item is selected", async () => {
    const mockSetSelectedMenu = vi.fn();
    const contextValue = {
      ...mockContextValue,
      setSelectedMenu: mockSetSelectedMenu,
    };

    renderUserAdminWithContext({ contextValue });

    await user.click(screen.getByText("Inviter bruker"));
    expect(mockSetSelectedMenu).toHaveBeenCalledWith(1);
  });
});
```

### Accessibility Tests

Test keyboard navigation and ARIA attributes:

```typescript
describe("Accessibility", () => {
  it("supports keyboard navigation for menu items", async () => {
    renderUserAdminWithContext();

    const firstMenuItem = screen.getByText("Vis brukere");
    firstMenuItem.focus();

    await user.keyboard("{Tab}");
    expect(screen.getByText("Inviter bruker")).toHaveFocus();
  });

  it("has proper ARIA labels for form inputs", () => {
    renderUserAdminWithContext();

    // Switch to create user form
    user.click(screen.getByText("Ny bruker"));

    expect(screen.getByLabelText("Fornavn")).toBeInTheDocument();
    expect(screen.getByLabelText("E-post")).toBeInTheDocument();
  });
});
```

## Implementation Notes

### Mock Strategy

- **External Dependencies**: Mock Clerk, HeroUI components, and server actions
- **Context**: Provide controlled mock context for predictable testing
- **Real Logic**: Test actual component logic, not mocked implementations

### Test Data Management

- Use factory functions for creating consistent test data
- Separate test data from test logic for maintainability
- Use realistic Norwegian text in test data

### Performance Considerations

- Extract heavy logic to separate modules for faster unit testing
- Use shallow rendering where full component rendering isn't needed
- Mock expensive operations like API calls

### Norwegian Localization Testing

- Validate all Norwegian text content in components
- Test error message translations
- Verify accessibility labels are in Norwegian
- Test form validation messages in Norwegian

### Continuous Integration

- Run tests on every commit
- Require passing tests for pull requests
- Generate test coverage reports
- Alert on test failures or coverage drops
