// Mock implementation of bcrypt for testing
export const hash = jest.fn((password: string) => Promise.resolve(`hashed_${password}`))
export const compare = jest.fn((password: string, hash: string) => Promise.resolve(true))
