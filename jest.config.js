/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: 'node',
  preset: 'ts-jest',
  roots: ['<rootDir>'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node', 'mjs'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(nanoid)/)' // Allow transformation of nanoid
  ],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'lib/**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!**/*.d.ts'
  ],
  setupFiles: ['<rootDir>/jest.setup.js'],
  // Mocking configuration
  moduleNameMapper: {
    '^@vercel/kv$': '<rootDir>/__mocks__/vercel-kv.ts',
    '^bcrypt$': '<rootDir>/__mocks__/bcrypt.ts',
    '^nanoid$': '<rootDir>/__mocks__/nanoid.ts'
  }
};
