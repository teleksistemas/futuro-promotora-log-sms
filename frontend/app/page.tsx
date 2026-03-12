"use client"

import { useState } from "react"
import { SearchForm } from "@/components/search-form"
import { MessageInfo } from "@/components/message-info"
import { EventsTimeline } from "@/components/events-timeline"
import { ErrorAlert } from "@/components/error-alert"
import { Spinner } from "@/components/ui/spinner"
import { MessageSquare } from "lucide-react"

interface NotificationItem {
  event: string
  id: string
  from: string
  to: string
  metadata: Record<string, string>
}

interface SuccessResponse {
  id: string
  to: string
  skip: number
  notification: {
    type: string
    resource: {
      total: number
      itemType: string
      items: NotificationItem[]
    }
  }
}

interface ErrorResponse {
  error: string
  scanned: number
  lastSkip: number
}

type ApiResponse = SuccessResponse | ErrorResponse

function isErrorResponse(response: ApiResponse): response is ErrorResponse {
  return "error" in response
}

export default function SMSLogsPage() {
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SuccessResponse | null>(null)
  const [error, setError] = useState<ErrorResponse | null>(null)

  const handleSearch = async () => {
    if (!phone.trim()) return

    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "")
      const url = `${apiBase || ""}/message-id?phone=${encodeURIComponent(phone.trim())}`

      const response = await fetch(url)
      const data: ApiResponse = await response.json()

      if (isErrorResponse(data)) {
        setError(data)
      } else {
        setResult(data)
      }
    } catch (err) {
      setError({
        error: "Erro ao conectar. Verifique se o serviço está rodando.",
        scanned: 0,
        lastSkip: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <MessageSquare className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Consulta de Logs SMS
          </h1>
          <p className="mt-2 text-muted-foreground">
            Digite um telefone para consultar os eventos da mensagem
          </p>
        </header>

        <SearchForm
          phone={phone}
          onPhoneChange={setPhone}
          onSearch={handleSearch}
          loading={loading}
        />

        {loading && (
          <div className="mt-12 flex flex-col items-center gap-3">
            <Spinner className="h-8 w-8 text-primary" />
            <p className="text-sm text-muted-foreground">Consultando logs...</p>
          </div>
        )}

        {error && !loading && <ErrorAlert error={error} />}

        {result && !loading && (
          <div className="mt-8 space-y-6">
            <MessageInfo
              messageId={result.id}
              phone={result.to}
              totalEvents={result.notification.resource.total}
            />
            <EventsTimeline events={result.notification.resource.items} />
          </div>
        )}
      </div>
    </main>
  )
}
