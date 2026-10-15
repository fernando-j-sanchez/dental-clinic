"use client"

import { useState } from "react"
import { CalendarDays, CalendarPlus, HeartPulse, Home, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EmptyState, Pill } from "@/components/common"
import { NotificationsBell } from "@/components/notifications-bell"
import { Tooth, ToothLogo } from "@/components/tooth"
import { daysFromToday, formatDate, formatLongDate, formatTime, parseDateKey, todayKey } from "@/lib/dates"
import { APPOINTMENT_STATUS, APPOINTMENT_TYPE_LABELS } from "@/lib/permissions"
import { getFreeSlots } from "@/lib/slots"
import { providerTitle, useStore, useUserLookup } from "@/lib/store"
import type { AppointmentType } from "@/lib/types"

type Tab = "home" | "book" | "treatment" | "appointments"

const TABS: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Inicio", icon: Home },
  { id: "book", label: "Agendar", icon: CalendarPlus },
  { id: "treatment", label: "Mi tratamiento", icon: HeartPulse },
  { id: "appointments", label: "Mis citas", icon: CalendarDays },
]

export function PatientPortal() {
  const { db, currentUser, currentOrg, actions } = useStore()
  const [tab, setTab] = useState<Tab>("home")
  if (!currentUser) return null
  const patient = db.patients.find((p) => p.userId === currentUser.id)

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white pb-24 sm:pb-8">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-4">
          <ToothLogo size={36} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-slate-900">{currentOrg?.name}</p>
            <p className="text-xs text-slate-500">Portal del paciente</p>
          </div>
          <NotificationsBell />
          <Button variant="ghost" size="icon" onClick={actions.logout} aria-label="Cerrar sesión">
            <LogOut className="h-5 w-5 text-slate-500" />
          </Button>
        </div>
        <nav className="mx-auto hidden max-w-3xl gap-1 px-4 pb-2 sm:flex">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition ${tab === t.id ? "bg-sky-500 text-white" : "text-slate-600 hover:bg-slate-100"}`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-3xl p-4">
        {!patient ? (
          <EmptyState title="Tu expediente aún no está listo" description="La clínica debe vincular tu cuenta. Intenta más tarde." />
        ) : tab === "home" ? (
          <PortalHome patientId={patient.id} onBook={() => setTab("book")} onTreatment={() => setTab("treatment")} />
        ) : tab === "book" ? (
          <PortalBooking patientId={patient.id} onDone={() => setTab("appointments")} />
        ) : tab === "treatment" ? (
          <PortalTreatment patientId={patient.id} />
        ) : (
          <PortalAppointments patientId={patient.id} />
        )}
      </main>

      {/* Navegación inferior en celular */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-slate-200 bg-white sm:hidden">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex flex-col items-center gap-0.5 py-2 text-[11px] ${tab === t.id ? "text-sky-600" : "text-slate-400"}`}>
            <t.icon className="h-5 w-5" />
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  )
}

function PortalHome({ patientId, onBook, onTreatment }: { patientId: string; onBook: () => void; onTreatment: () => void }) {
  const { db, currentUser } = useStore()
  const userById = useUserLookup()
  const patient = db.patients.find((p) => p.id === patientId)!
  const today = todayKey()
  const next = db.appointments
    .filter((a) => a.patientId === patientId && a.date >= today && (a.status === "confirmed" || a.status === "requested"))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0]
  const lastShared = db.notes
    .filter((n) => n.patientId === patientId && n.visibleToPatient && (n.status === "final" || n.status === "validated"))
    .sort((a, b) => b.date.localeCompare(a.date))[0]

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 to-cyan-400 p-6 text-white shadow-lg shadow-sky-200">
        <p className="text-sm text-white/80">¡Hola!</p>
        <h1 className="text-2xl font-bold">{currentUser?.firstName} 😁</h1>
        <p className="mt-1 text-sm text-white/90">Tu responsable: {providerTitle(userById(patient.providerId))}</p>
        <div className="tooth-hop absolute -bottom-2 right-4">
          <Tooth size={90} mood="happy" />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-slate-500">Tu próxima cita</p>
        {next ? (
          <>
            <p className="mt-1 text-xl font-bold capitalize text-slate-900">{formatLongDate(next.date)}</p>
            <p className="text-slate-600">
              {formatTime(next.time)} · {APPOINTMENT_TYPE_LABELS[next.type]} · {providerTitle(userById(next.providerId))}
            </p>
            <div className="mt-2">
              <Pill className={APPOINTMENT_STATUS[next.status].className}>{APPOINTMENT_STATUS[next.status].label}</Pill>
            </div>
          </>
        ) : (
          <p className="mt-1 text-slate-600">No tienes citas próximas.</p>
        )}
        <Button onClick={onBook} className="mt-4 w-full bg-sky-600 hover:bg-sky-700">
          <CalendarPlus className="mr-2 h-4 w-4" /> Agendar una cita
        </Button>
      </div>

      {lastShared && (
        <button onClick={onTreatment} className="w-full rounded-2xl border border-pink-200 bg-pink-50/60 p-5 text-left">
          <p className="text-sm font-medium text-pink-700">Lo último de tu tratamiento</p>
          <p className="mt-1 font-semibold text-slate-900">{lastShared.title}</p>
          <p className="mt-1 text-sm text-slate-600">{lastShared.patientSummary}</p>
          {lastShared.followUpDate && <p className="mt-2 text-sm font-medium text-amber-700">Próxima revisión sugerida: {formatDate(lastShared.followUpDate)}</p>}
        </button>
      )}
    </div>
  )
}

function PortalBooking({ patientId, onDone }: { patientId: string; onDone: () => void }) {
  const { db, providers, actions } = useStore()
  const patient = db.patients.find((p) => p.id === patientId)!
  const [providerId, setProviderId] = useState(patient.providerId || providers[0]?.id || "")
  const [date, setDate] = useState(todayKey())
  const [time, setTime] = useState("")
  const [type, setType] = useState<AppointmentType>("consultation")
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)

  const dates = Array.from({ length: 14 }, (_, i) => daysFromToday(i))
  const slots = providerId ? getFreeSlots(db, providerId, date, 60) : []

  const book = () => {
    if (!time) return setError("Elige un horario")
    const err = actions.addAppointment({ patientId, providerId, date, time, duration: 60, type, notes: "Agendada desde el portal" })
    if (err) return setError(err)
    setDone(true)
    setTimeout(onDone, 2000)
  }

  if (done) {
    return (
      <div className="fade-up flex flex-col items-center rounded-3xl bg-white p-10 text-center shadow-sm">
        <div className="tooth-hop">
          <Tooth size={100} mood="sparkle" />
        </div>
        <p className="mt-4 text-xl font-bold text-slate-900">¡Solicitud enviada!</p>
        <p className="text-slate-500">Te avisaremos cuando la clínica confirme tu cita.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-slate-900">Agendar cita</h1>

      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">¿Con quién?</p>
        <Select value={providerId} onValueChange={(v) => { setProviderId(v); setTime("") }}>
          <SelectTrigger className="h-12 bg-white">
            <SelectValue placeholder="Elige profesional" />
          </SelectTrigger>
          <SelectContent>
            {providers.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {providerTitle(p)}
                {p.id === patient.providerId ? " (tu responsable)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">¿Qué día?</p>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2">
          {dates.map((d) => {
            const dt = parseDateKey(d)
            const available = providerId ? getFreeSlots(db, providerId, d, 60).length > 0 : false
            return (
              <button
                key={d}
                disabled={!available}
                onClick={() => { setDate(d); setTime("") }}
                className={`flex w-16 shrink-0 flex-col items-center rounded-2xl border py-2 transition ${
                  d === date ? "border-sky-500 bg-sky-500 text-white shadow" : available ? "border-slate-200 bg-white hover:border-sky-300" : "border-slate-100 bg-slate-50 text-slate-300"
                }`}
              >
                <span className="text-xs capitalize">{dt.toLocaleDateString("es-MX", { weekday: "short" })}</span>
                <span className="text-lg font-bold">{dt.getDate()}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">¿A qué hora?</p>
        {slots.length === 0 ? (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">No hay horarios libres ese día.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {slots.map((s) => (
              <button
                key={s}
                onClick={() => setTime(s)}
                className={`rounded-xl border py-2.5 text-sm font-medium transition ${time === s ? "border-sky-500 bg-sky-500 text-white" : "border-slate-200 bg-white hover:border-sky-300"}`}
              >
                {formatTime(s)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">Motivo</p>
        <div className="flex flex-wrap gap-2">
          {(["consultation", "cleaning", "followup", "emergency"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`rounded-full border px-4 py-1.5 text-sm transition ${type === t ? "border-sky-500 bg-sky-50 text-sky-700" : "border-slate-200 bg-white text-slate-600"}`}
            >
              {APPOINTMENT_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button onClick={book} disabled={!time} className="h-12 w-full bg-sky-600 text-base hover:bg-sky-700">
        Solicitar cita
      </Button>
    </div>
  )
}

function PortalTreatment({ patientId }: { patientId: string }) {
  const { db } = useStore()
  const userById = useUserLookup()
  // El paciente solo ve notas compartidas y ya firmadas/validadas, con el resumen en lenguaje sencillo
  const shared = db.notes
    .filter((n) => n.patientId === patientId && n.visibleToPatient && (n.status === "final" || n.status === "validated"))
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Mi tratamiento</h1>
      {shared.length === 0 ? (
        <EmptyState title="Aún no hay información compartida" description="Tu dentista compartirá aquí tus diagnósticos e indicaciones." />
      ) : (
        <div className="relative space-y-4 border-l-2 border-pink-100 pl-6">
          {shared.map((n) => (
            <div key={n.id} className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="absolute -left-[33px] top-6 h-4 w-4 rounded-full border-4 border-white bg-pink-400 shadow" />
              <p className="text-xs text-slate-400">
                {formatDate(n.date)} · {providerTitle(userById(n.authorId))}
              </p>
              <p className="mt-1 font-semibold text-slate-900">{n.title}</p>
              <p className="mt-2 text-slate-700">{n.patientSummary}</p>
              {n.medications && (
                <p className="mt-3 rounded-xl bg-sky-50 px-3 py-2 text-sm text-sky-900">
                  💊 <span className="font-medium">Indicaciones:</span> {n.medications}
                </p>
              )}
              {n.followUpDate && <p className="mt-2 text-sm font-medium text-amber-700">Próxima revisión: {formatDate(n.followUpDate)}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PortalAppointments({ patientId }: { patientId: string }) {
  const { db, actions } = useStore()
  const userById = useUserLookup()
  const today = todayKey()
  const list = db.appointments.filter((a) => a.patientId === patientId).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Mis citas</h1>
      {list.length === 0 ? (
        <EmptyState title="Sin citas" />
      ) : (
        list.map((a) => {
          const upcoming = a.date >= today && (a.status === "confirmed" || a.status === "requested")
          return (
            <div key={a.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="min-w-0 flex-1">
                <p className="font-semibold capitalize text-slate-900">{formatLongDate(a.date)}</p>
                <p className="text-sm text-slate-500">
                  {formatTime(a.time)} · {APPOINTMENT_TYPE_LABELS[a.type]} · {providerTitle(userById(a.providerId))}
                </p>
              </div>
              <Pill className={APPOINTMENT_STATUS[a.status].className}>{APPOINTMENT_STATUS[a.status].label}</Pill>
              {upcoming && (
                <Button size="sm" variant="ghost" className="text-red-600" onClick={() => confirm("¿Cancelar esta cita?") && actions.setAppointmentStatus(a.id, "cancelled")}>
                  Cancelar
                </Button>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
