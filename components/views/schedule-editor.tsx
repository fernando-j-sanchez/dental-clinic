"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { PageHeader } from "@/components/common"
import { useStore } from "@/lib/store"
import type { WeeklySchedule } from "@/lib/types"

const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
const EMPTY: WeeklySchedule = [null, null, null, null, null, null, null]

export function ScheduleEditor({ userId, onSaved }: { userId: string; onSaved?: () => void }) {
  const { db, actions } = useStore()
  const user = db.users.find((u) => u.id === userId)
  const [schedule, setSchedule] = useState<WeeklySchedule>(user?.schedule ?? EMPTY)
  const [saved, setSaved] = useState(false)

  useEffect(() => setSchedule(user?.schedule ?? EMPTY), [user?.schedule])

  const update = (day: number, value: WeeklySchedule[number]) => {
    setSaved(false)
    setSchedule((s) => s.map((d, i) => (i === day ? value : d)))
  }

  const invalid = schedule.some((d) => d && d.start >= d.end)

  // Mostrar de lunes a domingo
  const order = [1, 2, 3, 4, 5, 6, 0]

  return (
    <div className="space-y-2">
      {order.map((day) => {
        const value = schedule[day]
        return (
          <div key={day} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
            <Switch checked={!!value} onCheckedChange={(on) => update(day, on ? { start: "09:00", end: "17:00" } : null)} />
            <span className={`w-24 text-sm font-medium ${value ? "text-slate-800" : "text-slate-400"}`}>{DAY_NAMES[day]}</span>
            {value ? (
              <div className="flex items-center gap-2">
                <Input type="time" value={value.start} onChange={(e) => update(day, { ...value, start: e.target.value })} className="w-32" />
                <span className="text-slate-400">a</span>
                <Input type="time" value={value.end} onChange={(e) => update(day, { ...value, end: e.target.value })} className="w-32" />
              </div>
            ) : (
              <span className="text-sm text-slate-400">No disponible</span>
            )}
          </div>
        )
      })}
      {invalid && <p className="text-sm text-red-600">La hora de inicio debe ser antes que la de fin.</p>}
      <div className="flex items-center gap-3 pt-2">
        <Button
          disabled={invalid}
          onClick={() => {
            actions.updateUser(userId, { schedule })
            setSaved(true)
            onSaved?.()
          }}
          className="bg-sky-600 hover:bg-sky-700"
        >
          Guardar horario
        </Button>
        {saved && <span className="text-sm text-emerald-600">¡Guardado! Los pacientes ya ven estos horarios.</span>}
      </div>
    </div>
  )
}

export function MyScheduleView() {
  const { currentUser } = useStore()
  if (!currentUser) return null
  return (
    <div className="max-w-2xl">
      <PageHeader title="Mi horario" description="Define cuándo pueden agendarte citas. El portal del paciente solo muestra estos horarios." />
      <ScheduleEditor userId={currentUser.id} />
    </div>
  )
}
