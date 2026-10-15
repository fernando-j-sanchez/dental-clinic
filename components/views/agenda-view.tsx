"use client"

import { useState } from "react"
import { Check, ChevronLeft, ChevronRight, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EmptyState, PageHeader, Pill } from "@/components/common"
import { AppointmentDialog } from "@/components/views/appointment-dialog"
import { formatLongDate, formatTime, toDateKey, todayKey } from "@/lib/dates"
import { APPOINTMENT_STATUS, APPOINTMENT_TYPE_LABELS, can, isProvider } from "@/lib/permissions"
import { visiblePatients } from "@/lib/selectors"
import { fullName, providerTitle, useStore, useUserLookup } from "@/lib/store"
import type { AppointmentStatus } from "@/lib/types"

const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

export function AgendaView({ onOpenPatient }: { onOpenPatient: (id: string) => void }) {
  const { db, currentUser, currentOrg, orgId, providers, actions } = useStore()
  const userById = useUserLookup()
  const [month, setMonth] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const [selected, setSelected] = useState(todayKey())
  const ownAgenda = currentUser?.role === "dentist" || currentUser?.role === "student"
  const [providerFilter, setProviderFilter] = useState<string>(ownAgenda && currentUser ? currentUser.id : "all")
  const [creating, setCreating] = useState(false)
  if (!currentUser) return null

  const patientIds = new Set(visiblePatients(db, currentUser, orgId, currentOrg).map((p) => p.id))
  const appointments = db.appointments.filter(
    (a) => a.orgId === orgId && (patientIds.has(a.patientId) || a.providerId === currentUser.id) && (providerFilter === "all" || a.providerId === providerFilter),
  )

  const start = new Date(month)
  start.setDate(1 - month.getDay())
  const days = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })

  const dayAppointments = appointments.filter((a) => a.date === selected).sort((a, b) => a.time.localeCompare(b.time))
  const requested = appointments.filter((a) => a.status === "requested" && a.date >= todayKey())

  const setStatus = (id: string, status: AppointmentStatus) => actions.setAppointmentStatus(id, status)

  return (
    <>
      <PageHeader
        title="Agenda"
        description={requested.length ? `${requested.length} solicitud${requested.length === 1 ? "" : "es"} por confirmar` : "Citas de la organización"}
        actions={
          <>
            {!ownAgenda && (
              <Select value={providerFilter} onValueChange={setProviderFilter}>
                <SelectTrigger className="w-56 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los profesionales</SelectItem>
                  {providers.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {providerTitle(p)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button onClick={() => setCreating(true)} className="bg-sky-600 hover:bg-sky-700">
              <Plus className="mr-2 h-4 w-4" /> Nueva cita
            </Button>
          </>
        }
      />

      {requested.length > 0 && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
          <p className="mb-3 text-sm font-semibold text-amber-900">Solicitudes de pacientes</p>
          <div className="space-y-2">
            {requested.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-white px-3 py-2 text-sm">
                <span className="font-medium text-slate-800">{fullName(db.patients.find((p) => p.id === a.patientId))}</span>
                <span className="text-slate-500">
                  {formatLongDate(a.date)} · {formatTime(a.time)} · {providerTitle(userById(a.providerId))}
                </span>
                <div className="ml-auto flex gap-1">
                  <Button size="sm" onClick={() => setStatus(a.id, "confirmed")} className="h-8 bg-emerald-600 hover:bg-emerald-700">
                    <Check className="mr-1 h-4 w-4" /> Confirmar
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setStatus(a.id, "cancelled")} className="h-8 text-red-600">
                    <X className="mr-1 h-4 w-4" /> Rechazar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Mes anterior">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <p className="font-semibold capitalize text-slate-900">{month.toLocaleDateString("es-MX", { month: "long", year: "numeric" })}</p>
            <Button variant="ghost" size="icon" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Mes siguiente">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-400">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((d) => {
              const key = toDateKey(d)
              const count = appointments.filter((a) => a.date === key && a.status !== "cancelled").length
              const inMonth = d.getMonth() === month.getMonth()
              const isSelected = key === selected
              const isToday = key === todayKey()
              return (
                <button
                  key={key}
                  onClick={() => setSelected(key)}
                  className={`flex aspect-square flex-col items-center justify-center rounded-xl text-sm transition sm:aspect-[4/3] ${
                    isSelected ? "bg-gradient-to-br from-sky-500 to-cyan-500 font-semibold text-white shadow" : isToday ? "bg-sky-50 font-semibold text-sky-700" : inMonth ? "text-slate-700 hover:bg-slate-50" : "text-slate-300"
                  }`}
                >
                  {d.getDate()}
                  {count > 0 && (
                    <span className="mt-1 flex gap-0.5">
                      {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
                        <span key={i} className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white" : "bg-sky-400"}`} />
                      ))}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <p className="mb-3 font-semibold capitalize text-slate-900">{formatLongDate(selected)}</p>
          {dayAppointments.length === 0 ? (
            <EmptyState title="Día libre" description="No hay citas para este día." action={<Button size="sm" variant="outline" onClick={() => setCreating(true)}>Agendar aquí</Button>} />
          ) : (
            <div className="space-y-3">
              {dayAppointments.map((a) => {
                const patient = db.patients.find((p) => p.id === a.patientId)
                const st = APPOINTMENT_STATUS[a.status]
                return (
                  <div key={a.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-lg font-bold text-slate-900">{formatTime(a.time)}</p>
                        <p className="text-xs text-slate-400">{a.duration} min · {APPOINTMENT_TYPE_LABELS[a.type]}</p>
                      </div>
                      <Pill className={st.className}>{st.label}</Pill>
                    </div>
                    <button onClick={() => patient && patientIds.has(patient.id) && onOpenPatient(patient.id)} className="mt-2 text-left font-medium text-sky-700 hover:underline">
                      {fullName(patient)}
                    </button>
                    <p className="text-sm text-slate-500">{providerTitle(userById(a.providerId))}</p>
                    {a.notes && <p className="mt-2 text-sm text-slate-600">{a.notes}</p>}
                    {can.confirmAppointments(currentUser) && (a.status === "confirmed" || a.status === "requested") && (isProvider(currentUser.role) ? a.providerId === currentUser.id || currentUser.role === "teacher" : true) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline" className="mt-3 w-full">
                            Cambiar estado
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {a.status === "requested" && <DropdownMenuItem onClick={() => setStatus(a.id, "confirmed")}>Confirmar</DropdownMenuItem>}
                          <DropdownMenuItem onClick={() => setStatus(a.id, "completed")}>Marcar como atendida</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setStatus(a.id, "no-show")}>No asistió</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setStatus(a.id, "cancelled")} className="text-red-600">
                            Cancelar cita
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <AppointmentDialog open={creating} onOpenChange={setCreating} date={selected >= todayKey() ? selected : undefined} />
    </>
  )
}
