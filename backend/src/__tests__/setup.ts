import 'reflect-metadata';

// Mock the data source to avoid actual database connections during testing
jest.mock('../data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
    initialize: jest.fn(),
    isInitialized: true,
  },
}));