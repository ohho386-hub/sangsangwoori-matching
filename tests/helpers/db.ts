import { createClient } from '@supabase/supabase-js'

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

// FK 순서 준수: matches → seniors → jobs
export async function clearAll() {
  const steps: Array<{ table: string; err: unknown }> = []

  const { error: me } = await db
    .from('matches')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')
  if (me) steps.push({ table: 'matches', err: me.message })

  const { error: se } = await db
    .from('seniors')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')
  if (se) steps.push({ table: 'seniors', err: se.message })

  const { error: je } = await db
    .from('jobs')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')
  if (je) steps.push({ table: 'jobs', err: je.message })

  if (steps.length > 0) {
    throw new Error(
      `clearAll 실패 — RLS 정책 또는 권한을 확인하세요:\n` +
        steps.map((s) => `  ${s.table}: ${s.err}`).join('\n'),
    )
  }
}

export async function seedJob(job: {
  title: string
  region: string
  job_type: string
  required_career: number
}) {
  const { data, error } = await db.from('jobs').insert(job).select().single()
  if (error) throw new Error(`seedJob 실패: ${error.message}`)
  return data as { id: string; title: string; region: string; job_type: string; required_career: number }
}

export async function getSeniorsCount(): Promise<number> {
  const { count, error } = await db.from('seniors').select('*', { count: 'exact', head: true })
  if (error) throw new Error(`getSeniorsCount 실패: ${error.message}`)
  return count ?? 0
}
