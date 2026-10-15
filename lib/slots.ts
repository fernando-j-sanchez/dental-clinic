import { fromMinutes, parseDateKey, toMinutes, todayKey } from "./dates"
import type { Database } from "./types"

// Horarios libres de un profesional en un día, según su horario semanal y sus citas
export function getFreeSlots(db: Database, providerId: string, date: string, duration = 30, step = 30) {
  const provider = db.users.find((u) => u.id === providerId)
  const day = provider?.schedule?.[parseDateKey(date).getDay()]
  if (!day) return []

  const busy = db.appointments
    .filter((a) => a.providerId === providerId && a.date === date && a.status !== "cancelled")
    .map((a) => [toMinutes(a.time), toMinutes(a.time) + a.duration] as const)

  const now = new Date()
  const minStart = date === todayKey() ? now.getHours() * 60 + now.getMinutes() + 30 : 0

  const slots: string[] = []
  for (let start = toMinutes(day.start); start + duration <= toMinutes(day.end); start += step) {
    if (start < minStart) continue
    const end = start + duration
    if (busy.some(([b0, b1]) => start < b1 && b0 < end)) continue
    slots.push(fromMinutes(start))
  }
  return slots
}
