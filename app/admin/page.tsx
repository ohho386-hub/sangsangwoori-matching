import { supabase } from '@/lib/supabase'
import { assignSenior, deleteJob } from '@/app/actions'
import { AddJobForm } from '@/components/add-job-form'
import type { SeniorWithMatches } from '@/lib/types'
import type { Job } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SubmitButton } from '@/components/submit-button'

type Column = {
  key: 'unmatched' | 'pending' | 'assigned'
  label: string
  bg: string
  border: string
  badge: string
}

const COLUMNS: Column[] = [
  { key: 'unmatched', label: '미매칭',    bg: 'bg-red-50',    border: 'border-red-300',    badge: 'bg-red-600 text-white' },
  { key: 'pending',   label: '매칭 대기', bg: 'bg-yellow-50', border: 'border-yellow-300', badge: 'bg-yellow-500 text-white' },
  { key: 'assigned',  label: '배정 완료', bg: 'bg-green-50',  border: 'border-green-300',  badge: 'bg-green-600 text-white' },
]

function categorize(seniors: SeniorWithMatches[]) {
  const unmatched: SeniorWithMatches[] = []
  const pending:   SeniorWithMatches[] = []
  const assigned:  SeniorWithMatches[] = []

  for (const s of seniors) {
    if (s.matches.length === 0) {
      unmatched.push(s)
    } else if (s.matches.some((m) => m.status === 'assigned')) {
      assigned.push(s)
    } else {
      pending.push(s)
    }
  }
  return { unmatched, pending, assigned }
}

function SeniorCard({
  senior,
  showAssignButton,
}: {
  senior: SeniorWithMatches
  showAssignButton: boolean
}) {
  const bestMatch = [...senior.matches].sort((a, b) => b.score - a.score)[0]

  return (
    <Card className="border border-gray-200 bg-white shadow-sm">
      <CardHeader className="pb-1 pt-4 px-4">
        <CardTitle className="text-lg font-bold text-gray-900">{senior.name}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 flex flex-col gap-2">
        <p className="text-base text-gray-600">📍 {senior.region}</p>
        <p className="text-base text-gray-600">💼 {senior.desired_job} · 경력 {senior.career_years}년</p>
        {bestMatch && (
          <p className="text-base text-blue-700 font-medium">
            🏢 {bestMatch.jobs.title} ({bestMatch.score}점)
          </p>
        )}
        {showAssignButton && (
          <form action={assignSenior}>
            <input type="hidden" name="senior_id" value={senior.id} />
            <SubmitButton
              size="sm"
              variant="outline"
              className="mt-1 w-full border-green-600 text-green-700 hover:bg-green-50 font-semibold"
            >
              배정 완료로 변경
            </SubmitButton>
          </form>
        )}
      </CardContent>
    </Card>
  )
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
  const groups = categorize(seniors)
  const jobList = (jobs ?? []) as Job[]

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col gap-16">
      {/* ── 시니어 칸반 ── */}
      <section>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">담당자 대시보드</h1>
        <p className="text-xl text-gray-500 mb-10">
          시니어 매칭 현황 · 총 {seniors.length}명
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COLUMNS.map((col) => {
            const items = groups[col.key]
            return (
              <div
                key={col.key}
                className={`rounded-xl border-2 ${col.bg} ${col.border} p-5 min-h-64`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">{col.label}</h2>
                  <Badge className={`text-base px-3 py-1 ${col.badge}`}>
                    {items.length}명
                  </Badge>
                </div>

                {items.length === 0 ? (
                  <p className="text-lg text-gray-400 text-center pt-8">없음</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {items.map((senior) => (
                      <SeniorCard
                        key={senior.id}
                        senior={senior}
                        showAssignButton={col.key === 'pending'}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* ── 일자리 관리 ── */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">일자리 관리</h2>
        <p className="text-lg text-gray-500 mb-8">등록된 일자리 · 총 {jobList.length}건</p>

        <AddJobForm />

        {/* 일자리 목록 */}
        <div className="mt-8 overflow-x-auto rounded-xl border-2 border-gray-200">
          <table className="w-full text-left">
            <thead className="bg-gray-100 border-b-2 border-gray-200">
              <tr>
                {['공고명', '지역', '직종', '요구 경력'].map((h) => (
                  <th key={h} className="px-5 py-4 text-lg font-bold text-gray-700">
                    {h}
                  </th>
                ))}
                <th className="px-5 py-4 text-lg font-bold text-gray-700">관리</th>
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
                  <tr
                    key={job.id}
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
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
