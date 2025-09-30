/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  preset: "ts-jest",
     silent: true, // Suppress console logs during tests
         verbose: false,
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  moduleNameMapping: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: ["**/tests/**/*.spec.ts"],
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts"],
};