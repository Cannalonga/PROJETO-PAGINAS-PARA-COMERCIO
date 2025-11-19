// jest.api.config.js
/** @type {import('jest').Config} */
const config = {
  displayName: 'api',
  testEnvironment: 'node',
  preset: 'ts-jest',
  testMatch: ['<rootDir>/app/api/**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFilesAfterEnv: [],
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    },
  },
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
};

module.exports = config;

