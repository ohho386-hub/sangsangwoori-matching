'use client'

import { useActionState } from 'react'
import { createJob, type JobFormState } from '@/app/actions'
import { SubmitButton } from '@/components/submit-button'

const REGIONS = ['서울', '경기', '인천', '기타']
const JOB_TYPES = ['경비', '청소', '조리', '돌봄', '기타']

const selectClass =
  'w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-lg focus:border-blue-500 focus:outline-none'
const inputClass =
  'w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-lg focus:border-blue-500 focus:outline-none'

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <div className="rounded-lg border-2 border-red-500 bg-red-100 px-3 py-2">
      <p className="text-base font-semibold text-red-700">{message}</p>
    </div>
  )
}

export function AddJobForm() {
  const [state, action] = useActionState<JobFormState, FormData>(createJob, null)

  return (
    <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">일자리 추가</h3>

      {state?.success && (
        <div className="mb-4 rounded-lg border-2 border-green-500 bg-green-100 px-4 py-3">
          <p className="text-lg font-semibold text-green-800">일자리가 등록되었습니다.</p>
        </div>
      )}

      {state?.serverError && (
        <div className="mb-4 rounded-lg border-2 border-red-500 bg-red-100 px-4 py-3">
          <p className="text-lg font-semibold text-red-700">오류: {state.serverError}</p>
        </div>
      )}

      <form action={action} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 공고명 */}
        <div className="md:col-span-2 flex flex-col gap-1">
          <FieldError message={state?.fieldErrors?.title} />
          <label className="text-lg font-semibold text-gray-800" htmlFor="job-title">
            공고명 <span className="text-red-500">*</span>
          </label>
          <input
            id="job-title"
            name="title"
            type="text"
            placeholder="예: 아파트 경비원 모집"
            className={inputClass}
          />
        </div>

        {/* 지역 */}
        <div className="flex flex-col gap-1">
          <FieldError message={state?.fieldErrors?.region} />
          <label className="text-lg font-semibold text-gray-800" htmlFor="job-region">
            지역 <span className="text-red-500">*</span>
          </label>
          <select id="job-region" name="region" defaultValue="" className={selectClass}>
            <option value="">-- 선택 --</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* 직종 */}
        <div className="flex flex-col gap-1">
          <FieldError message={state?.fieldErrors?.job_type} />
          <label className="text-lg font-semibold text-gray-800" htmlFor="job-type">
            직종 <span className="text-red-500">*</span>
          </label>
          <select id="job-type" name="job_type" defaultValue="" className={selectClass}>
            <option value="">-- 선택 --</option>
            {JOB_TYPES.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>
        </div>

        {/* 요구 경력 */}
        <div className="flex flex-col gap-1">
          <label className="text-lg font-semibold text-gray-800" htmlFor="job-career">
            요구 경력 (년)
          </label>
          <input
            id="job-career"
            name="required_career"
            type="number"
            min={0}
            defaultValue={0}
            className={inputClass}
          />
        </div>

        <div className="flex items-end">
          <SubmitButton
            className="w-full py-3 text-lg font-bold bg-blue-700 hover:bg-blue-800 text-white rounded-lg"
          >
            일자리 등록
          </SubmitButton>
        </div>
      </form>
    </div>
  )
}
