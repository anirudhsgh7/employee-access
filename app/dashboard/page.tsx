import { requireAuth } from "@/lib/auth"
import DashboardHeader from "./dashboard-header"
import DashboardTabs from "./dashboard-tabs"

export default async function DashboardPage() {
  // This will automatically redirect to login if not authenticated
  const user = await requireAuth()

  let todayAttendance = []

  // Safely fetch attendance data with fallback
  try {
    const { getTodayAttendance } = await import("@/lib/database-enhanced")
    todayAttendance = await getTodayAttendance()
  } catch (error) {
    console.error("Failed to fetch attendance data:", error)
    // Continue with empty array - component will handle gracefully
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <DashboardHeader user={user} />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user.full_name}</h1>
              </div>
              <div className="hidden md:block">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg">
                  <div className="text-sm font-medium">Today's Date</div>
                  <div className="text-lg font-bold">{new Date().toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Tabs */}
          <DashboardTabs initialAttendance={todayAttendance} />
        </div>
      </main>
    </div>
  )
}
