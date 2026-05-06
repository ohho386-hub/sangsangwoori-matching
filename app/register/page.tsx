import { registerSenior } from '@/app/actions'
import { SubmitButton } from '@/components/submit-button'

export default function RegisterPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">프로필 등록</h1>
      <p className="text-xl text-gray-500 mb-10">
        일자리 매칭을 위한 기본 정보를 입력해 주세요.
      </p>

      <form action={registerSenior} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-xl font-semibold text-gray-800" htmlFor="name">
            이름
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="홍길동"
            required
            className="w-full rounded-lg border-2 border-gray-300 px-5 py-4 text-xl focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xl font-semibold text-gray-800" htmlFor="region">
            지역
          </label>
          <input
            id="region"
            name="region"
            type="text"
            placeholder="서울 강남구"
            required
            className="w-full rounded-lg border-2 border-gray-300 px-5 py-4 text-xl focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xl font-semibold text-gray-800" htmlFor="desired_job">
            희망 직종
          </label>
          <input
            id="desired_job"
            name="desired_job"
            type="text"
            placeholder="경비, 청소, 사무보조 등"
            required
            className="w-full rounded-lg border-2 border-gray-300 px-5 py-4 text-xl focus:border-blue-500 focus:outline-none"
          />
        </div>

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
            required
            className="w-full rounded-lg border-2 border-gray-300 px-5 py-4 text-xl focus:border-blue-500 focus:outline-none"
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
