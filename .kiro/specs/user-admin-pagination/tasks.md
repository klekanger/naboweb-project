# Implementation Plan

- [x] 1. Create TypeScript interfaces for pagination

  - Add `PaginationData` interface to types.ts with currentPage, totalPages, totalCount, hasNextPage, hasPreviousPage
  - Update `UserTableProps` interface to include optional pagination data
  - Create interface for UserAdmin component props with pagination data
  - _Requirements: 1.1, 2.1, 2.2_

- [x] 2. Modify server-side user fetching with pagination

  - [x] 2.1 Update fetchUsers function to accept page parameter

    - Add page parameter to fetchUsers function signature in page.tsx
    - Change Clerk getUserList limit from 500 to 10
    - Calculate offset using (page - 1) \* 10 formula
    - Update Clerk getUserList call with limit: 10 and calculated offset
    - _Requirements: 1.1, 1.2_

  - [x] 2.2 Add pagination metadata calculation

    - Extract totalCount from Clerk getUserList response
    - Calculate totalPages using Math.ceil(totalCount / 10)
    - Determine hasNextPage and hasPreviousPage boolean values
    - Return pagination data object with all required fields
    - _Requirements: 2.1, 2.2_

  - [x] 2.3 Update page component to handle searchParams
    - Add searchParams prop to page component function signature
    - Parse page parameter from searchParams with default value of 1
    - Add page validation and redirect to page 1 if invalid
    - Pass page parameter to fetchUsers function
    - Pass pagination data to UserAdmin component
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 3. Update UserAdmin component for pagination props

  - Modify UserAdmin component props interface to accept pagination data
  - Pass pagination data through to UserTable component
  - Maintain existing functionality for user creation, editing, and other features
  - _Requirements: 1.1, 2.1_

- [x] 4. Implement pagination controls in UserTable component

  - [x] 4.1 Remove existing client-side pagination logic

    - Remove ROWS_PER_PAGE constant (currently set to 20)
    - Remove existing pages calculation and usersToRender logic
    - Remove existing client-side pagination state and useMemo
    - Remove existing HeroUI Pagination component from bottomContent
    - _Requirements: 1.1_

  - [x] 4.2 Add server-side pagination controls

    - Import useRouter from next/navigation for page navigation
    - Create handlePageChange function to update URL with new page parameter
    - Add HeroUI Pagination component with server-side pagination props
    - Configure pagination with Norwegian labels and accessibility attributes
    - _Requirements: 1.3, 1.4, 1.5, 1.6, 5.1, 5.2, 5.3_

  - [x] 4.3 Update user count display
    - Modify user count display to show total count from server pagination
    - Update text to reflect server-side pagination (e.g., "Viser side X av Y (Z brukere totalt)")
    - _Requirements: 2.1, 2.2_

- [x] 5. Maintain search functionality with pagination

  - [x] 5.1 Update search to work with paginated data

    - Modify search logic to filter only current page users (10 users max)
    - Ensure search reset doesn't interfere with pagination
    - Update search result count to reflect filtered results from current page
    - _Requirements: 3.1, 3.4_

  - [x] 5.2 Handle search state with pagination
    - Ensure search functionality works on current page data
    - Maintain existing search UX while working with smaller dataset
    - Update search placeholder and help text if needed
    - _Requirements: 3.2, 3.3_

- [ ] 6. Add loading states for page transitions

  - Create loading.tsx file for user-admin-page route
  - Implement loading spinner or skeleton during page navigation
  - Ensure smooth user experience during page transitions
  - _Requirements: 1.3, 1.4_

- [ ] 7. Add Norwegian localization for pagination

  - Add Norwegian text for pagination controls ("Forrige", "Neste")
  - Add ARIA labels in Norwegian for accessibility
  - Update user count display text to Norwegian
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 8. Write unit tests for pagination logic

  - [ ] 8.1 Test pagination calculations

    - Write tests for offset calculation: (page - 1) \* limit
    - Write tests for totalPages calculation: Math.ceil(totalCount / limit)
    - Write tests for hasNextPage and hasPreviousPage logic
    - _Requirements: 1.1, 2.2_

  - [ ] 8.2 Test URL parameter handling
    - Write tests for searchParams parsing with valid page numbers
    - Write tests for invalid page parameter handling and redirect logic
    - Write tests for default page value when no parameter provided
    - _Requirements: 4.1, 4.2, 4.3_

- [ ] 9. Integration testing for pagination flow

  - [ ] 9.1 Test page navigation functionality

    - Write tests for clicking next/previous buttons
    - Write tests for clicking specific page numbers
    - Write tests for URL updates during navigation
    - _Requirements: 1.3, 1.4, 4.1_

  - [ ] 9.2 Test search integration with pagination
    - Write tests for search functionality on paginated data
    - Write tests for search result filtering on current page
    - Write tests for search state management with pagination
    - _Requirements: 3.1, 3.2, 3.4_
