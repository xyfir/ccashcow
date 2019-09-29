module.exports = {
  setupFilesAfterEnv: ['<rootDir>/lib/test-setup.ts'],
  testEnvironment: 'node',
  modulePaths: ['<rootDir>'],
  transform: { '^.+\\.ts$': 'ts-jest' }
};
