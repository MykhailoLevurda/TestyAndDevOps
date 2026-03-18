import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/generated/**',
    '!src/app/**',
  ],
  coverageThreshold: {
    global: {
      lines: 70,
      branches: 50,
    },
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          module: 'commonjs',
          moduleResolution: 'node',
          esModuleInterop: true,
          allowJs: true,
          skipLibCheck: true,
          strict: true,
          paths: {
            '@/*': ['./src/*'],
          },
          baseUrl: '.',
        },
      },
    ],
  },
};

export default config;
