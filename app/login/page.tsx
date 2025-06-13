import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import LoginForm from "./login-form"

export default async function LoginPage() {
  // Check if user is already authenticated
  const user = await getUser()

  // If user is authenticated, redirect to dashboard
  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Employee Management Portal</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Sign in to access the system</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
