'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'
import { calculateScore } from '@/lib/matching'
import type { Job, Senior } from '@/lib/types'

// ── 매칭 재계산 헬퍼 ──────────────────────────────────────────
// 트리거 대신 앱 레이어에서 재계산

async function rematchSenior(senior: Senior) {
  const { data: jobs } = await supabase.from('jobs').select('*')
  if (!jobs || jobs.length === 0) return

  const rows = (jobs as Job[]).map((job) => ({
    senior_id: senior.id,
    job_id: job.id,
    score: calculateScore(senior, job),
    status: 'pending' as const,
  }))

  await supabase
    .from('matches')
    .upsert(rows, { onConflict: 'senior_id,job_id', ignoreDuplicates: false })
}

async function rematchJob(job: Job) {
  const { data: seniors } = await supabase.from('seniors').select('*')
  if (!seniors || seniors.length === 0) return

  const rows = (seniors as Senior[]).map((senior) => ({
    senior_id: senior.id,
    job_id: job.id,
    score: calculateScore(senior, job),
    status: 'pending' as const,
  }))

  await supabase
    .from('matches')
    .upsert(rows, { onConflict: 'senior_id,job_id', ignoreDuplicates: false })
}

// ── 시니어 등록 ─────────────────────────────────────────────

export type RegisterState = {
  success: boolean
  seniorId?: string
  fieldErrors?: { name?: string; region?: string; desired_job?: string }
  serverError?: string
} | null

export async function registerSenior(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const name = ((formData.get('name') as string) ?? '').trim()
  const region = ((formData.get('region') as string) ?? '').trim()
  const desired_job = ((formData.get('desired_job') as string) ?? '').trim()
  const career_years = parseInt(formData.get('career_years') as string, 10) || 0
  const age_group = ((formData.get('age_group') as string) ?? '').trim() || null

  const fieldErrors: NonNullable<RegisterState>['fieldErrors'] = {}
  if (!name) fieldErrors.name = '이름을 입력해 주세요.'
  if (!region) fieldErrors.region = '지역을 선택해 주세요.'
  if (!desired_job) fieldErrors.desired_job = '희망 직종을 선택해 주세요.'
  if (Object.keys(fieldErrors).length > 0) return { success: false, fieldErrors }

  const { data: newSenior, error } = await supabase
    .from('seniors')
    .insert({ name, region, desired_job, career_years, age_group })
    .select()
    .single()

  if (error) return { success: false, serverError: error.message }

  await rematchSenior(newSenior as Senior)

  return { success: true, seniorId: (newSenior as Senior).id }
}

// ── 시니어 배정 ─────────────────────────────────────────────

export async function assignSenior(formData: FormData) {
  const senior_id = formData.get('senior_id') as string

  const { data: match } = await supabase
    .from('matches')
    .select('id')
    .eq('senior_id', senior_id)
    .eq('status', 'pending')
    .order('score', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (match) {
    await supabase.from('matches').update({ status: 'assigned' }).eq('id', match.id)
  }

  revalidatePath('/admin')
}

// ── 일자리 CRUD ─────────────────────────────────────────────

export type JobFormState = {
  success: boolean
  fieldErrors?: { title?: string; region?: string; job_type?: string }
  serverError?: string
} | null

export async function createJob(
  _prevState: JobFormState,
  formData: FormData,
): Promise<JobFormState> {
  const title = ((formData.get('title') as string) ?? '').trim()
  const region = ((formData.get('region') as string) ?? '').trim()
  const job_type = ((formData.get('job_type') as string) ?? '').trim()
  const required_career = parseInt(formData.get('required_career') as string, 10) || 0

  const fieldErrors: NonNullable<JobFormState>['fieldErrors'] = {}
  if (!title) fieldErrors.title = '공고명을 입력해 주세요.'
  if (!region) fieldErrors.region = '지역을 선택해 주세요.'
  if (!job_type) fieldErrors.job_type = '직종을 선택해 주세요.'
  if (Object.keys(fieldErrors).length > 0) return { success: false, fieldErrors }

  const { data: newJob, error } = await supabase
    .from('jobs')
    .insert({ title, region, job_type, required_career })
    .select()
    .single()

  if (error) return { success: false, serverError: error.message }

  await rematchJob(newJob as Job)

  revalidatePath('/admin')
  return { success: true }
}

export async function deleteJob(formData: FormData) {
  const job_id = formData.get('job_id') as string
  await supabase.from('jobs').delete().eq('id', job_id)
  revalidatePath('/admin')
}
