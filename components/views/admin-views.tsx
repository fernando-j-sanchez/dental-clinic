"use client"

import { useState } from "react"
import { Building2, GraduationCap, ImageUp, Plus, Stethoscope } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { EmptyState, PageHeader, Pill } from "@/components/common"
import { Tooth } from "@/components/tooth"
import { BRANDS } from "@/lib/branding"
import { formatDate, formatDateTime } from "@/lib/dates"
import { NOTE_TYPE_LABELS, ORG_TYPE_LABELS } from "@/lib/permissions"
import { fullName, useStore, useUserLookup } from "@/lib/store"
import type { BrandKey, OrgType } from "@/lib/types"

export function ValidationsView({ onOpenPatient }: { onOpenPatient: (id: string) => void }) {
  const { db, currentUser, orgId } = useStore()
  const userById = useUserLookup()
  if (!currentUser) return null

  const pending = db.notes
    .filter((n) => n.orgId === orgId && n.status === "pending_review")
    .sort((a, b) => a.updatedAt.localeCompare(b.updatedAt))
  const mineFirst = [
    ...pending.filter((n) => userById(n.authorId)?.supervisorId === currentUser.id),
    ...pending.filter((n) => userById(n.authorId)?.supervisorId !== currentUser.id),
  ]

  return (
    <>
      <PageHeader title="Validaciones" description="Notas de alumnos que esperan revisión. Abre el expediente para validar o pedir correcciones." />
      {mineFirst.length === 0 ? (
        <EmptyState title="¡Todo validado! 🎉" description="No hay notas pendientes de revisión." />
      ) : (
        <div className="space-y-3">
          {mineFirst.map((n) => {
            const author = userById(n.authorId)
            const patient = db.patients.find((p) => p.id === n.patientId)
            return (
              <button
                key={n.id}
                onClick={() => onOpenPatient(n.patientId)}
                className="flex w-full flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-amber-300 hover:shadow"
              >
                <Pill className="bg-amber-100 text-amber-800">{NOTE_TYPE_LABELS[n.type]}</Pill>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{n.title}</p>
                  <p className="text-sm text-slate-500">
                    {fullName(author)}
                    {author?.enrollment ? ` (${author.enrollment})` : ""} · Paciente: {fullName(patient)}
                  </p>
                </div>
                <span className="text-sm text-slate-400">{formatDate(n.date)}</span>
              </button>
            )
          })}
        </div>
      )}
    </>
  )
}

export function OrganizationsView() {
  const { db, currentOrg, actions } = useStore()
  const mode: OrgType = currentOrg?.type ?? "clinic"
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: "", city: "", type: mode })

  const create = () => {
    if (!form.name.trim()) return
    const id = actions.addOrganization({ ...form, doctorsSeeAllPatients: false, autoConfirmPatientBookings: false })
    actions.setActiveOrg(id)
    setCreating(false)
  }

  return (
    <>
      <PageHeader
        title={mode === "school" ? "Universidades" : "Clínicas"}
        description="Cada organización tiene sus datos separados. Cambia de versión con el selector de arriba."
        actions={
          <Button onClick={() => { setForm({ name: "", city: "", type: mode }); setCreating(true) }} className="bg-sky-600 hover:bg-sky-700">
            <Plus className="mr-2 h-4 w-4" /> {mode === "school" ? "Nueva universidad" : "Nueva clínica"}
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {db.organizations.filter((o) => o.type === mode).map((o) => {
          const users = db.users.filter((u) => u.orgId === o.id && u.active)
          const Icon = o.type === "school" ? GraduationCap : Stethoscope
          return (
            <div key={o.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`rounded-xl p-2.5 ${o.type === "school" ? "bg-amber-50 text-amber-600" : "bg-sky-50 text-sky-600"}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{o.name}</p>
                  <p className="text-sm text-slate-500">
                    {ORG_TYPE_LABELS[o.type]} · {o.city || "—"}
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <Stat label="Personal" value={users.filter((u) => u.role !== "patient").length} />
                <Stat label="Pacientes" value={db.patients.filter((p) => p.orgId === o.id).length} />
                <Stat label="Citas" value={db.appointments.filter((a) => a.orgId === o.id).length} />
              </div>
              <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => actions.setActiveOrg(o.id)}>
                Ver esta organización
              </Button>
            </div>
          )
        })}
      </div>

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva organización</DialogTitle>
            <DialogDescription>Después da de alta a su administrador en “Personal”.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-2">
              {(["clinic", "school"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, type: t }))}
                  className={`flex items-center justify-center gap-2 rounded-xl border-2 p-3 text-sm font-medium ${form.type === t ? "border-sky-500 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-600"}`}
                >
                  {t === "school" ? <GraduationCap className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                  {ORG_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Ciudad</Label>
              <Input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCreating(false)}>
              Cancelar
            </Button>
            <Button onClick={create} disabled={!form.name.trim()} className="bg-sky-600 hover:bg-sky-700">
              Crear
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-slate-50 py-2">
      <p className="text-lg font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  )
}

export function AuditView() {
  const { db, currentUser, orgId } = useStore()
  const userById = useUserLookup()
  if (!currentUser) return null
  const entries = db.audit.filter((e) => e.orgId === orgId)

  return (
    <>
      <PageHeader title="Auditoría" description="Registro de acciones sensibles: accesos de soporte, bajas, transferencias y validaciones." />
      {entries.length === 0 ? (
        <EmptyState title="Sin registros todavía" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {entries.map((e) => {
            const user = userById(e.userId)
            const fromSupport = user?.role === "support"
            return (
              <div key={e.id} className={`flex flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-3 text-sm last:border-0 ${fromSupport ? "bg-amber-50/50" : ""}`}>
                <span className="w-40 text-slate-400">{formatDateTime(e.at)}</span>
                <span className="font-medium text-slate-800">{fullName(user)}</span>
                {fromSupport && <Pill className="bg-slate-900 text-white">Soporte</Pill>}
                <span className="text-slate-600">{e.action}</span>
                <span className="min-w-0 flex-1 truncate text-slate-500">{e.detail}</span>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}

// Ajusta el logo a máx. 256 px para que quepa en el almacenamiento del navegador
async function resizeLogo(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
  if (file.type === "image/svg+xml") return dataUrl
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = dataUrl
  })
  const scale = Math.min(1, 256 / Math.max(img.width, img.height))
  const canvas = document.createElement("canvas")
  canvas.width = Math.round(img.width * scale)
  canvas.height = Math.round(img.height * scale)
  canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL("image/png")
}

export function SettingsView() {
  const { currentOrg, actions } = useStore()
  const [domain, setDomain] = useState(currentOrg?.emailDomain ?? "")
  const [savedDomain, setSavedDomain] = useState(false)
  if (!currentOrg) return <EmptyState title="Elige una organización" />
  const currentBrand = currentOrg.brand ?? (currentOrg.type === "school" ? "violet" : "sky")

  return (
    <div className="max-w-2xl space-y-8">
      <PageHeader title="Configuración" description={currentOrg.name} />

      <section className="space-y-3">
        <h2 className="font-semibold text-slate-900">Identidad de la {ORG_TYPE_LABELS[currentOrg.type].toLowerCase()}</h2>
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50">
            {currentOrg.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={currentOrg.logoUrl} alt="Logo" className="h-full w-full object-contain p-1" />
            ) : (
              <Tooth size={44} mood="happy" cap={currentOrg.type === "school"} />
            )}
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-sm text-slate-600">Sube el escudo o logo. Aparece en el menú, en el portal del paciente y en la pantalla para unirse a grupos.</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" asChild>
                <label className="cursor-pointer">
                  <ImageUp className="mr-1.5 h-4 w-4" /> {currentOrg.logoUrl ? "Cambiar logo" : "Subir logo"}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    hidden
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (file) actions.updateOrganization(currentOrg.id, { logoUrl: await resizeLogo(file) })
                    }}
                  />
                </label>
              </Button>
              {currentOrg.logoUrl && (
                <Button size="sm" variant="ghost" onClick={() => actions.updateOrganization(currentOrg.id, { logoUrl: undefined })} className="text-slate-500">
                  Quitar
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="mb-3 text-sm text-slate-600">Colores</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(Object.keys(BRANDS) as BrandKey[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => actions.updateOrganization(currentOrg.id, { brand: key })}
                className={`flex items-center gap-2 rounded-xl border-2 p-2 text-left text-sm transition ${currentBrand === key ? "border-slate-900" : "border-transparent hover:border-slate-200"}`}
              >
                <span className={`h-8 w-8 shrink-0 rounded-lg ${BRANDS[key].swatch}`} />
                <span className="text-slate-700">{BRANDS[key].label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {currentOrg.type === "school" && (
        <section className="space-y-3">
          <h2 className="font-semibold text-slate-900">Registro de alumnos</h2>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <Label>Solo aceptar correos institucionales (opcional)</Label>
            <p className="mb-3 mt-1 text-sm text-slate-500">
              Si tu escuela tiene correo para alumnos, escríbelo aquí y solo podrán unirse con él. Si no tienen, déjalo vacío y basta con el código del grupo.
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">@</span>
                <Input
                  value={domain.replace(/^@/, "")}
                  onChange={(e) => {
                    setDomain(e.target.value)
                    setSavedDomain(false)
                  }}
                  placeholder="alumno.miuniversidad.mx"
                  className="pl-7"
                />
              </div>
              <Button
                onClick={() => {
                  actions.updateOrganization(currentOrg.id, { emailDomain: domain.trim().replace(/^@/, "") || undefined })
                  setSavedDomain(true)
                }}
              >
                Guardar
              </Button>
            </div>
            {savedDomain && (
              <p className="mt-2 text-sm text-emerald-600">{domain.trim() ? `Listo: solo correos @${domain.trim().replace(/^@/, "")}` : "Listo: cualquier correo con el código del grupo"}</p>
            )}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="font-semibold text-slate-900">Funcionamiento</h2>
        <SettingRow
          title="Los dentistas ven a todos los pacientes"
          description="Si está apagado, cada dentista solo ve los expedientes a su cargo. Los alumnos siempre ven solo los suyos."
          checked={currentOrg.doctorsSeeAllPatients}
          onChange={(v) => actions.updateOrganization(currentOrg.id, { doctorsSeeAllPatients: v })}
        />
        <SettingRow
          title="Confirmar automáticamente las citas que pide el paciente"
          description="Si está apagado, recepción o el profesional deben confirmar cada solicitud."
          checked={currentOrg.autoConfirmPatientBookings}
          onChange={(v) => actions.updateOrganization(currentOrg.id, { autoConfirmPatientBookings: v })}
        />
      </section>
    </div>
  )
}

function SettingRow({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4">
      <Switch checked={checked} onCheckedChange={onChange} className="mt-0.5" />
      <div>
        <p className="font-medium text-slate-900">{title}</p>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
    </label>
  )
}
