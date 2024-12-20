// Mock implementation of @vercel/kv for testing
export const kv = {
  set: jest.fn(),
  get: jest.fn(),
  sadd: jest.fn(),
  smembers: jest.fn(),
  srandmember: jest.fn(),
  keys: jest.fn(),
  hincrby: jest.fn(),
  hget: jest.fn()
};
