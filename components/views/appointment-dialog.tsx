"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { formatTime, todayKey } from "@/lib/dates"
import { APPOINTMENT_TYPE_LABELS } from "@/lib/permissions"
import { visiblePatients } from "@/lib/selectors"
import { getFreeSlots } from "@/lib/slots"
import { fullName, providerTitle, useStore } from "@/lib/store"
import type { AppointmentType } from "@/lib/types"

export function AppointmentDialog({
  open,
  onOpenChange,
  patientId,
  date,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId?: string
  date?: string
}) {
  const { db, currentUser, currentOrg, orgId, providers, actions } = useStore()
  const [form, setForm] = useState({ patientId: "", providerId: "", date: todayKey(), time: "", duration: 60, type: "consultation" as AppointmentType, notes: "" })
  const [error, setError] = useState("")

  const patients = currentUser ? visiblePatients(db, currentUser, orgId, currentOrg) : []

  useEffect(() => {
    if (!open) return
    const patient = db.patients.find((p) => p.id === patientId)
    const selfProvider = providers.find((p) => p.id === currentUser?.id)
    setForm({
      patientId: patientId ?? "",
      providerId: patient?.providerId || selfProvider?.id || "",
      date: date ?? todayKey(),
      time: "",
      duration: 60,
      type: "consultation",
      notes: "",
    })
    setError("")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const slots = form.providerId && form.date ? getFreeSlots(db, form.providerId, form.date, form.duration) : []

  const save = () => {
    if (!form.patientId || !form.providerId || !form.date || !form.time) {
      setError("Completa paciente, profesional, fecha y hora")
      return
    }
    const err = actions.addAppointment(form)
    if (err) return setError(err)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva cita</DialogTitle>
          <DialogDescription>Los horarios disponibles salen del horario de cada profesional</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Paciente</Label>
            <Select value={form.patientId} onValueChange={(v) => {
              const p = db.patients.find((x) => x.id === v)
              setForm((f) => ({ ...f, patientId: v, providerId: p?.providerId || f.providerId, time: "" }))
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar paciente" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {fullName(p)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Profesional</Label>
            <Select value={form.providerId} onValueChange={(v) => setForm((f) => ({ ...f, providerId: v, time: "" }))}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar profesional" />
              </SelectTrigger>
              <SelectContent>
                {providers.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {providerTitle(p)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Fecha</Label>
            <Input type="date" min={todayKey()} value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value, time: "" }))} />
          </div>
          <div className="space-y-2">
            <Label>Duración</Label>
            <Select value={String(form.duration)} onValueChange={(v) => setForm((f) => ({ ...f, duration: Number(v), time: "" }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[30, 45, 60, 90, 120].map((d) => (
                  <SelectItem key={d} value={String(d)}>
                    {d} min
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Horario</Label>
            {!form.providerId ? (
              <p className="text-sm text-slate-400">Elige un profesional para ver sus horarios.</p>
            ) : slots.length === 0 ? (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">No hay horarios libres ese día. Prueba otra fecha.</p>
            ) : (
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                {slots.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, time: s }))}
                    className={`rounded-lg border px-2 py-1.5 text-sm transition ${form.time === s ? "border-sky-500 bg-sky-500 text-white" : "border-slate-200 hover:border-sky-300"}`}
                  >
                    {formatTime(s)}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Tipo</Label>
            <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as AppointmentType }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(APPOINTMENT_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Notas</Label>
            <Textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} />
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={save} className="bg-sky-600 hover:bg-sky-700">
            Agendar cita
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
