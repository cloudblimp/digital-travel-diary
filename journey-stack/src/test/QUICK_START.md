# Quick Test Guide

## TL;DR Commands

```bash
# Run all tests
npm test

# Run tests with visual UI
npm run test:ui

# Check code coverage
npm run test:coverage

# Run single test file
npm test src/components/__tests__/Navbar.test.jsx

# Watch mode (auto-run on changes)
npm test -- --watch
```

## Test Files Location

All test files are in the `__tests__` directories:

```
src/
├── components/__tests__/       # Component tests
├── hooks/__tests__/             # Hook tests
├── utils/__tests__/             # Utility function tests
├── contexts/__tests__/          # Context tests
└── test/
    ├── setupTests.js            # Global setup
    └── TEST_SUMMARY.md          # Detailed documentation
```

## What's Tested

✅ **Components**: Navbar, TripCard  
✅ **Hooks**: useTrips (trip management)  
✅ **Utilities**: Date validation functions  
✅ **Contexts**: Auth and Trip state management (placeholder)  

## Test Coverage Report

Run to see which files have test coverage:
```bash
npm run test:coverage
```

Coverage report opens in `coverage/index.html`

## Adding New Tests

1. Create file: `src/features/__tests__/feature.test.jsx`
2. Use this template:

```javascript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('Feature Name', () => {
  it('does something', () => {
    expect(true).toBe(true);
  });
});
```

## GitHub Actions CI/CD

Tests run automatically on:
- Pull requests
- Commits to main branch
- Manual workflow_dispatch trigger

See `.github/workflows/` for configuration.

---

For detailed information, see [TEST_SUMMARY.md](./TEST_SUMMARY.md)
