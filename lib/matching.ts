import type { Senior, Job } from './types'

// 비교용 정규화 테이블 — 원본 데이터는 수정하지 않음
const REGION_ALIAS: Record<string, string> = {
  '서울특별시': '서울',
  '경기도':     '경기',
  '인천광역시': '인천',
}

const JOB_ALIAS: Record<string, string> = {
  '경비직': '경비',
  '청소직': '청소',
  '조리직': '조리',
  '돌봄직': '돌봄',
}

function normRegion(s: string): string {
  const base = s.trim().toLowerCase().replace(/\s+/g, '')
  return REGION_ALIAS[base] ?? base
}

function normJob(s: string): string {
  const base = s.trim().toLowerCase().replace(/\s+/g, '')
  return JOB_ALIAS[base] ?? base
}

/**
 * 규칙 기반 매칭 점수 계산 (최대 6점)
 * - 지역 일치:  +3점  (정규화 후 포함 관계 비교)
 * - 직종 일치:  +2점  (정규화 후 포함 관계 비교)
 * - 경력 충족:  +1점
 */
export function calculateScore(senior: Senior, job: Job): number {
  let score = 0

  const sr = normRegion(senior.region)
  const jr = normRegion(job.region)
  if (sr === jr || jr.includes(sr) || sr.includes(jr)) score += 3

  const sJob = normJob(senior.desired_job)
  const jType = normJob(job.job_type)
  if (sJob.includes(jType) || jType.includes(sJob)) score += 2

  if (senior.career_years >= job.required_career) score += 1

  return score
}
