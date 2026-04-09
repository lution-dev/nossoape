import { useState, useEffect } from "react"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, Clock, Loader2 } from "lucide-react"

interface SchedulingDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (date: string, time: string) => Promise<void>
  initialDate?: string
  initialTime?: string
  isLoading?: boolean
}

export function SchedulingDrawer({
  open,
  onOpenChange,
  onSave,
  initialDate = "",
  initialTime = "",
  isLoading = false,
}: SchedulingDrawerProps) {
  const [date, setDate] = useState(initialDate)
  const [time, setTime] = useState(initialTime)

  useEffect(() => {
    if (open) {
      // Quando abrir, se não tiver data, pode setar a data de hoje, ou manter vazio.
      setDate(initialDate)
      setTime(initialTime)
    }
  }, [open, initialDate, initialTime])

  const handleSave = async () => {
    if (!date) return
    await onSave(date, time)
    onOpenChange(false)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader>
            <DrawerTitle>Agendar Visita</DrawerTitle>
            <DrawerDescription>Selecione a data e hora do agendamento.</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Data</label>
              <div className="relative">
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="pl-9"
                />
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Hora (opcional)</label>
              <div className="relative">
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="pl-9"
                />
                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
          <DrawerFooter className="pt-2 pb-6">
            <Button onClick={handleSave} disabled={!date || isLoading} className="w-full">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Salvar Agendamento
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">Cancelar</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
