'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { calculateScore } from '@/lib/matching'
import type { Job, Senior } from '@/lib/types'

export async function registerSenior(formData: FormData) {
  const senior = {
    name: (formData.get('name') as string).trim(),
    region: (formData.get('region') as string).trim(),
    desired_job: (formData.get('desired_job') as string).trim(),
    career_years: parseInt(formData.get('career_years') as string, 10) || 0,
  }

  const { data: newSenior, error } = await supabase
    .from('seniors')
    .insert(senior)
    .select()
    .single()

  if (error) throw new Error(error.message)

  const { data: jobs } = await supabase.from('jobs').select('*')

  if (jobs && jobs.length > 0) {
    const matches = (jobs as Job[])
      .map((job) => ({
        senior_id: (newSenior as Senior).id,
        job_id: job.id,
        score: calculateScore(newSenior as Senior, job),
        status: 'pending' as const,
      }))
      .filter((m) => m.score > 0)

    if (matches.length > 0) {
      await supabase.from('matches').insert(matches)
    }
  }

  redirect('/recommendations')
}

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
    await supabase
      .from('matches')
      .update({ status: 'assigned' })
      .eq('id', match.id)
  }

  revalidatePath('/admin')
}
