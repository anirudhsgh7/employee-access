import { redirect } from "next/navigation"

export default async function HomePage() {
  // Simplified redirect logic to avoid potential auth errors
  redirect("/login")
}
