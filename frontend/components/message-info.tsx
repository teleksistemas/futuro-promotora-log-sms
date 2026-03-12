import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Hash, Phone, Activity } from "lucide-react"

interface MessageInfoProps {
  messageId: string
  phone: string
  totalEvents: number
}

export function MessageInfo({ messageId, phone, totalEvents }: MessageInfoProps) {
  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Informações da Mensagem</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-3">
          <InfoItem
            icon={<Hash className="h-4 w-4" />}
            label="Message ID"
            value={messageId}
            truncate
          />
          <InfoItem
            icon={<Phone className="h-4 w-4" />}
            label="Telefone Destino"
            value={phone}
            truncate
          />
          <InfoItem
            icon={<Activity className="h-4 w-4" />}
            label="Total de Eventos"
            value={totalEvents.toString()}
          />
        </div>
      </CardContent>
    </Card>
  )
}

function InfoItem({
  icon,
  label,
  value,
  truncate = false,
}: {
  icon: React.ReactNode
  label: string
  value: string
  truncate?: boolean
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p
          className={`mt-0.5 text-sm font-semibold text-foreground ${
            truncate ? "truncate" : ""
          }`}
          title={value}
        >
          {value}
        </p>
      </div>
    </div>
  )
}
