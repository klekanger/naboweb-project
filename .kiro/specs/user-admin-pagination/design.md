# Design Document

## Overview

This design implements server-side pagination for the user administration page by modifying the existing `fetchUsers` function to accept pagination parameters and updating the UI components to handle paginated data. The solution leverages Clerk's built-in pagination support with `limit` and `offset` parameters while maintaining the existing search functionality through client-side filtering.

## Architecture

### Server-Side Changes

The pagination will be implemented at the server level in the page component (`/user-admin-page/page.tsx`) by:

1. **URL Search Parameters**: Using Next.js `searchParams` to capture the current page from the URL
2. **Clerk API Integration**: Modifying `fetchUsers` to use Clerk's `limit` and `offset` parameters
3. **Data Structure**: Returning both user data and pagination metadata (`totalCount`, `currentPage`, `totalPages`)

### Client-Side Changes

The client-side components will be updated to:

1. **Pagination Controls**: Add HeroUI Pagination component to `UserTable.tsx`
2. **Navigation**: Implement page navigation using Next.js router
3. **State Management**: Handle loading states during page transitions
4. **Search Integration**: Maintain existing search functionality with client-side filtering

## Components and Interfaces

### Modified Components

#### 1. `/user-admin-page/page.tsx`

- Add `searchParams` prop to capture page parameter
- Modify `fetchUsers` function to accept pagination parameters
- Calculate pagination metadata
- Pass pagination data to `UserAdmin` component

#### 2. `UserAdmin.tsx`

- Accept pagination props
- Pass pagination data to `UserTable` component

#### 3. `UserTable.tsx`

- Remove existing client-side pagination logic
- Add server-side pagination controls
- Implement page navigation handlers
- Maintain search functionality with client-side filtering

### New Interfaces

```typescript
interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface UserAdminProps {
  users: UserWithEmails[];
  pagination: PaginationData;
}

interface UserTableProps {
  users: UserWithEmails[];
  pagination: PaginationData;
  className?: string;
}
```

## Data Models

### Pagination Parameters

```typescript
interface PaginationParams {
  page: number; // Current page (1-based)
  limit: number; // Items per page (default: 10)
}
```

### Clerk API Integration

```typescript
interface ClerkUserListParams {
  limit: number; // Maximum 500, we'll use 10
  offset: number; // Calculated as (page - 1) * limit
  orderBy: string; // Default: '-created_at'
}
```

### Response Structure

```typescript
interface PaginatedUserResponse {
  users: UserWithEmails[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
```

## Error Handling

### Invalid Page Parameters

- **Scenario**: User accesses URL with invalid page number (e.g., page=0, page=999)
- **Handling**: Redirect to page 1 using Next.js `redirect()`
- **User Feedback**: No explicit error message, seamless redirect

### API Failures

- **Scenario**: Clerk API fails to return user data
- **Handling**: Display existing error UI with Norwegian error message
- **Fallback**: Show "Noe gikk galt" message with back button

### Loading States

- **Scenario**: Page navigation in progress
- **Handling**: Show loading spinner during server-side data fetching
- **Implementation**: Use Next.js built-in loading states

## Testing Strategy

### Unit Tests

1. **Pagination Calculation**: Test page/offset calculations
2. **URL Parameter Parsing**: Test searchParams handling
3. **Component Props**: Test prop passing between components

### Integration Tests

1. **Page Navigation**: Test clicking pagination buttons
2. **URL Updates**: Test URL parameter updates
3. **Search + Pagination**: Test search with pagination reset

### Manual Testing

1. **Performance**: Verify faster page loads with 10 users vs 500
2. **Accessibility**: Test keyboard navigation and screen reader support
3. **Norwegian Localization**: Verify all text is in Norwegian

## Implementation Notes

### Clerk API Considerations

- Clerk's `getUserList` supports `limit` (max 500) and `offset` parameters
- Response includes `{ data, totalCount }` structure
- Existing sorting by `orderBy: '-created_at'` will be maintained

### Search Functionality

- Current search filters 500 users client-side
- New approach: Search will filter the current page (10 users) client-side
- Trade-off: Less comprehensive search but better performance
- Future enhancement: Could implement server-side search using Clerk's `query` parameter

### URL Structure

- Current: `/user-admin-page`
- New: `/user-admin-page?page=2`
- Maintains backward compatibility (no page param defaults to page 1)

### Performance Benefits

- Reduced initial load time (10 users vs 500)
- Lower memory usage in browser
- Faster rendering of user table
- Better mobile experience

### Norwegian Localization

- Pagination labels: "Forrige", "Neste", "Side X av Y"
- ARIA labels: "Gå til side X", "Forrige side", "Neste side"
- Loading text: "Laster brukere..."
