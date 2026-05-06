import { supabase } from '@/lib/supabase'
import { assignSenior } from '@/app/actions'
import type { SeniorWithMatches } from '@/lib/types'
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
  const { data: raw, error } = await supabase
    .from('seniors')
    .select('*, matches(id, score, status, jobs(title, region, job_type))')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12">
        <p className="text-xl text-red-600">데이터를 불러오는 중 오류가 발생했습니다.</p>
      </div>
    )
  }

  const seniors = (raw ?? []) as SeniorWithMatches[]
  const groups = categorize(seniors)

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
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
    </div>
  )
}
