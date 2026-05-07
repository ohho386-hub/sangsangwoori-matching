import type { Senior, Job } from './types'

/**
 * 규칙 기반 매칭 점수 계산 (최대 100점)
 * - 지역 일치:  +50점
 * - 직종 일치:  +30점  (부분 문자열 포함 매칭)
 * - 경력 충족:  +20점
 */
export function calculateScore(senior: Senior, job: Job): number {
  let score = 0

  const sr = norm(senior.region)
  const jr = norm(job.region)
  if (sr === jr || jr.includes(sr) || sr.includes(jr)) score += 50

  const sJob = norm(senior.desired_job)
  const jType = norm(job.job_type)
  if (sJob.includes(jType) || jType.includes(sJob)) score += 30

  if (senior.career_years >= job.required_career) score += 20

  return score
}

function norm(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, '')
}
