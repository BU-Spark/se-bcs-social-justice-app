// Import Jest DOM extensions
import '@testing-library/jest-dom';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    pathname: '/',
    query: {},
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}), { virtual: true });

// Mock Clerk auth
jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    user: {
      id: 'test-user-id',
      fullName: 'Test User',
    },
    isLoaded: true,
    isSignedIn: true,
  }),
  auth: () => ({
    userId: 'test-user-id',
  }),
}), { virtual: true });

// Mock fetch API
global.fetch = jest.fn();

// Clean up mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
}); 