"use client"

import { useState } from "react"
import { useCurrentUser } from "@/hooks/use-current-user"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Download, AlertCircle, CheckCircle, Loader2, Sparkles } from "lucide-react"
import { useAuthId } from "@/hooks/use-auth-id"

const ChatSummaryViewer = () => {
  const { user, loading: userLoading } = useCurrentUser()
  const authId = useAuthId()
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const handleGenerateReport = async () => {
    if (!authId) return
    setLoading(true)
    setError(null)
    setPdfUrl(null)
    setProgress(0)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    try {
      const res = await fetch("https://fastapi-backend-370305669096.asia-south1.run.app/getChatSummary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authId,
          email: user?.email,
        }),
      })

      if (!res.ok) throw new Error(`API error: ${res.statusText}`)

      const data = await res.json()
      const base64 = data.pdf_base64
      setPdfUrl(`data:application/pdf;base64,${base64}`)
      setProgress(100)
    } catch (err: any) {
      setError(err.message || "Failed to generate report.")
      clearInterval(progressInterval)
    } finally {
      setLoading(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }

  const downloadPdf = () => {
    if (!pdfUrl) return
    const link = document.createElement("a")
    link.href = pdfUrl
    link.download = "ChatSummary.pdf"
    link.click()
  }

  return (
    <div className="space-y-8">
      <Card className="border border-slate-700 bg-gradient-to-br from-slate-800/50 via-slate-800/50 to-cyan-900/20 shadow-lg shadow-cyan-500/10">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00ff77] to-[#00bfff] flex items-center justify-center shadow-lg shadow-cyan-500/50">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-3xl text-white font-bold mb-2">Chat Summary Report</CardTitle>
              <CardDescription className="text-slate-300 text-lg">
                Generate a detailed summary of your conversations and key insights
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex items-center gap-4 flex-wrap">
            <Button
              onClick={handleGenerateReport}
              disabled={loading || !authId}
              size="lg"
              className="min-w-[220px] bg-gradient-to-r from-[#00ff77] to-[#00bfff] hover:from-[#00e66d] hover:to-[#00aaff] text-white border-0 shadow-md hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 text-lg py-6"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Analyzing Chats...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate Report
                </>
              )}
            </Button>

            {authId && (
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-md flex items-center gap-2 px-4 py-2">
                <CheckCircle className="h-4 w-4" />
                User Verified
              </Badge>
            )}
          </div>

          {loading && (
            <div className="space-y-4 p-6 bg-gradient-to-br from-slate-700/30 via-cyan-900/20 to-blue-900/20 rounded-xl">
              <div className="flex items-center justify-between text-lg">
                <span className="text-white font-medium">Analyzing your conversations...</span>
                <span className="text-cyan-400 font-bold">{progress}%</span>
              </div>
              <div className="w-full bg-slate-600/50 rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-[#00ff77] to-[#00bfff] transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <Alert className="border-red-500/50 bg-red-500/10">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <AlertDescription className="text-red-300 text-lg">{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {pdfUrl && (
        <Card className="border border-slate-700 bg-gradient-to-br from-slate-800/50 via-slate-800/50 to-cyan-900/20 shadow-lg shadow-cyan-500/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-white font-bold">Your Chat Summary</CardTitle>
                <CardDescription className="text-slate-300 text-lg">Report generated successfully</CardDescription>
              </div>
              <Button
                onClick={downloadPdf}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-md hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border border-slate-600 rounded-xl overflow-hidden bg-white shadow-lg">
              <iframe src={pdfUrl} className="w-full h-[700px]" title="Chat Summary PDF" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ChatSummaryViewer