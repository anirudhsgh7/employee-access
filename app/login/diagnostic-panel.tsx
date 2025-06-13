"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { CheckCircle, XCircle, AlertTriangle, ChevronDown, Play, Wrench } from "lucide-react"

interface DiagnosticResult {
  step: string
  success: boolean
  details: any
  error?: string
}

export default function DiagnosticPanel() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [summary, setSummary] = useState<any>(null)

  const runDiagnostics = async () => {
    setIsRunning(true)
    try {
      const response = await fetch("/api/auth/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "diagnose",
          userId: "admin",
          password: "admin123",
        }),
      })

      const data = await response.json()
      setDiagnostics(data.diagnostics || [])
      setSummary(data.summary || null)
    } catch (error) {
      console.error("Diagnostic failed:", error)
    } finally {
      setIsRunning(false)
    }
  }

  const fixAdmin = async () => {
    setIsRunning(true)
    try {
      const response = await fetch("/api/auth/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "fix_admin" }),
      })

      const data = await response.json()
      if (data.success) {
        alert("Admin user fixed successfully!")
        runDiagnostics() // Re-run diagnostics
      } else {
        alert(`Fix failed: ${data.error}`)
      }
    } catch (error) {
      alert("Fix operation failed")
    } finally {
      setIsRunning(false)
    }
  }

  const getStepIcon = (success: boolean) => {
    return success ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          Authentication Diagnostics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Button onClick={runDiagnostics} disabled={isRunning}>
            <Play className="h-4 w-4 mr-2" />
            {isRunning ? "Running..." : "Run Diagnostics"}
          </Button>
          <Button onClick={fixAdmin} disabled={isRunning} variant="outline">
            <Wrench className="h-4 w-4 mr-2" />
            Fix Admin User
          </Button>
        </div>

        {summary && (
          <Alert variant={summary.failedSteps > 0 ? "destructive" : "default"}>
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>
                  {summary.passedSteps}/{summary.totalSteps} steps passed
                </span>
                <Badge variant={summary.failedSteps > 0 ? "destructive" : "default"}>
                  {summary.failedSteps > 0 ? "Issues Found" : "All Good"}
                </Badge>
              </div>
              {summary.criticalErrors.length > 0 && (
                <div className="mt-2">
                  <strong>Critical Errors:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {summary.criticalErrors.map((error: string, index: number) => (
                      <li key={index} className="text-sm">
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {diagnostics.length > 0 && (
          <div className="space-y-2">
            {diagnostics.map((diagnostic, index) => (
              <Collapsible key={index}>
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-3 border rounded cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center space-x-2">
                      {getStepIcon(diagnostic.success)}
                      <span className="font-medium">{diagnostic.step.replace(/_/g, " ").toUpperCase()}</span>
                      {diagnostic.error && <Badge variant="destructive">Error</Badge>}
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-3 bg-gray-50 border-t">
                    {diagnostic.error && (
                      <Alert variant="destructive" className="mb-3">
                        <AlertDescription>{diagnostic.error}</AlertDescription>
                      </Alert>
                    )}
                    <pre className="text-xs bg-white p-2 rounded border overflow-auto">
                      {JSON.stringify(diagnostic.details, null, 2)}
                    </pre>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
