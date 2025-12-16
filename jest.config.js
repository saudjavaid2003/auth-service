/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  preset: "ts-jest",

  // Run tests sequentially
  maxWorkers: 1,
  
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  testMatch: ["**/tests/**/*.spec.ts"],

  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts"],

  // ⚠️ REMOVE THIS LINE (or create the file):
  // setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"], 
  
  testTimeout: 30000,
};