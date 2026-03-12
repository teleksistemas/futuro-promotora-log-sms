import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, Search, SkipForward } from "lucide-react"

interface ErrorResponse {
  error: string
  scanned: number
  lastSkip: number
}

interface ErrorAlertProps {
  error: ErrorResponse
}

export function ErrorAlert({ error }: ErrorAlertProps) {
  return (
    <Card className="mt-8 border-destructive/30 bg-destructive/5 shadow-lg">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-destructive">
              Telefone não encontrado
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{error.error}</p>

            {(error.scanned > 0 || error.lastSkip > 0) && (
              <div className="mt-4 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 rounded-lg bg-background px-3 py-2 text-sm">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Scanned:</span>
                  <span className="font-semibold text-foreground">{error.scanned}</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-background px-3 py-2 text-sm">
                  <SkipForward className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Last Skip:</span>
                  <span className="font-semibold text-foreground">{error.lastSkip}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
