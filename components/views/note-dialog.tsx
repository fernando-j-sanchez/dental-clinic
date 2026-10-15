"use client"

import { useEffect, useRef, useState } from "react"
import { ImagePlus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { todayKey } from "@/lib/dates"
import { NOTE_TYPE_LABELS } from "@/lib/permissions"
import { useStore } from "@/lib/store"
import type { Attachment, ClinicalNote, NoteType } from "@/lib/types"

type Draft = Omit<ClinicalNote, "id" | "orgId" | "authorId" | "status" | "createdAt" | "updatedAt" | "review" | "voided">

// Reduce las fotos a máx. 1000 px en JPEG para que quepan en el almacenamiento del navegador.
// Con Supabase esto se sube a Storage y aquí solo se guarda la ruta.
async function compressImage(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = dataUrl
  })
  const scale = Math.min(1, 1000 / Math.max(img.width, img.height))
  const canvas = document.createElement("canvas")
  canvas.width = Math.round(img.width * scale)
  canvas.height = Math.round(img.height * scale)
  canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL("image/jpeg", 0.72)
}

export function NoteDialog({
  open,
  onOpenChange,
  patientId,
  note,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId: string
  note?: ClinicalNote // si viene, es una corrección de nota rechazada
}) {
  const { actions } = useStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState("")
  const [draft, setDraft] = useState<Draft>(blankDraft(patientId))

  useEffect(() => {
    if (!open) return
    setError("")
    setDraft(note ? { ...note } : blankDraft(patientId))
  }, [open, note, patientId])

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }))

  const addFiles = async (files: FileList | null) => {
    if (!files) return
    const added: Attachment[] = []
    for (const file of Array.from(files).slice(0, 4)) {
      if (!file.type.startsWith("image/")) continue
      added.push({ id: `${Date.now()}-${file.name}`, name: file.name, dataUrl: await compressImage(file), uploadedBy: "", uploadedAt: new Date().toISOString() })
    }
    setDraft((d) => ({ ...d, attachments: [...d.attachments, ...added] }))
  }

  const save = () => {
    if (!draft.title.trim() || !draft.description.trim()) {
      setError("El título y la descripción son obligatorios")
      return
    }
    if (draft.visibleToPatient && !draft.patientSummary?.trim()) {
      setError("Escribe un resumen sencillo para el paciente")
      return
    }
    if (note) actions.resubmitNote(note.id, draft)
    else actions.addNote(draft)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{note ? "Corregir nota" : "Nueva nota clínica"}</DialogTitle>
          <DialogDescription>
            {note?.review?.comment ? `Comentario del maestro: “${note.review.comment}”` : "Registra la evolución del paciente"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={draft.type} onValueChange={(v) => set("type", v as NoteType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(NOTE_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Fecha</Label>
            <Input type="date" value={draft.date} onChange={(e) => set("date", e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Título *</Label>
            <Input value={draft.title} onChange={(e) => set("title", e.target.value)} placeholder="Ej. Endodoncia pieza 16" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Descripción / hallazgos *</Label>
            <Textarea value={draft.description} onChange={(e) => set("description", e.target.value)} rows={3} />
          </div>
          <div className="space-y-2">
            <Label>Diagnóstico</Label>
            <Input value={draft.diagnosis ?? ""} onChange={(e) => set("diagnosis", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Tratamiento</Label>
            <Input value={draft.treatment ?? ""} onChange={(e) => set("treatment", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Piezas dentales</Label>
            <Input value={draft.toothNumbers ?? ""} onChange={(e) => set("toothNumbers", e.target.value)} placeholder="16, 17" />
          </div>
          <div className="space-y-2">
            <Label>Próximo seguimiento</Label>
            <Input type="date" value={draft.followUpDate ?? ""} onChange={(e) => set("followUpDate", e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Medicamentos / indicaciones</Label>
            <Input value={draft.medications ?? ""} onChange={(e) => set("medications", e.target.value)} />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>Fotos y radiografías</Label>
            <div className="flex flex-wrap gap-2">
              {draft.attachments.map((a) => (
                <div key={a.id} className="group relative h-20 w-20 overflow-hidden rounded-lg border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.dataUrl} alt={a.name} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => set("attachments", draft.attachments.filter((x) => x.id !== a.id))}
                    className="absolute right-1 top-1 rounded-full bg-white/90 p-0.5 opacity-0 transition group-hover:opacity-100"
                    aria-label="Quitar foto"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-200 text-xs text-slate-400 hover:border-sky-300 hover:text-sky-500"
              >
                <ImagePlus className="h-5 w-5" />
                Agregar
              </button>
              <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => addFiles(e.target.files)} />
            </div>
          </div>

          <div className="space-y-3 rounded-xl bg-pink-50/60 p-4 sm:col-span-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
              <Checkbox checked={draft.visibleToPatient} onCheckedChange={(v) => set("visibleToPatient", v === true)} />
              Compartir con el paciente en su portal
            </label>
            {draft.visibleToPatient && (
              <Textarea
                value={draft.patientSummary ?? ""}
                onChange={(e) => set("patientSummary", e.target.value)}
                rows={2}
                placeholder="Explicación en lenguaje sencillo: qué tiene y qué sigue…"
                className="bg-white"
              />
            )}
            <p className="text-xs text-slate-500">El paciente solo ve este resumen, no tus notas técnicas.</p>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={save} className="bg-sky-600 hover:bg-sky-700">
            {note ? "Reenviar a validación" : "Guardar nota"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function blankDraft(patientId: string): Draft {
  return {
    patientId,
    date: todayKey(),
    type: "examination",
    title: "",
    description: "",
    diagnosis: "",
    treatment: "",
    medications: "",
    toothNumbers: "",
    followUpDate: "",
    visibleToPatient: false,
    patientSummary: "",
    attachments: [],
  }
}
