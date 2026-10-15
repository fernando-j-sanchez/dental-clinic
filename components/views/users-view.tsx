"use client"

import { useEffect, useState } from "react"
import { Clock, Plus, UserMinus, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, EmptyState, PageHeader, Pill, RoleBadge } from "@/components/common"
import { ScheduleEditor } from "@/components/views/schedule-editor"
import { ROLES_BY_ORG_TYPE, ROLE_LABELS, isProvider } from "@/lib/permissions"
import { fullName, providerTitle, useStore, type Reassignment } from "@/lib/store"
import { buildHandoffSummary } from "@/lib/summary"
import type { Role, User } from "@/lib/types"

export function UsersView() {
  const { db, orgId, currentOrg, currentUser, actions } = useStore()
  const [adding, setAdding] = useState(false)
  const [scheduleFor, setScheduleFor] = useState<User | null>(null)
  const [deactivating, setDeactivating] = useState<User | null>(null)

  if (!currentOrg) return <EmptyState title="Elige una organización" description="Usa el selector del menú lateral." />

  const staff = db.users
    .filter((u) => u.orgId === orgId && u.role !== "patient")
    .sort((a, b) => Number(b.active) - Number(a.active) || a.role.localeCompare(b.role) || fullName(a).localeCompare(fullName(b)))

  const patientCount = (userId: string) => db.patients.filter((p) => p.providerId === userId && p.status === "active").length

  return (
    <>
      <PageHeader
        title="Personal"
        description={currentOrg.type === "school" ? "Administración, maestros y alumnos" : "Administración y dentistas"}
        actions={
          <Button onClick={() => setAdding(true)} className="bg-sky-600 hover:bg-sky-700">
            <Plus className="mr-2 h-4 w-4" /> Dar de alta
          </Button>
        }
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {staff.map((u) => {
          const supervisor = db.users.find((x) => x.id === u.supervisorId)
          return (
            <div key={u.id} className={`flex flex-wrap items-center gap-4 border-b border-slate-100 px-4 py-3 last:border-0 ${u.active ? "" : "bg-slate-50 opacity-70"}`}>
              <Avatar name={fullName(u)} size={40} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-900">{fullName(u)}</p>
                  <RoleBadge role={u.role} />
                  {!u.active && <Pill className="bg-slate-200 text-slate-600">Baja</Pill>}
                </div>
                <p className="truncate text-sm text-slate-500">
                  {u.email}
                  {u.specialty ? ` · ${u.specialty}` : ""}
                  {u.enrollment ? ` · ${u.enrollment}` : ""}
                  {supervisor ? ` · Supervisa: ${fullName(supervisor)}` : ""}
                </p>
              </div>
              {isProvider(u.role) && <span className="text-sm text-slate-500">{patientCount(u.id)} pacientes</span>}
              <div className="flex gap-1">
                {u.active && isProvider(u.role) && (
                  <Button size="sm" variant="ghost" onClick={() => setScheduleFor(u)}>
                    <Clock className="mr-1 h-4 w-4" /> Horario
                  </Button>
                )}
                {u.id === currentUser?.id ? null : u.active ? (
                  <Button size="sm" variant="ghost" onClick={() => setDeactivating(u)} className="text-red-600 hover:bg-red-50">
                    <UserMinus className="mr-1 h-4 w-4" /> Dar de baja
                  </Button>
                ) : (
                  <Button size="sm" variant="ghost" onClick={() => actions.reactivateUser(u.id)}>
                    <UserCheck className="mr-1 h-4 w-4" /> Reactivar
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <AddUserDialog open={adding} onOpenChange={setAdding} />
      <Dialog open={!!scheduleFor} onOpenChange={(o) => !o && setScheduleFor(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Horario de {fullName(scheduleFor)}</DialogTitle>
            <DialogDescription>Los pacientes solo pueden agendar dentro de este horario</DialogDescription>
          </DialogHeader>
          {scheduleFor && <ScheduleEditor userId={scheduleFor.id} />}
        </DialogContent>
      </Dialog>
      {deactivating && <DeactivateDialog user={deactivating} onClose={() => setDeactivating(null)} />}
    </>
  )
}

function AddUserDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { db, orgId, currentOrg, actions } = useStore()
  const roles = currentOrg ? ROLES_BY_ORG_TYPE[currentOrg.type].filter((r) => r !== "patient") : []
  const blank = { role: roles[1] ?? roles[0], firstName: "", lastName: "", email: "", password: "", phone: "", specialty: "", licenseNumber: "", enrollment: "", supervisorId: "" }
  const [form, setForm] = useState(blank)
  const [error, setError] = useState("")
  const teachers = db.users.filter((u) => u.orgId === orgId && u.role === "teacher" && u.active)

  useEffect(() => {
    if (open) {
      setForm(blank)
      setError("")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const set = (key: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [key]: v }))

  const save = () => {
    if (!form.firstName || !form.lastName || !form.email) return setError("Nombre, apellidos y email son obligatorios")
    if (form.password.length < 6) return setError("La contraseña temporal debe tener al menos 6 caracteres")
    if (form.role === "student" && !form.supervisorId) return setError("Asigna un maestro que valide al alumno")
    const defaultSchedule = isProvider(form.role as Role) ? [null, ...Array(5).fill({ start: "09:00", end: "15:00" }), null] : undefined
    const err = actions.addUser({
      orgId,
      role: form.role as Role,
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      password: form.password,
      phone: form.phone || undefined,
      specialty: form.specialty || undefined,
      licenseNumber: form.licenseNumber || undefined,
      enrollment: form.enrollment || undefined,
      supervisorId: form.supervisorId || undefined,
      schedule: defaultSchedule,
    })
    if (err) return setError(err)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dar de alta personal</DialogTitle>
          <DialogDescription>Se crea su acceso con una contraseña temporal</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Rol</Label>
            <Select value={form.role} onValueChange={set("role")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <TextField label="Nombre *" value={form.firstName} onChange={set("firstName")} />
          <TextField label="Apellidos *" value={form.lastName} onChange={set("lastName")} />
          <TextField label="Email *" value={form.email} onChange={set("email")} type="email" />
          <TextField label="Contraseña temporal *" value={form.password} onChange={set("password")} />
          <TextField label="Teléfono" value={form.phone} onChange={set("phone")} />
          {(form.role === "dentist" || form.role === "teacher") && (
            <>
              <TextField label="Especialidad" value={form.specialty} onChange={set("specialty")} />
              <TextField label="Cédula profesional" value={form.licenseNumber} onChange={set("licenseNumber")} />
            </>
          )}
          {form.role === "student" && (
            <>
              <TextField label="Matrícula" value={form.enrollment} onChange={set("enrollment")} />
              <div className="space-y-2 sm:col-span-2">
                <Label>Maestro que valida *</Label>
                <Select value={form.supervisorId} onValueChange={set("supervisorId")}>
                  <SelectTrigger>
                    <SelectValue placeholder={teachers.length ? "Seleccionar maestro" : "Primero da de alta un maestro"} />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {providerTitle(t)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={save} className="bg-sky-600 hover:bg-sky-700">
            Dar de alta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Al dar de baja a un dentista o alumno, cada uno de sus pacientes debe quedar con un
// nuevo responsable y un resumen de entrega, para no perder el seguimiento.
function DeactivateDialog({ user, onClose }: { user: User; onClose: () => void }) {
  const { db, providers, actions } = useStore()
  const patients = db.patients.filter((p) => p.providerId === user.id && p.status === "active")
  const candidates = providers.filter((p) => p.id !== user.id)
  const [reason, setReason] = useState("")
  const [rows, setRows] = useState<Reassignment[]>(() =>
    patients.map((p) => ({ patientId: p.id, toProviderId: "", ...buildHandoffSummary(db, p) })),
  )
  const [expanded, setExpanded] = useState<string | null>(null)
  const [error, setError] = useState("")

  const setRow = (patientId: string, data: Partial<Reassignment>) => setRows((rs) => rs.map((r) => (r.patientId === patientId ? { ...r, ...data } : r)))

  const confirmDeactivate = () => {
    if (reason.trim().length < 5) return setError("Escribe el motivo de la baja")
    if (rows.some((r) => !r.toProviderId)) return setError("Asigna un nuevo responsable a cada paciente")
    actions.deactivateUser(user.id, reason.trim(), rows)
    onClose()
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dar de baja a {fullName(user)}</DialogTitle>
          <DialogDescription>
            {patients.length
              ? `Tiene ${patients.length} paciente${patients.length === 1 ? "" : "s"} a su cargo. Cada expediente pasará a otra persona con su resumen de entrega.`
              : "No tiene pacientes a su cargo."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Motivo de la baja</Label>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Terminó su servicio, cambio de clínica, egresó…" />
          </div>

          {patients.length > 0 && (
            <>
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-sm">
                <span className="text-slate-600">Asignar todos a:</span>
                <Select onValueChange={(v) => setRows((rs) => rs.map((r) => ({ ...r, toProviderId: v })))}>
                  <SelectTrigger className="flex-1 bg-white">
                    <SelectValue placeholder="Elegir…" />
                  </SelectTrigger>
                  <SelectContent>
                    {candidates.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {providerTitle(c)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                {rows.map((r) => {
                  const p = patients.find((x) => x.id === r.patientId)!
                  return (
                    <div key={r.patientId} className="rounded-xl border border-slate-200 p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="flex-1 font-medium text-slate-800">{fullName(p)}</span>
                        <Select value={r.toProviderId} onValueChange={(v) => setRow(r.patientId, { toProviderId: v })}>
                          <SelectTrigger className="w-56">
                            <SelectValue placeholder="Nuevo responsable" />
                          </SelectTrigger>
                          <SelectContent>
                            {candidates.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {providerTitle(c)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button size="sm" variant="ghost" onClick={() => setExpanded(expanded === r.patientId ? null : r.patientId)}>
                          {expanded === r.patientId ? "Ocultar resumen" : "Ver resumen"}
                        </Button>
                      </div>
                      {expanded === r.patientId && (
                        <div className="mt-3 space-y-2">
                          <Textarea value={r.summary} onChange={(e) => setRow(r.patientId, { summary: e.target.value })} rows={6} className="font-mono text-xs" />
                          <Textarea value={r.pendingItems} onChange={(e) => setRow(r.patientId, { pendingItems: e.target.value })} rows={3} placeholder="Pendientes" className="text-sm" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={confirmDeactivate} className="bg-red-600 hover:bg-red-700">
            Dar de baja y transferir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function TextField({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}
