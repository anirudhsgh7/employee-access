"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, Shield, AlertCircle } from "lucide-react"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"

interface LoginError {
  message: string
  type: "validation" | "auth" | "rate_limit" | "network" | "service"
  locked?: boolean
  remainingAttempts?: number
  retryAfter?: number
  bypassUsed?: boolean
}

export default function LoginForm() {
  const [userId, setUserId] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<LoginError | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [retryCountdown, setRetryCountdown] = useState(0)
  const [connectionStatus, setConnectionStatus] = useState<"online" | "offline">("online")
  const [bypassActive, setBypassActive] = useState(false)
  const router = useRouter()

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setConnectionStatus("online")
    const handleOffline = () => setConnectionStatus("offline")

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Handle retry countdown
  useEffect(() => {
    if (retryCountdown > 0) {
      const timer = setTimeout(() => {
        setRetryCountdown(retryCountdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (retryCountdown === 0 && error?.type === "rate_limit") {
      setError(null)
    }
  }, [retryCountdown, error])

  const validateInput = (): LoginError | null => {
    return null
  }

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError(null)
  setIsLoading(true)

  try {
    console.log("Submitting to /api/auth/login");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, password }),
    })

    const text = await response.text() // DEBUG: get raw text
    console.log("Raw Response:", text)

    let data
    try {
      data = JSON.parse(text)
    } catch (err) {
      throw new Error("Invalid JSON returned from server")
    }

    if (!response.ok) {
      throw new Error(data.error || "Login failed")
    }

    router.push("/dashboard")
    router.refresh()
  } catch (err: any) {
    console.error(err)
    setError({ message: err.message || "An error occurred during login", type: "auth" })
  } finally {
    setIsLoading(false)
  }
}


  const getErrorIcon = (type: string) => {
    switch (type) {
      case "rate_limit":
        return <Clock className="h-4 w-4" />
      case "network":
        return <AlertTriangle className="h-4 w-4" />
      case "service":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Shield className="h-4 w-4" />
    }
  }

  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const isSubmitDisabled = isLoading || retryCountdown > 0 || connectionStatus === "offline"

  return (
    <div className="space-y-4">
      {/* Bypass Warning */}
      {bypassActive && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>⚠️ BYPASS MODE ACTIVE</strong>
            <br />
            Authentication bypass is enabled. This should be disabled in production!
          </AlertDescription>
        </Alert>
      )}

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Sign In
            <div className="flex items-center space-x-2">
              {bypassActive && <Badge variant="destructive">BYPASS</Badge>}
              <div
                className={`w-2 h-2 rounded-full ${connectionStatus === "online" ? "bg-green-500" : "bg-red-500"}`}
              />
              <span className="text-xs text-gray-500">{connectionStatus === "online" ? "Online" : "Offline"}</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {error && (
              <Alert variant="destructive">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            )}
            <div className="rounded-md shadow-sm -space-y-px">
              <div className = "mb-4">
                <Label htmlFor="user-id" className="sr-only"> 
                  User ID
                </Label>
                <Input
                  id="user-id"
                  name="userId"
                  type="text"
                  autoComplete="username"
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="User ID"
                  className="rounded-t-md"
                />
              </div>
              <div>
                <Label htmlFor="password" className="sr-only">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="rounded-b-md"
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
