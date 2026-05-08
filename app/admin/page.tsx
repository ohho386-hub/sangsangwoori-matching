export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { assignSenior, deleteJob } from '@/app/actions'
import { AddJobForm } from '@/components/add-job-form'
import type { SeniorWithMatches } from '@/lib/types'
import type { Job } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SubmitButton } from '@/components/submit-button'

type SeniorStatus = 'unmatched' | 'pending' | 'assigned'

function getSeniorStatus(senior: SeniorWithMatches): SeniorStatus {
  if (senior.matches.length === 0) return 'unmatched'
  if (senior.matches.some((m) => m.status === 'assigned' || m.status === 'done')) return 'assigned'
  return 'pending'
}

function getBestScore(senior: SeniorWithMatches): number {
  if (senior.matches.length === 0) return 0
  return Math.max(...senior.matches.map((m) => m.score))
}

const STATUS_LABEL: Record<SeniorStatus, string> = {
  unmatched: '미매칭',
  pending: '매칭 대기',
  assigned: '배정 완료',
}

const STATUS_BADGE_CLASS: Record<SeniorStatus, string> = {
  unmatched: 'bg-red-600 text-white',
  pending: 'bg-yellow-500 text-white',
  assigned: 'bg-green-600 text-white',
}

export default async function AdminPage() {
  const [{ data: raw, error: seniorError }, { data: jobs, error: jobError }] = await Promise.all([
    supabase
      .from('seniors')
      .select('*, matches(id, score, status, jobs(title, region, job_type))')
      .order('created_at', { ascending: false }),
    supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false }),
  ])

  if (seniorError || jobError) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12">
        <p className="text-xl text-red-600">데이터를 불러오는 중 오류가 발생했습니다.</p>
      </div>
    )
  }

  const seniors = (raw ?? []) as SeniorWithMatches[]
  const jobList = (jobs ?? []) as Job[]

  const unmatchedCount = seniors.filter((s) => getSeniorStatus(s) === 'unmatched').length
  const pendingCount   = seniors.filter((s) => getSeniorStatus(s) === 'pending').length
  const assignedCount  = seniors.filter((s) => getSeniorStatus(s) === 'assigned').length

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col gap-16">

      {/* ── 담당자 대시보드 ── */}
      <section>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">담당자 대시보드</h1>
        <p className="text-xl text-gray-500 mb-8">시니어 매칭 현황 · 총 {seniors.length}명</p>

        {/* 집계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="border-2 border-red-300 bg-red-50">
            <CardHeader className="pb-1">
              <CardTitle className="text-lg text-red-700">미매칭 시니어</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold text-red-600">{unmatchedCount}<span className="text-2xl ml-1">명</span></p>
              <p className="mt-1 text-base text-red-500">매칭 결과 없음</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-yellow-300 bg-yellow-50">
            <CardHeader className="pb-1">
              <CardTitle className="text-lg text-yellow-700">매칭 대기</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold text-yellow-600">{pendingCount}<span className="text-2xl ml-1">명</span></p>
              <p className="mt-1 text-base text-yellow-600">pending 상태</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-300 bg-green-50">
            <CardHeader className="pb-1">
              <CardTitle className="text-lg text-green-700">배정 완료</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold text-green-600">{assignedCount}<span className="text-2xl ml-1">명</span></p>
              <p className="mt-1 text-base text-green-600">assigned / done 상태</p>
            </CardContent>
          </Card>
        </div>

        {/* 시니어 목록 테이블 */}
        <div className="overflow-x-auto rounded-xl border-2 border-gray-200">
          <table className="w-full text-left">
            <thead className="bg-gray-100 border-b-2 border-gray-200">
              <tr>
                {['이름', '연령대', '지역', '희망 직종', '최고 매칭 점수', '상태', ''].map((h) => (
                  <th key={h} className="px-5 py-4 text-lg font-bold text-gray-700">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {seniors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-lg text-gray-400">
                    등록된 시니어가 없습니다.
                  </td>
                </tr>
              ) : (
                seniors.map((senior, idx) => {
                  const status = getSeniorStatus(senior)
                  const bestScore = getBestScore(senior)
                  return (
                    <tr key={senior.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-5 py-4 text-lg font-medium text-gray-900">{senior.name}</td>
                      <td className="px-5 py-4 text-lg text-gray-700">{senior.age_group ?? '-'}</td>
                      <td className="px-5 py-4 text-lg text-gray-700">{senior.region}</td>
                      <td className="px-5 py-4 text-lg text-gray-700">{senior.desired_job}</td>
                      <td className="px-5 py-4 text-lg text-gray-700">
                        {bestScore > 0 ? `${bestScore}점` : '-'}
                      </td>
                      <td className="px-5 py-4">
                        <Badge className={`text-base px-3 py-1 ${STATUS_BADGE_CLASS[status]}`}>
                          {STATUS_LABEL[status]}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 flex items-center gap-2">
                        <Link
                          href={`/recommendations?senior_id=${senior.id}`}
                          className="rounded-lg border-2 border-blue-500 text-blue-600 hover:bg-blue-50 font-semibold text-base px-4 py-2 transition-colors"
                        >
                          상세 보기
                        </Link>
                        {status === 'pending' && (
                          <form action={assignSenior}>
                            <input type="hidden" name="senior_id" value={senior.id} />
                            <SubmitButton
                              size="sm"
                              variant="outline"
                              className="border-green-600 text-green-700 hover:bg-green-50 font-semibold"
                            >
                              배정 완료
                            </SubmitButton>
                          </form>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 일자리 관리 ── */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">일자리 관리</h2>
        <p className="text-lg text-gray-500 mb-8">등록된 일자리 · 총 {jobList.length}건</p>

        <AddJobForm />

        <div className="mt-8 overflow-x-auto rounded-xl border-2 border-gray-200">
          <table className="w-full text-left">
            <thead className="bg-gray-100 border-b-2 border-gray-200">
              <tr>
                {['공고명', '지역', '직종', '요구 경력', '관리'].map((h) => (
                  <th key={h} className="px-5 py-4 text-lg font-bold text-gray-700">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jobList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-lg text-gray-400">
                    등록된 일자리가 없습니다.
                  </td>
                </tr>
              ) : (
                jobList.map((job, idx) => (
                  <tr key={job.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-5 py-4 text-lg font-medium text-gray-900">{job.title}</td>
                    <td className="px-5 py-4 text-lg text-gray-700">{job.region}</td>
                    <td className="px-5 py-4 text-lg text-gray-700">{job.job_type}</td>
                    <td className="px-5 py-4 text-lg text-gray-700">{job.required_career}년</td>
                    <td className="px-5 py-4">
                      <form action={deleteJob}>
                        <input type="hidden" name="job_id" value={job.id} />
                        <SubmitButton
                          size="sm"
                          variant="outline"
                          className="border-red-500 text-red-600 hover:bg-red-50 font-semibold text-base px-4 py-2"
                        >
                          삭제
                        </SubmitButton>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
