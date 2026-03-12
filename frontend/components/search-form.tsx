"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Phone } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

interface SearchFormProps {
  phone: string
  onPhoneChange: (value: string) => void
  onSearch: () => void
  loading: boolean
}

export function SearchForm({
  phone,
  onPhoneChange,
  onSearch,
  loading,
}: SearchFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch()
  }

  return (
    <Card className="border-border/50 shadow-lg">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Ex: 61984161119"
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              className="pl-10 h-12 text-base"
              disabled={loading}
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !phone.trim()}
            className="h-12 px-8 text-base font-medium"
          >
            {loading ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Consultando...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Consultar
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
