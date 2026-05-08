import { test, expect } from '@playwright/test'
import { clearAll, seedJob } from './helpers/db'

test.describe('엣지 시나리오 — 매칭 없음', () => {
  test.beforeEach(async () => {
    await clearAll()
    // 지역·직종 모두 불일치 + 요구 경력 99년으로 경력 기준도 통과 불가
    // → calculateScore() = 0, gt('score', 0) 필터에 걸려 추천 목록에 미노출
    // (required_career=0 이면 경력 1점이 부여되어 score=1이 되므로 99를 사용)
    await seedJob({ title: '기타 공고', region: '기타', job_type: '기타', required_career: 99 })
  })

  test('조건 불일치 시니어 등록 후 빈 매칭 안내 박스가 표시된다', async ({ page }) => {
    await page.goto('/register')

    await page.locator('#name').fill('노매칭시니어')
    await page.locator('#region').selectOption('서울')
    await page.locator('#desired_job').selectOption('경비')
    await page.locator('#career_years').fill('3')

    await page.getByRole('button', { name: '등록하기' }).click()

    await expect(page.getByText('등록이 완료되었습니다')).toBeVisible({ timeout: 15_000 })

    await page.getByRole('link', { name: /내 매칭 결과 보기/ }).click()

    // 점수 0 매칭 → 추천 없음 안내
    await expect(page.getByText('현재 매칭되는 일자리가 없습니다.')).toBeVisible({ timeout: 15_000 })
  })
})
