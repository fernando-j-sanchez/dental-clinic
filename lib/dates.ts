// Fechas "YYYY-MM-DD" siempre en hora local. new Date("2024-03-20") se interpreta en UTC
// y en México se mostraría como el día anterior.

export const toDateKey = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export const parseDateKey = (dateKey: string) => {
  const [y, m, d] = dateKey.split("-").map(Number)
  return new Date(y, m - 1, d)
}

export const todayKey = () => toDateKey(new Date())

export const daysFromToday = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return toDateKey(date)
}

export const formatDate = (dateKey: string) => parseDateKey(dateKey).toLocaleDateString("es-MX")

export const formatLongDate = (dateKey: string) =>
  parseDateKey(dateKey).toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" })

export const formatTime = (time: string) => {
  const [hours, minutes] = time.split(":")
  const hour = Number.parseInt(hours)
  const ampm = hour >= 12 ? "PM" : "AM"
  return `${hour % 12 || 12}:${minutes} ${ampm}`
}

export const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

export const fromMinutes = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`

export const ageFrom = (dateOfBirth: string) => {
  if (!dateOfBirth) return null
  const birth = parseDateKey(dateOfBirth)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) {
    age--
  }
  return age
}

export const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`
