import z from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PRIVATE_KEY: z.string().min(1, 'PRIVATE_KEY is required'),
  PUBLIC_KEY: z.string().min(1, 'PUBLIC_KEY is required'),
  PORT: z.string().default('3000').transform(Number),
  DATABASE_URL: z.string().min(1),
  DATABASE_TEST_URL: z.string().min(1),
  ALLOWED_ORIGINS: z.string().default('http://localhost:5173'),
})

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  console.error('Invalid environment variables:')
  console.error(parsedEnv.error.format())
  console.log('>>> Env variables are invalid, exiting the process...')
  process.exit(1)
}

console.log('>>> Env variables validated successfully!')
