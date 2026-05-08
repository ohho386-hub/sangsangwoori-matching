import { test, expect } from '@playwright/test'
import { clearAll, seedJob } from './helpers/db'

test.describe('정상 시나리오', () => {
  test.beforeEach(async () => {
    await clearAll()
    // 서울 / 경비 / 요구 경력 3년 공고 1건 세팅
    await seedJob({ title: '서울 경비 공고', region: '서울', job_type: '경비', required_career: 3 })
  })

  test('시니어 등록 후 6점 금색 배지 카드가 추천 목록 상단에 표시된다', async ({ page }) => {
    await page.goto('/register')

    // 폼 입력
    await page.locator('#name').fill('테스트시니어')
    await page.locator('#region').selectOption('서울')
    await page.locator('#desired_job').selectOption('경비')
    await page.locator('#career_years').fill('5')

    await page.getByRole('button', { name: '등록하기' }).click()

    // 성공 메시지 (초록 박스) 확인
    await expect(page.getByText('등록이 완료되었습니다')).toBeVisible({ timeout: 15_000 })

    // 매칭 결과 페이지로 이동
    await page.getByRole('link', { name: /내 매칭 결과 보기/ }).click()

    // 지역(3) + 직종(2) + 경력(1) = 6점 금색 배지가 첫 번째 카드에 표시
    const firstBadge = page.locator('text=6점').first()
    await expect(firstBadge).toBeVisible({ timeout: 15_000 })
  })
})
