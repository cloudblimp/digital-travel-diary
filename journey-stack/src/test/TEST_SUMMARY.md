# Test Suite Documentation

## Overview

This document provides a comprehensive guide to the test suite for the Digital Travel Diary application. The tests are built using **Vitest** and **React Testing Library**, covering key functionalities across components, hooks, and utilities.

## Project Repository

**GitHub Link:** [journey-stack](https://github.com/cloudblimp/journey-stack)

---

## Test Structure

```
src/
├── test/
│   └── setupTests.js              # Global test setup & mocks
├── components/__tests__/
│   ├── Navbar.test.jsx            # Navigation component tests
│   └── TripCard.test.jsx           # Trip card display tests
├── hooks/__tests__/
│   └── useTrips.test.js            # Trip management hook tests
└── utils/__tests__/
    └── dateUtils.test.js           # Date validation utility tests
```

---

## Running Tests

### Installation
First, install test dependencies:
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests with UI Dashboard
```bash
npm run test:ui
```

### Generate Coverage Report
```bash
npm run test:coverage
```

---

## Test Coverage

### 1. **Date Utilities** (`src/utils/__tests__/dateUtils.test.js`)

**File:** `dateUtils.test.js`  
**Tested Functions:** `validateTripTitle`, `validateDestination`, `validateTripDates`

#### Test Cases:
- ✅ **Valid Trip Titles**: Accepts 3+ character titles with valid characters
- ✅ **Invalid Titles**: Rejects titles < 3 chars or with special characters
- ✅ **Valid Destinations**: Accepts location names with 2+ characters
- ✅ **Invalid Destinations**: Rejects destinations < 2 chars
- ✅ **Valid Date Ranges**: Accepts end date >= start date
- ✅ **Invalid Date Ranges**: Rejects when end < start
- ✅ **Same-Day Trips**: Allows trips on same day
- ✅ **Historical Dates**: Rejects dates before 1950

**Coverage:** Input validation, date comparison, error handling

---

### 2. **Navbar Component** (`src/components/__tests__/Navbar.test.jsx`)

**File:** `Navbar.test.jsx`  
**Component:** Navigation bar with user menu

#### Test Cases:
- ✅ **Renders Navigation**: Checks navbar displays correctly
- ✅ **User Information**: Displays logged-in user email
- ✅ **Navigation Links**: Verifies links are present
- ✅ **Mobile Menu Toggle**: Tests menu open/close functionality
- ✅ **Menu Interaction**: Validates click handlers work
- ✅ **Profile Section**: Confirms user profile displays
- ✅ **Accessibility**: Checks ARIA attributes and roles

**Coverage:** Component rendering, user state, interactions, mobile responsiveness

---

### 3. **TripCard Component** (`src/components/__tests__/TripCard.test.jsx`)

**File:** `TripCard.test.jsx`  
**Component:** Individual trip display card

#### Test Cases:
- ✅ **Content Rendering**: Displays trip title, destination, dates
- ✅ **Image Display**: Verifies cover image loads with correct URL
- ✅ **Click Handling**: Tests card click callback is invoked
- ✅ **Description Display**: Shows description when provided
- ✅ **Graceful Degradation**: Handles missing description
- ✅ **CSS Classes**: Validates correct styling classes applied
- ✅ **Hover Effects**: Confirms hover state styling
- ✅ **Data Integration**: Works with various trip objects

**Coverage:** Component rendering, event handling, conditional rendering, styling

---

### 4. **useTrips Hook** (`src/hooks/__tests__/useTrips.test.js`)

**File:** `useTrips.test.js`  
**Hook:** Trip management and Firebase integration

#### Test Cases:
- ✅ **Hook Initialization**: Verifies initial state
- ✅ **Trip Creation**: Tests creating new trips with valid data
- ✅ **Error Handling**: Catches and reports creation errors
- ✅ **Fetching Trips**: Retrieves user's trips from database
- ✅ **Updating Trips**: Modifies existing trip data
- ✅ **Deleting Trips**: Removes trips from database
- ✅ **Loading States**: Tracks loading/error states
- ✅ **Firebase Integration**: Validates Firestore interactions

**Coverage:** Data management, async operations, error states, Firebase mocking

---

## Test Configuration

### Vite Configuration (`vite.config.js`)

```javascript
test: {
  globals: true,                // Global test functions
  environment: 'jsdom',         // Browser-like environment
  setupFiles: ['./src/test/setupTests.js'],
  coverage: {
    provider: 'v8',
    reporter: ['text', 'html', 'lcov'],
    reportsDirectory: './coverage',
    exclude: [
      'node_modules/',
      'firebase/**',
      '**/*.css'
    ],
  },
}
```

### Setup File (`src/test/setupTests.js`)

- Configures React Testing Library cleanup
- Mocks Firebase modules
- Sets up global test utilities
- Initializes DOM polyfills

---

## Key Testing Patterns

### 1. Component Testing
```javascript
import { render, screen } from '@testing-library/react';

it('renders component correctly', () => {
  render(<Component />);
  expect(screen.getByText('text')).toBeInTheDocument();
});
```

### 2. User Interaction Testing
```javascript
import userEvent from '@testing-library/user-event';

it('handles click events', async () => {
  const user = userEvent.setup();
  const mockFn = vi.fn();
  
  render(<Button onClick={mockFn} />);
  await user.click(screen.getByRole('button'));
  
  expect(mockFn).toHaveBeenCalled();
});
```

### 3. Hook Testing
```javascript
import { renderHook, waitFor } from '@testing-library/react';

it('updates state correctly', async () => {
  const { result } = renderHook(() => useCustomHook());
  
  await waitFor(() => {
    expect(result.current.value).toBe(expectedValue);
  });
});
```

### 4. Firebase Mocking
```javascript
vi.mock('firebase/firestore', () => ({
  addDoc: vi.fn(() => Promise.resolve({ id: 'mock-id' })),
}));
```

---

## Coverage Goals

| Category | Target | Status |
|----------|--------|--------|
| Components | 80%+ | In Progress |
| Hooks | 85%+ | In Progress |
| Utilities | 95%+ | In Progress |
| Overall | 75%+ | In Progress |

---

## Future Test Improvements

### Planned Additions:
- [ ] Trip Map component tests
- [ ] Auth context integration tests
- [ ] Image upload functionality tests
- [ ] Form validation tests
- [ ] API error handling tests
- [ ] Mobile responsiveness tests
- [ ] Accessibility (a11y) tests
- [ ] Performance tests

### E2E Testing:
- Cypress or Playwright tests for full user flows
- Login → Create Trip → View Trip → Edit → Delete workflow
- Image upload and storage tests

---

## Debugging Tests

### Run Single Test File
```bash
npm test src/components/__tests__/Navbar.test.jsx
```

### Watch Mode (Re-run on file change)
```bash
npm test -- --watch
```

### Verbose Output
```bash
npm test -- --reporter=verbose
```

### Check Coverage Gaps
```bash
npm run test:coverage
```

Open `coverage/index.html` to view detailed coverage report.

---

## CI/CD Integration

Tests can be integrated into GitHub Actions:

```yaml
- name: Run Tests
  run: npm test

- name: Generate Coverage
  run: npm run test:coverage

- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

---

## Best Practices

1. **Write Descriptive Tests**: Use clear `describe` and `it` labels
2. **Test User Behavior**: Focus on what users do, not implementation details
3. **Mock External Dependencies**: Firebase, API calls, router
4. **Keep Tests Isolated**: Each test should be independent
5. **Use Arrange-Act-Assert**: Clear test structure
6. **Test Error Cases**: Invalid inputs, network failures, edge cases
7. **Avoid Testing Implementation**: Test functionality and outcomes

---

## Troubleshooting

### Tests Hang
- Increase timeout: `it('test', async () => {...}, 10000)`
- Check for missing `waitFor` in async code

### Firebase Mocks Not Working
- Ensure `setupTests.js` is loaded in `vite.config.js`
- Clear cache: `rm -rf node_modules/.vite`

### Component Not Rendering
- Check if all required props are provided
- Verify mocked dependencies are correct

---

## References

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library Docs](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Last Updated:** December 6, 2025  
**Maintained By:** Digital Travel Diary Team
