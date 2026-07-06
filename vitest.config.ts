import 'dotenv/config'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['tests/domain/**/*.test.ts', 'tests/application/**/*.test.ts'],
        },
      },
      {
        test: {
          name: 'integration',
          include: ['tests/integration/**/*.test.ts'],
          globalSetup: './tests/integration/setup.ts',
          fileParallelism: false,
          env: {
            DATABASE_URL: process.env.DATABASE_TEST_URL ?? '',
          },
        },
      },
    ],
  },
})
