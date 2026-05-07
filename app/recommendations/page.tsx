import { supabase } from '@/lib/supabase'
import type { MatchWithRelations } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function ScoreBar({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score))
  const color =
    pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-400'
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-3 rounded-full bg-gray-200 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-lg font-bold w-12 text-right">{score}점</span>
    </div>
  )
}

export default async function RecommendationsPage({
  searchParams,
}: {
  searchParams: Promise<{ senior?: string }>
}) {
  const { senior: seniorId } = await searchParams

  let seniorName: string | null = null
  if (seniorId) {
    const { data } = await supabase
      .from('seniors')
      .select('name')
      .eq('id', seniorId)
      .single()
    seniorName = data?.name ?? null
  }

  const query = supabase
    .from('matches')
    .select(
      '*, seniors(id, name, region, desired_job, career_years, created_at), jobs(id, title, region, job_type, required_career, created_at)',
    )
    .order('score', { ascending: false })

  if (seniorId) query.eq('senior_id', seniorId)

  const { data: matches, error } = await query

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <p className="text-xl text-red-600">데이터를 불러오는 중 오류가 발생했습니다.</p>
      </div>
    )
  }

  const items = (matches ?? []) as MatchWithRelations[]

  const heading = seniorName
    ? `${seniorName}님의 매칭 결과`
    : '자동 매칭 추천'

  const subtitle = seniorName
    ? `총 ${items.length}개 일자리가 매칭되었습니다 · 점수 높은 순`
    : `매칭 점수 높은 순 · 총 ${items.length}건`

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">{heading}</h1>
      <p className="text-xl text-gray-500 mb-10">{subtitle}</p>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-gray-300 rounded-xl text-center">
          <p className="text-2xl font-semibold text-gray-400">
            {seniorName ? '매칭된 일자리가 없습니다.' : '추천 데이터가 없습니다.'}
          </p>
          <p className="text-lg text-gray-400 mt-2">
            {seniorName
              ? '일자리 조건이 맞는 공고가 등록되면 자동으로 매칭됩니다.'
              : '시니어 프로필을 등록하면 자동으로 매칭이 진행됩니다.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <Card
              key={item.id}
              className="border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {seniorName ? (
                      item.jobs.title
                    ) : (
                      <>
                        {item.seniors.name}
                        <span className="mx-2 text-blue-400">→</span>
                        {item.jobs.title}
                      </>
                    )}
                  </CardTitle>
                  <Badge
                    className={`shrink-0 text-base px-3 py-1 ${
                      item.status === 'assigned'
                        ? 'bg-green-600 text-white'
                        : 'bg-yellow-500 text-white'
                    }`}
                  >
                    {item.status === 'assigned' ? '배정 완료' : '매칭 대기'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <ScoreBar score={Number(item.score)} />
                <div className="grid grid-cols-2 gap-2 text-lg text-gray-600">
                  <span>📍 공고 지역: {item.jobs.region}</span>
                  <span>💼 직종: {item.jobs.job_type}</span>
                  <span>📅 요구 경력: {item.jobs.required_career}년 이상</span>
                  {!seniorName && (
                    <span>👤 지원자: {item.seniors.name} ({item.seniors.region})</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
