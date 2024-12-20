// Global setup for Jest tests
// Add any global configurations or mocks here

// Increase timeout for async tests
jest.setTimeout(10000);

// Mock console to reduce noise during testing
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};
