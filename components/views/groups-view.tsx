"use client"

import { useEffect, useState } from "react"
import { Check, Copy, Maximize2, Pause, Play, Plus, RefreshCw, Share2, UserMinus, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, EmptyState, PageHeader, Pill } from "@/components/common"
import { Tooth } from "@/components/tooth"
import { brandOf } from "@/lib/branding"
import { formatDateTime } from "@/lib/dates"
import { fullName, providerTitle, useStore, useUserLookup } from "@/lib/store"
import type { Group } from "@/lib/types"

export const joinLink = (code: string) => (typeof window === "undefined" ? `/unirse/${code}` : `${window.location.origin}/unirse/${code}`)

export function GroupsView() {
  const { db, currentUser, currentOrg, orgId } = useStore()
  const [creating, setCreating] = useState(false)
  const [section, setSection] = useState("all")
  if (!currentUser) return null

  const isTeacher = currentUser.role === "teacher"
  const groups = db.groups
    .filter((g) => g.orgId === orgId && !g.archived && (!isTeacher || g.teacherId === currentUser.id))
    .filter((g) => section === "all" || g.section === section)
    .sort((a, b) => a.section.localeCompare(b.section) || a.name.localeCompare(b.name))
  const sections = [...new Set(db.groups.filter((g) => g.orgId === orgId && !g.archived).map((g) => g.section))].sort()

  return (
    <>
      <PageHeader
        title={isTeacher ? "Mis grupos" : "Grupos"}
        description="Comparte el código con tu grupo y los alumnos se registran solos."
        actions={
          <>
            {!isTeacher && sections.length > 1 && (
              <Select value={section} onValueChange={setSection}>
                <SelectTrigger className="w-48 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las secciones</SelectItem>
                  {sections.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button onClick={() => setCreating(true)} className={brandOf(currentOrg).solid}>
              <Plus className="mr-2 h-4 w-4" /> Nuevo grupo
            </Button>
          </>
        }
      />

      {groups.length === 0 ? (
        <EmptyState
          title="Aún no tienes grupos"
          description="Crea uno, comparte el código en clase y tus alumnos se unen en segundos."
          action={<Button onClick={() => setCreating(true)}>Crear mi primer grupo</Button>}
        />
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {groups.map((g) => (
            <GroupCard key={g.id} group={g} />
          ))}
        </div>
      )}

      <CreateGroupDialog open={creating} onOpenChange={setCreating} />
    </>
  )
}

function GroupCard({ group }: { group: Group }) {
  const { db, currentOrg, actions } = useStore()
  const userById = useUserLookup()
  const [copied, setCopied] = useState<"code" | "link" | null>(null)
  const [projecting, setProjecting] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const brand = brandOf(currentOrg)

  const members = db.members.filter((m) => m.groupId === group.id)
  const pending = members.filter((m) => m.status === "pending")
  const approved = members.filter((m) => m.status === "approved")
  const link = joinLink(group.code)

  const copy = async (text: string, what: "code" | "link") => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(what)
      setTimeout(() => setCopied(null), 1500)
    } catch {
      // portapapeles bloqueado: el usuario puede copiarlo a mano
    }
  }

  const whatsappText = encodeURIComponent(
    `Únete a ${group.section} · ${group.name} en DentalCare 🦷\nCódigo: ${group.code}\n${link}`,
  )

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className={`bg-gradient-to-br p-5 text-white ${brand.hero}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-white/80">
              {group.section} · {group.term} · {group.shift}
            </p>
            <h3 className="text-2xl font-bold">{group.name}</h3>
            <p className="text-sm text-white/80">{providerTitle(userById(group.teacherId))}</p>
          </div>
          <Pill className="bg-white/20 text-white">
            <Users className="mr-1 h-3 w-3" />
            {approved.length}
            {group.maxMembers ? ` / ${group.maxMembers}` : ""}
          </Pill>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            onClick={() => copy(group.code, "code")}
            className={`rounded-xl bg-white/95 px-4 py-2 font-mono text-lg font-bold tracking-wider text-slate-900 transition hover:bg-white ${group.codeActive ? "" : "line-through opacity-60"}`}
            title="Copiar código"
          >
            {copied === "code" ? "¡Copiado!" : group.code}
          </button>
          <Button size="sm" variant="secondary" onClick={() => copy(link, "link")} className="bg-white/20 text-white hover:bg-white/30">
            {copied === "link" ? <Check className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />} Link
          </Button>
          <Button size="sm" variant="secondary" asChild className="bg-white/20 text-white hover:bg-white/30">
            <a href={`https://wa.me/?text=${whatsappText}`} target="_blank" rel="noopener noreferrer">
              <Share2 className="mr-1 h-4 w-4" /> WhatsApp
            </a>
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setProjecting(true)} className="bg-white/20 text-white hover:bg-white/30">
            <Maximize2 className="mr-1 h-4 w-4" /> Proyectar
          </Button>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex flex-wrap gap-2 text-sm">
          <Button size="sm" variant="outline" onClick={() => actions.updateGroup(group.id, { codeActive: !group.codeActive })}>
            {group.codeActive ? <Pause className="mr-1 h-4 w-4" /> : <Play className="mr-1 h-4 w-4" />}
            {group.codeActive ? "Pausar inscripciones" : "Reabrir inscripciones"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => confirm("¿Generar un código nuevo? El actual dejará de funcionar.") && actions.regenerateGroupCode(group.id)}
          >
            <RefreshCw className="mr-1 h-4 w-4" /> Nuevo código
          </Button>
          <label className="flex items-center gap-2 rounded-md border px-3 text-slate-600">
            <Checkbox checked={group.requireApproval} onCheckedChange={(v) => actions.updateGroup(group.id, { requireApproval: v === true })} />
            Aprobar antes de entrar
          </label>
        </div>

        {pending.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-amber-900">Solicitudes ({pending.length})</p>
              <div className="flex gap-1">
                {selected.length > 0 && (
                  <Button size="sm" variant="outline" onClick={() => { actions.approveMembers(selected); setSelected([]) }}>
                    Aceptar seleccionados ({selected.length})
                  </Button>
                )}
                <Button size="sm" onClick={() => { actions.approveMembers(pending.map((m) => m.id)); setSelected([]) }} className="bg-emerald-600 hover:bg-emerald-700">
                  <Check className="mr-1 h-4 w-4" /> Aceptar todos
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              {pending.map((m) => {
                const u = userById(m.userId)
                return (
                  <div key={m.id} className="flex items-center gap-3 rounded-lg bg-white px-3 py-2 text-sm">
                    <Checkbox
                      checked={selected.includes(m.id)}
                      onCheckedChange={(v) => setSelected((s) => (v ? [...s, m.id] : s.filter((x) => x !== m.id)))}
                    />
                    <span className="flex-1">
                      <span className="font-medium text-slate-800">{fullName(u)}</span>
                      <span className="text-slate-400"> · {u?.enrollment || "sin matrícula"} · {u?.email}</span>
                    </span>
                    <span className="hidden text-xs text-slate-400 sm:inline">{formatDateTime(m.joinedAt)}</span>
                    <Button size="sm" variant="ghost" onClick={() => actions.removeMember(m.id)} className="h-7 text-red-600">
                      Rechazar
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div>
          <p className="mb-2 text-sm font-semibold text-slate-700">Alumnos ({approved.length})</p>
          {approved.length === 0 ? (
            <p className="text-sm text-slate-400">Nadie se ha unido todavía. Comparte el código 👆</p>
          ) : (
            <div className="space-y-1">
              {approved.map((m) => {
                const u = userById(m.userId)
                const patientCount = db.patients.filter((p) => p.providerId === m.userId).length
                return (
                  <div key={m.id} className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50">
                    <Avatar name={fullName(u)} size={28} />
                    <span className="flex-1">
                      <span className="font-medium text-slate-800">{fullName(u)}</span>
                      <span className="text-slate-400"> · {u?.enrollment}</span>
                    </span>
                    <span className="text-xs text-slate-400">{patientCount} pacientes</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-slate-400"
                      onClick={() => confirm(`¿Sacar a ${fullName(u)} del grupo?`) && actions.removeMember(m.id)}
                      aria-label="Sacar del grupo"
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modo proyector: código gigante para mostrar en clase */}
      <Dialog open={projecting} onOpenChange={setProjecting}>
        <DialogContent className="max-w-4xl border-0 p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Código del grupo</DialogTitle>
          </DialogHeader>
          <div className={`flex flex-col items-center rounded-lg bg-gradient-to-br px-6 py-12 text-center text-white ${brand.hero}`}>
            {currentOrg?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={currentOrg.logoUrl} alt="" className="h-20 w-20 rounded-2xl bg-white object-contain p-2" />
            ) : (
              <div className="tooth-hop">
                <Tooth size={90} mood="sparkle" cap />
              </div>
            )}
            <p className="mt-4 text-xl text-white/90">
              Únete a {group.section} · {group.name}
            </p>
            <p className="mt-6 font-mono text-5xl font-black tracking-widest sm:text-7xl">{group.code}</p>
            <p className="mt-8 text-lg text-white/80">Entra a</p>
            <p className="break-all text-2xl font-semibold">{link.replace(/^https?:\/\//, "")}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CreateGroupDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { db, currentUser, orgId, currentOrg, actions } = useStore()
  const isTeacher = currentUser?.role === "teacher"
  const teachers = db.users.filter((u) => u.orgId === orgId && u.role === "teacher" && u.active)
  const blank = { name: "", section: "", term: currentTerm(), shift: "matutino" as Group["shift"], maxMembers: "30", requireApproval: true, teacherId: isTeacher ? currentUser?.id ?? "" : "" }
  const [form, setForm] = useState(blank)
  const [error, setError] = useState("")
  const [createdCode, setCreatedCode] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setForm(blank)
      setError("")
      setCreatedCode(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const save = () => {
    if (!form.name.trim() || !form.section.trim()) return setError("Escribe el nombre del grupo y la sección")
    if (!form.teacherId) return setError("Elige al maestro responsable")
    const code = actions.createGroup({
      name: form.name.trim(),
      section: form.section.trim(),
      term: form.term.trim(),
      shift: form.shift,
      requireApproval: form.requireApproval,
      maxMembers: Number(form.maxMembers) || undefined,
      teacherId: form.teacherId,
    })
    setCreatedCode(code)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{createdCode ? "¡Grupo creado! 🎉" : "Nuevo grupo"}</DialogTitle>
          <DialogDescription>{createdCode ? "Comparte este código con tus alumnos" : "Como un equipo de Teams: tú compartes el código y ellos se unen"}</DialogDescription>
        </DialogHeader>

        {createdCode ? (
          <div className="flex flex-col items-center py-4">
            <p className={`rounded-2xl bg-gradient-to-br px-6 py-4 font-mono text-3xl font-black tracking-widest text-white ${brandOf(currentOrg).hero}`}>{createdCode}</p>
            <p className="mt-3 break-all text-center text-sm text-slate-500">{joinLink(createdCode)}</p>
            <Button className="mt-6" onClick={() => onOpenChange(false)}>
              Listo
            </Button>
          </div>
        ) : (
          <>
            <div className="grid gap-4 py-2 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Sección / materia</Label>
                <Input value={form.section} onChange={(e) => setForm((f) => ({ ...f, section: e.target.value }))} placeholder="Periodoncia" />
              </div>
              <div className="space-y-2">
                <Label>Grupo</Label>
                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="7°A" />
              </div>
              <div className="space-y-2">
                <Label>Ciclo</Label>
                <Input value={form.term} onChange={(e) => setForm((f) => ({ ...f, term: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Turno</Label>
                <Select value={form.shift} onValueChange={(v) => setForm((f) => ({ ...f, shift: v as Group["shift"] }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="matutino">Matutino</SelectItem>
                    <SelectItem value="vespertino">Vespertino</SelectItem>
                    <SelectItem value="mixto">Mixto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Cupo máximo</Label>
                <Input type="number" min={1} value={form.maxMembers} onChange={(e) => setForm((f) => ({ ...f, maxMembers: e.target.value }))} />
              </div>
              {!isTeacher && (
                <div className="space-y-2">
                  <Label>Maestro</Label>
                  <Select value={form.teacherId} onValueChange={(v) => setForm((f) => ({ ...f, teacherId: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Elegir…" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {fullName(t)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <label className="flex items-center gap-2 text-sm text-slate-700 sm:col-span-2">
                <Checkbox checked={form.requireApproval} onCheckedChange={(v) => setForm((f) => ({ ...f, requireApproval: v === true }))} />
                Quiero aprobar a cada alumno antes de que entre
              </label>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={save} className={brandOf(currentOrg).solid}>
                Crear y obtener código
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function currentTerm() {
  const now = new Date()
  return `${now.getFullYear()}-${now.getMonth() < 6 ? "A" : "B"}`
}
