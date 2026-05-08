import { defineConfig, devices } from '@playwright/test'
import { config } from 'dotenv'

// .env.local 을 테스트 프로세스에서도 사용할 수 있도록 로드
config({ path: '.env.local' })

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1, // DB를 공유하므로 순차 실행
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
