import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Send, ArrowDownCircle, Clock } from "lucide-react"

interface NotificationItem {
  event: string
  id: string
  from: string
  to: string
  metadata: Record<string, string>
}

interface EventsTimelineProps {
  events: NotificationItem[]
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return "Data não disponível"
  
  try {
    const date = new Date(dateString)
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return dateString
  }
}

function getEventConfig(event: string) {
  const configs: Record<string, { icon: React.ReactNode; color: string; bgColor: string; label: string }> = {
    received: {
      icon: <ArrowDownCircle className="h-5 w-5" />,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      label: "Recebido",
    },
    dispatched: {
      icon: <Send className="h-5 w-5" />,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      label: "Despachado",
    },
    accepted: {
      icon: <CheckCircle className="h-5 w-5" />,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
      label: "Aceito",
    },
  }

  return (
    configs[event.toLowerCase()] || {
      icon: <Clock className="h-5 w-5" />,
      color: "text-gray-600",
      bgColor: "bg-gray-100",
      label: event,
    }
  )
}

export function EventsTimeline({ events }: EventsTimelineProps) {
  // Sort events by date (most recent first)
  const sortedEvents = [...events].sort((a, b) => {
    const dateA = a.metadata["#envelope.storageDate"] || ""
    const dateB = b.metadata["#envelope.storageDate"] || ""
    return new Date(dateB).getTime() - new Date(dateA).getTime()
  })

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Timeline de Eventos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-4">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

          {sortedEvents.map((event, index) => {
            const config = getEventConfig(event.event)
            const storageDate = event.metadata["#envelope.storageDate"]

            return (
              <div key={`${event.id}-${index}`} className="relative pl-12">
                {/* Timeline dot */}
                <div
                  className={`absolute left-2.5 flex h-5 w-5 items-center justify-center rounded-full ${config.bgColor} ${config.color} ring-4 ring-card`}
                >
                  <div className="h-2 w-2 rounded-full bg-current" />
                </div>

                <div className="rounded-lg border border-border/50 bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.bgColor} ${config.color}`}>
                      {config.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{config.label}</h3>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(storageDate)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-muted-foreground">De:</span>
                      <code className="block rounded bg-muted px-2 py-1 text-xs break-all">
                        {event.from}
                      </code>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-muted-foreground">Para:</span>
                      <code className="block rounded bg-muted px-2 py-1 text-xs break-all">
                        {event.to}
                      </code>
                    </div>

                    {/* Relevant metadata */}
                    {event.metadata["#sms.smsCount"] && (
                      <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        SMS Count: {event.metadata["#sms.smsCount"]}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
