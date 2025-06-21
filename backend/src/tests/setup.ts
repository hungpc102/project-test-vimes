// Global test setup
import dotenv from 'dotenv';

// Jest types declaration
/// <reference types="jest" />

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Mock console methods in tests
global.console = {
  ...console,
  // Keep error and warn for debugging
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
};

// Mock process.env for tests
process.env.NODE_ENV = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'warehouse_test';
process.env.DB_USER = 'postgres';
process.env.DB_PASSWORD = 'test';

// Set test timeout
jest.setTimeout(30000); 