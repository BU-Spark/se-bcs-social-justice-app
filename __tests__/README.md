# Tests for Social Justice App

This directory contains tests for the Social Justice App. The tests are organized by feature area.

## Test Structure

- `communities/`: Tests for community-related features
  - `CommunitiesPage.test.tsx`: Tests for the Communities listing page
  - `CommunityDetail.test.tsx`: Tests for the Community detail page

- `scheduling/`: Tests for scheduling-related features
  - `SchedulingPage.test.tsx`: Tests for the appointment type selection page
  - `SelectDate.test.tsx`: Tests for the date selection page
  - `ConfirmAppointment.test.tsx`: Tests for the appointment confirmation page

## Running Tests

To run all tests:

```bash
npm test
```

To run tests with coverage:

```bash
npm run test:coverage
```

To run tests in watch mode (tests will re-run when files change):

```bash
npm run test:watch
```

## Test Conventions

1. Tests are organized by feature area
2. Test files are named after the component they test with `.test.tsx` extension
3. Each test file focuses on testing one component or page
4. Tests use React Testing Library for rendering and querying components
5. Mock data is defined within each test file
6. External dependencies (fetch, router, etc.) are mocked

## Common Patterns

- API calls are mocked using Jest's `jest.fn()` to mock the `fetch` function
- Router functions like `useRouter` and `useSearchParams` are mocked
- Context providers like `SidebarContext` are mocked
- Tests verify:
  - Components render without errors
  - Loading states are displayed correctly
  - Data is displayed correctly after loading
  - User interactions work as expected
  - Error states are handled properly

## Known Issues

- Some tests may show React act() warnings in the console. These are related to asynchronous state updates in the components being tested and don't affect the test results. 