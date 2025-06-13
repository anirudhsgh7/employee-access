"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react"

interface DiagnosticTest {
  name: string
  status: "pending" | "success" | "error" | "warning"
  message: string
  details?: any
}

export default function DebugPage() {
  const [tests, setTests] = useState<DiagnosticTest[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runDiagnostics = async () => {
    setIsRunning(true)
    const diagnosticTests: DiagnosticTest[] = []

    // Test 1: Environment Variables
    try {
      const envTest = await fetch("/api/debug/env")
      const envData = await envTest.json()
      diagnosticTests.push({
        name: "Environment Variables",
        status: envData.success ? "success" : "error",
        message: envData.message,
        details: envData.details,
      })
    } catch (error) {
      diagnosticTests.push({
        name: "Environment Variables",
        status: "error",
        message: "Failed to check environment variables",
        details: error,
      })
    }

    // Test 2: Database Connection
    try {
      const dbTest = await fetch("/api/debug/database")
      const dbData = await dbTest.json()
      diagnosticTests.push({
        name: "Database Connection",
        status: dbData.success ? "success" : "error",
        message: dbData.message,
        details: dbData.details,
      })
    } catch (error) {
      diagnosticTests.push({
        name: "Database Connection",
        status: "error",
        message: "Failed to test database connection",
        details: error,
      })
    }

    // Test 3: API Routes
    try {
      const apiTest = await fetch("/api/employees/enhanced")
      const apiData = await apiTest.json()
      diagnosticTests.push({
        name: "API Routes",
        status: Array.isArray(apiData) ? "success" : "error",
        message: Array.isArray(apiData) ? "API routes working" : "API routes failing",
        details: apiData,
      })
    } catch (error) {
      diagnosticTests.push({
        name: "API Routes",
        status: "error",
        message: "Failed to test API routes",
        details: error,
      })
    }

    // Test 4: Authentication
    try {
      const authTest = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "test", password: "test" }),
      })
      const authData = await authTest.json()
      diagnosticTests.push({
        name: "Authentication System",
        status: authTest.status === 401 ? "success" : "warning",
        message: authTest.status === 401 ? "Auth system responding correctly" : "Auth system may have issues",
        details: authData,
      })
    } catch (error) {
      diagnosticTests.push({
        name: "Authentication System",
        status: "error",
        message: "Failed to test authentication",
        details: error,
      })
    }

    setTests(diagnosticTests)
    setIsRunning(false)
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      default:
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">Success</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              System Diagnostics
              <Button onClick={runDiagnostics} disabled={isRunning}>
                {isRunning ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {isRunning ? "Running..." : "Run Again"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tests.map((test, index) => (
              <Alert key={index} variant={test.status === "error" ? "destructive" : "default"}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <h4 className="font-medium">{test.name}</h4>
                      <p className="text-sm text-gray-600">{test.message}</p>
                    </div>
                  </div>
                  {getStatusBadge(test.status)}
                </div>
                {test.details && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-medium">View Details</summary>
                    <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(test.details, null, 2)}
                    </pre>
                  </details>
                )}
              </Alert>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={() => (window.location.href = "/login")} className="w-full">
              Go to Login Page
            </Button>
            <Button onClick={() => (window.location.href = "/")} variant="outline" className="w-full">
              Go to Home Page
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
