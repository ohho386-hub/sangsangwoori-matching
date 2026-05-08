import { supabase } from '@/lib/supabase'
import type { MatchWithRelations } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function ScoreBadge({ score }: { score: number }) {
  const { label, cls } =
    score === 6
      ? { label: `${score}점`, cls: 'bg-yellow-400 text-yellow-900' }
      : score >= 4
      ? { label: `${score}점`, cls: 'bg-green-500 text-white' }
      : { label: `${score}점`, cls: 'bg-gray-400 text-white' }

  return (
    <Badge className={`shrink-0 text-base px-3 py-1 font-bold ${cls}`}>
      {label}
    </Badge>
  )
}

export default async function RecommendationsPage({
  searchParams,
}: {
  searchParams: Promise<{ senior_id?: string }>
}) {
  const { senior_id: seniorId } = await searchParams

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
    .gt('score', 0)
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
  const heading = seniorName ? `${seniorName}님의 매칭 결과` : '자동 매칭 추천'

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">{heading}</h1>
      <p className="text-xl text-gray-500 mb-10">
        {seniorName
          ? `총 ${items.length}개 일자리가 매칭되었습니다 · 점수 높은 순`
          : `매칭 점수 높은 순 · 총 ${items.length}건`}
      </p>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-center">
          <p className="text-2xl font-semibold text-gray-500">
            현재 매칭되는 일자리가 없습니다.
          </p>
          <p className="mt-2 text-lg text-gray-400">
            {seniorName
              ? '조건에 맞는 일자리가 등록되면 자동으로 매칭됩니다.'
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
                    {item.jobs.title}
                  </CardTitle>
                  <ScoreBadge score={Number(item.score)} />
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-lg text-gray-600">
                <span>📍 지역: {item.jobs.region}</span>
                <span>💼 직종: {item.jobs.job_type}</span>
                {!seniorName && (
                  <span>👤 지원자: {item.seniors.name} ({item.seniors.region})</span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
