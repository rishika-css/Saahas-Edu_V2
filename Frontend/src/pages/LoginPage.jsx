import LoginForm from "../components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-blue-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl">🌟</span>
          <h1 className="text-3xl font-bold text-purple-700 mt-3">InclusiveLearn</h1>
          <p className="text-gray-500 mt-2 text-sm">An accessible learning platform for every student</p>
        </div>
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Welcome! Let's get started</h2>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}