import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export interface User {
  id: number
  user_id: string
  full_name: string
}

export async function getUser(): Promise<User | null> {
  try {
    const cookieStore = cookies()
    const userCookie = cookieStore.get("user")

    if (!userCookie) {
      return null
    }

    const sessionData = JSON.parse(userCookie.value)

    // Check if session has expired
    if (sessionData.expires && Date.now() > sessionData.expires) {
      await clearUserCookie()
      return null
    }

    // Return user data without sensitive session info
    return {
      id: sessionData.id,
      user_id: sessionData.user_id,
      full_name: sessionData.full_name,
    }
  } catch (error) {
    console.error("Error getting user from cookie:", error)
    await clearUserCookie()
    return null
  }
}

export async function requireAuth() {
  const user = await getUser()

  if (!user) {
    // Instead of throwing an error, we'll use Next.js redirect
    redirect("/login")
  }

  return user
}

export async function setUserCookie(user: User) {
  try {
    const cookieStore = cookies()

    // Create a more secure session token
    const sessionData = {
      ...user,
      timestamp: Date.now(),
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    }

    cookieStore.set("user", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })
  } catch (error) {
    console.error("Error setting user cookie:", error)
    throw error
  }
}

export async function clearUserCookie() {
  try {
    const cookieStore = cookies()
    cookieStore.delete("user")
  } catch (error) {
    console.error("Error clearing user cookie:", error)
  }
}
