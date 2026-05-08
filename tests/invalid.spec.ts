import { test, expect } from '@playwright/test'
import { clearAll, getSeniorsCount } from './helpers/db'

test.describe('실패 시나리오', () => {
  test.beforeEach(async () => {
    await clearAll()
  })

  test('이름 미입력 시 빨간 오류 박스가 표시되고 DB에 레코드가 생성되지 않는다', async ({ page }) => {
    await page.goto('/register')

    // 이름 비움 — 나머지만 입력
    await page.locator('#region').selectOption('서울')
    await page.locator('#desired_job').selectOption('경비')
    await page.locator('#career_years').fill('3')

    await page.getByRole('button', { name: '등록하기' }).click()

    // 이름 필드 위 빨간 안내 박스 확인
    await expect(page.getByText('이름을 입력해 주세요.')).toBeVisible({ timeout: 15_000 })

    // seniors 테이블에 새 레코드가 들어가지 않았는지 확인
    const count = await getSeniorsCount()
    expect(count).toBe(0)
  })
})
