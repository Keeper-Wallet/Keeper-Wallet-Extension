export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: {
          esModuleInterop: true,
          baseUrl: './src',
        },
      },
    ],
  },

  // Coverage config
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/*.test.{ts,tsx}',
    '!src/copied/**',
    '!src/fonts/**',
    '!src/assets/logos/**',
    '!src/assets/unit0_tokens/**',
    '!src/index.ejs',
    '!src/background.ts',
    '!src/contentscript.ts',
    '!src/inpage.ts',
  ],

  coverageReporters: ['html', 'text', 'lcov', 'text-summary'],

  coverageThreshold: {
    global: {
      statements: 0,
      branches: 0,
      functions: 0,
      lines: 0,
    },
  },

  coverageDirectory: 'coverage',
};
