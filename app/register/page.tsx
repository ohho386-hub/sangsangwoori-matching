'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { registerSenior, type RegisterState } from '@/app/actions'
import { SubmitButton } from '@/components/submit-button'

const REGIONS = ['서울', '경기', '인천', '기타']
const JOB_TYPES = ['경비', '청소', '조리', '돌봄', '기타']
const AGE_GROUPS = ['40대', '50대', '60대', '70대']

const selectClass =
  'w-full rounded-lg border-2 border-gray-300 bg-white px-5 py-4 text-xl focus:border-blue-500 focus:outline-none'
const inputClass =
  'w-full rounded-lg border-2 border-gray-300 px-5 py-4 text-xl focus:border-blue-500 focus:outline-none'

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <div className="rounded-lg border-2 border-red-500 bg-red-100 px-4 py-2">
      <p className="text-lg font-semibold text-red-700">{message}</p>
    </div>
  )
}

export default function RegisterPage() {
  const [state, action] = useActionState<RegisterState, FormData>(registerSenior, null)

  if (state?.success) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="rounded-xl border-2 border-green-500 bg-green-100 px-6 py-8 flex flex-col gap-5">
          <div>
            <p className="text-3xl font-bold text-green-800">등록이 완료되었습니다</p>
            <p className="mt-2 text-xl text-green-700">
              프로필이 저장되었고 일자리 매칭이 완료되었습니다.
            </p>
          </div>
          <Link
            href={`/recommendations?senior_id=${state.seniorId}`}
            className="inline-flex items-center justify-center w-full rounded-lg bg-green-700 hover:bg-green-800 px-6 py-5 text-xl font-bold text-white transition-colors"
          >
            내 매칭 결과 보기 →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">프로필 등록</h1>
      <p className="text-xl text-gray-500 mb-10">
        일자리 매칭을 위한 기본 정보를 입력해 주세요.
      </p>

      {state?.serverError && (
        <div className="mb-6 rounded-lg border-2 border-red-500 bg-red-100 px-4 py-3">
          <p className="text-lg font-semibold text-red-700">오류: {state.serverError}</p>
        </div>
      )}

      <form action={action} className="flex flex-col gap-6">
        {/* 이름 */}
        <div className="flex flex-col gap-2">
          <FieldError message={state?.fieldErrors?.name} />
          <label className="text-xl font-semibold text-gray-800" htmlFor="name">
            이름 <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="홍길동"
            className={inputClass}
          />
        </div>

        {/* 지역 */}
        <div className="flex flex-col gap-2">
          <FieldError message={state?.fieldErrors?.region} />
          <label className="text-xl font-semibold text-gray-800" htmlFor="region">
            지역 <span className="text-red-500">*</span>
          </label>
          <select id="region" name="region" defaultValue="" className={selectClass}>
            <option value="">-- 선택해 주세요 --</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* 희망 직종 */}
        <div className="flex flex-col gap-2">
          <FieldError message={state?.fieldErrors?.desired_job} />
          <label className="text-xl font-semibold text-gray-800" htmlFor="desired_job">
            희망 직종 <span className="text-red-500">*</span>
          </label>
          <select id="desired_job" name="desired_job" defaultValue="" className={selectClass}>
            <option value="">-- 선택해 주세요 --</option>
            {JOB_TYPES.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>
        </div>

        {/* 연령대 */}
        <div className="flex flex-col gap-2">
          <label className="text-xl font-semibold text-gray-800" htmlFor="age_group">
            연령대
          </label>
          <select id="age_group" name="age_group" defaultValue="" className={selectClass}>
            <option value="">-- 선택해 주세요 --</option>
            {AGE_GROUPS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        {/* 경력 */}
        <div className="flex flex-col gap-2">
          <label className="text-xl font-semibold text-gray-800" htmlFor="career_years">
            경력 (년)
          </label>
          <input
            id="career_years"
            name="career_years"
            type="number"
            min={0}
            defaultValue={0}
            className={inputClass}
          />
        </div>

        <SubmitButton
          className="mt-4 w-full py-6 text-xl font-bold bg-blue-700 hover:bg-blue-800 text-white rounded-lg"
          size="lg"
        >
          등록하기
        </SubmitButton>
      </form>
    </div>
  )
}
