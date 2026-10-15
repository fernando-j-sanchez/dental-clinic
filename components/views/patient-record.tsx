"use client"

import { useState } from "react"
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRightLeft,
  Ban,
  CalendarPlus,
  Check,
  FilePlus2,
  Pencil,
  RotateCcw,
  ShieldAlert,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, EmptyState, Field, Pill } from "@/components/common"
import { AppointmentDialog } from "@/components/views/appointment-dialog"
import { NoteDialog } from "@/components/views/note-dialog"
import { PatientFormDialog } from "@/components/views/patient-form-dialog"
import { TransferDialog } from "@/components/views/transfer-dialog"
import { ageFrom, formatDate, formatDateTime, formatTime } from "@/lib/dates"
import { APPOINTMENT_STATUS, APPOINTMENT_TYPE_LABELS, NOTE_STATUS, NOTE_TYPE_LABELS, can, canSeePatient } from "@/lib/permissions"
import { patientNotes } from "@/lib/selectors"
import { fullName, providerTitle, useStore, useUserLookup } from "@/lib/store"
import type { ClinicalNote } from "@/lib/types"

export function PatientRecord({ patientId, onBack }: { patientId: string; onBack: () => void }) {
  const { db, currentUser, currentOrg, actions } = useStore()
  const userById = useUserLookup()
  const [supportReason, setSupportReason] = useState("")
  const [supportUnlocked, setSupportUnlocked] = useState(false)
  const [editing, setEditing] = useState(false)
  const [addingNote, setAddingNote] = useState(false)
  const [correcting, setCorrecting] = useState<ClinicalNote | undefined>()
  const [transferring, setTransferring] = useState(false)
  const [scheduling, setScheduling] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const patient = db.patients.find((p) => p.id === patientId)
  if (!currentUser || !patient || !canSeePatient(currentUser, patient, currentOrg)) {
    return <EmptyState title="Expediente no disponible" action={<Button onClick={onBack}>Volver</Button>} />
  }

  // Soporte puede entrar a todo, pero ver un expediente clínico queda registrado con motivo
  if (currentUser.role === "support" && !supportUnlocked) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Acceso de soporte a expediente clínico</p>
            <p className="text-sm text-slate-500">Datos de salud protegidos. Este acceso queda en la auditoría de la clínica.</p>
          </div>
        </div>
        <Textarea className="mt-4" rows={3} value={supportReason} onChange={(e) => setSupportReason(e.target.value)} placeholder="Motivo (ej. ticket #123: el doctor no puede ver una foto)" />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onBack}>
            Cancelar
          </Button>
          <Button
            disabled={supportReason.trim().length < 10}
            onClick={() => {
              actions.logAudit("Soporte abrió expediente", `${fullName(patient)}: ${supportReason.trim()}`)
              setSupportUnlocked(true)
            }}
            className="bg-amber-500 hover:bg-amber-600"
          >
            Registrar y abrir
          </Button>
        </div>
      </div>
    )
  }

  const notes = patientNotes(db, patient.id)
  const appointments = db.appointments.filter((a) => a.patientId === patient.id).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))
  const transfers = db.transfers.filter((t) => t.patientId === patient.id)
  const provider = userById(patient.providerId)
  const age = ageFrom(patient.dateOfBirth)
  const hasAllergy = patient.allergies && !/ningun/i.test(patient.allergies)
  const lastTransfer = transfers[0]

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" /> Volver a pacientes
      </button>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <Avatar name={fullName(patient)} size={56} />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-slate-900">{fullName(patient)}</h1>
            <p className="text-sm text-slate-500">
              {age !== null ? `${age} años · ` : ""}
              {patient.phone} · Responsable: <span className={provider ? "font-medium text-slate-700" : "font-medium text-amber-600"}>{providerTitle(provider)}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {can.addPatients(currentUser) && (
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                <Pencil className="mr-1.5 h-4 w-4" /> Editar
              </Button>
            )}
            {can.confirmAppointments(currentUser) && (
              <Button variant="outline" size="sm" onClick={() => setScheduling(true)}>
                <CalendarPlus className="mr-1.5 h-4 w-4" /> Agendar
              </Button>
            )}
            {can.transferRecords(currentUser) && (
              <Button variant="outline" size="sm" onClick={() => setTransferring(true)} className={provider ? "" : "border-amber-300 bg-amber-50 text-amber-800"}>
                <ArrowRightLeft className="mr-1.5 h-4 w-4" /> {provider ? "Transferir" : "Asignar responsable"}
              </Button>
            )}
            {can.writeNotes(currentUser) && (
              <Button size="sm" onClick={() => setAddingNote(true)} className="bg-sky-600 hover:bg-sky-700">
                <FilePlus2 className="mr-1.5 h-4 w-4" /> Nueva nota
              </Button>
            )}
          </div>
        </div>
        {hasAllergy && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
            <AlertTriangle className="h-4 w-4" /> Alergias: {patient.allergies}
          </div>
        )}
        {lastTransfer && lastTransfer.toProviderId === currentUser.id && (
          <div className="mt-3 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm">
            <p className="font-semibold text-sky-900">Este expediente te fue transferido el {formatDateTime(lastTransfer.at)}</p>
            <p className="mt-1 text-sky-800">Lee el resumen de entrega en la pestaña “Responsables” antes de la siguiente cita.</p>
          </div>
        )}
      </div>

      <Tabs defaultValue="notes">
        <TabsList className="flex-wrap">
          <TabsTrigger value="notes">Expediente ({notes.length})</TabsTrigger>
          <TabsTrigger value="info">Datos</TabsTrigger>
          <TabsTrigger value="appointments">Citas ({appointments.length})</TabsTrigger>
          <TabsTrigger value="transfers">Responsables ({transfers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="notes" className="mt-4 space-y-4">
          {notes.length === 0 ? (
            <EmptyState title="Sin notas todavía" description="Las notas clínicas aparecerán aquí en orden cronológico." />
          ) : (
            <div className="relative space-y-4 border-l-2 border-sky-100 pl-6">
              {notes.map((n) => (
                <NoteCard key={n.id} note={n} onCorrect={() => setCorrecting(n)} onPreview={setPreview} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="info" className="mt-4">
          <div className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Email" value={patient.email} />
            <Field label="Teléfono" value={patient.phone} />
            <Field label="Fecha de nacimiento" value={patient.dateOfBirth && formatDate(patient.dateOfBirth)} />
            <Field label="Dirección" value={patient.address} />
            <Field label="Contacto de emergencia" value={patient.emergencyContact && `${patient.emergencyContact} · ${patient.emergencyPhone}`} />
            <Field label="Alergias" value={patient.allergies} />
            <div className="sm:col-span-2 lg:col-span-3">
              <Field label="Antecedentes médicos" value={patient.medicalHistory} />
            </div>
            <Field label="Portal del paciente" value={patient.userId ? "Activo" : "Sin cuenta"} />
          </div>
        </TabsContent>

        <TabsContent value="appointments" className="mt-4">
          {appointments.length === 0 ? (
            <EmptyState title="Sin citas" />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {appointments.map((a) => (
                <div key={a.id} className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-0">
                  <div className="w-28 text-sm">
                    <p className="font-medium text-slate-800">{formatDate(a.date)}</p>
                    <p className="text-slate-400">{formatTime(a.time)}</p>
                  </div>
                  <p className="flex-1 text-sm text-slate-600">
                    {APPOINTMENT_TYPE_LABELS[a.type]} · {providerTitle(userById(a.providerId))}
                  </p>
                  <Pill className={APPOINTMENT_STATUS[a.status].className}>{APPOINTMENT_STATUS[a.status].label}</Pill>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="transfers" className="mt-4 space-y-3">
          {transfers.length === 0 ? (
            <EmptyState title="Sin cambios de responsable" description="Cuando el expediente pase a otra persona, aquí quedará el resumen de entrega." />
          ) : (
            transfers.map((t) => (
              <div key={t.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-medium text-slate-700">{providerTitle(userById(t.fromProviderId))}</span>
                  <ArrowRightLeft className="h-4 w-4 text-slate-400" />
                  <span className="font-semibold text-sky-700">{providerTitle(userById(t.toProviderId))}</span>
                  <span className="ml-auto text-xs text-slate-400">
                    {formatDateTime(t.at)} · por {fullName(userById(t.byUserId))}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-500">Motivo: {t.reason}</p>
                {t.summary && <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-slate-50 p-3 font-sans text-sm text-slate-700">{t.summary}</pre>}
                {t.pendingItems && (
                  <div className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
                    <p className="font-medium">Pendientes</p>
                    <p className="whitespace-pre-line">{t.pendingItems}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>

      <PatientFormDialog open={editing} onOpenChange={setEditing} patient={patient} />
      <NoteDialog open={addingNote} onOpenChange={setAddingNote} patientId={patient.id} />
      <NoteDialog open={!!correcting} onOpenChange={(o) => !o && setCorrecting(undefined)} patientId={patient.id} note={correcting} />
      <TransferDialog open={transferring} onOpenChange={setTransferring} patient={patient} />
      <AppointmentDialog open={scheduling} onOpenChange={setScheduling} patientId={patient.id} />
      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-3xl p-2">
          <DialogHeader className="sr-only">
            <DialogTitle>Imagen</DialogTitle>
          </DialogHeader>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {preview && <img src={preview} alt="Adjunto" className="w-full rounded-lg" />}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function NoteCard({ note, onCorrect, onPreview }: { note: ClinicalNote; onCorrect: () => void; onPreview: (src: string) => void }) {
  const { currentUser, actions } = useStore()
  const userById = useUserLookup()
  const [reviewing, setReviewing] = useState<"approve" | "reject" | null>(null)
  const [voiding, setVoiding] = useState(false)
  const [text, setText] = useState("")
  if (!currentUser) return null

  const author = userById(note.authorId)
  const status = NOTE_STATUS[note.status]
  const isAuthor = note.authorId === currentUser.id
  const canReview = can.validateNotes(currentUser) && note.status === "pending_review"
  const canVoid = note.status !== "voided" && (isAuthor || currentUser.role === "support")
  const voided = note.status === "voided"

  return (
    <div className={`relative rounded-2xl border bg-white p-5 shadow-sm ${voided ? "border-slate-200 opacity-60" : "border-slate-200"}`}>
      <span className="absolute -left-[33px] top-6 h-4 w-4 rounded-full border-4 border-white bg-sky-400 shadow" />
      <div className="flex flex-wrap items-center gap-2">
        <Pill className="bg-slate-100 text-slate-700">{NOTE_TYPE_LABELS[note.type]}</Pill>
        <Pill className={status.className}>{status.label}</Pill>
        {note.visibleToPatient && <Pill className="bg-pink-50 text-pink-700">Visible al paciente</Pill>}
        <span className="ml-auto text-xs text-slate-400">{formatDate(note.date)}</span>
      </div>
      <h3 className={`mt-2 text-lg font-semibold text-slate-900 ${voided ? "line-through" : ""}`}>{note.title}</h3>
      <p className="text-xs text-slate-400">
        {providerTitle(author)}
        {author?.role === "student" && author.enrollment ? ` · ${author.enrollment}` : ""}
      </p>
      <p className="mt-3 whitespace-pre-line text-sm text-slate-700">{note.description}</p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {note.diagnosis && <Field label="Diagnóstico" value={note.diagnosis} />}
        {note.treatment && <Field label="Tratamiento" value={note.treatment} />}
        {note.toothNumbers && <Field label="Piezas" value={note.toothNumbers} />}
        {note.medications && <Field label="Medicamentos" value={note.medications} />}
        {note.followUpDate && <Field label="Seguimiento" value={formatDate(note.followUpDate)} />}
      </div>

      {note.visibleToPatient && note.patientSummary && (
        <div className="mt-3 rounded-xl bg-pink-50/60 p-3 text-sm text-slate-700">
          <span className="font-medium text-pink-700">Para el paciente: </span>
          {note.patientSummary}
        </div>
      )}

      {note.attachments.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {note.attachments.map((a) => (
            <button key={a.id} onClick={() => onPreview(a.dataUrl)} className="h-20 w-20 overflow-hidden rounded-lg border hover:ring-2 hover:ring-sky-300">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.dataUrl} alt={a.name} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {note.review && (
        <div className={`mt-3 rounded-xl p-3 text-sm ${note.status === "rejected" ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"}`}>
          <span className="font-medium">{providerTitle(userById(note.review.by))}: </span>
          {note.review.comment || (note.status === "validated" ? "Validada sin comentarios" : "")}
        </div>
      )}
      {note.voided && (
        <div className="mt-3 rounded-xl bg-slate-100 p-3 text-sm text-slate-600">
          Anulada por {fullName(userById(note.voided.by))} el {formatDateTime(note.voided.at)}: {note.voided.reason}
        </div>
      )}

      {(canReview || (isAuthor && note.status === "rejected") || canVoid) && !reviewing && !voiding && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
          {canReview && (
            <>
              <Button size="sm" onClick={() => setReviewing("approve")} className="bg-emerald-600 hover:bg-emerald-700">
                <Check className="mr-1 h-4 w-4" /> Validar
              </Button>
              <Button size="sm" variant="outline" onClick={() => setReviewing("reject")} className="border-red-200 text-red-700 hover:bg-red-50">
                <X className="mr-1 h-4 w-4" /> Pedir correcciones
              </Button>
            </>
          )}
          {isAuthor && note.status === "rejected" && (
            <Button size="sm" variant="outline" onClick={onCorrect}>
              <RotateCcw className="mr-1 h-4 w-4" /> Corregir y reenviar
            </Button>
          )}
          {canVoid && (
            <Button size="sm" variant="ghost" onClick={() => setVoiding(true)} className="ml-auto text-slate-500">
              <Ban className="mr-1 h-4 w-4" /> Anular
            </Button>
          )}
        </div>
      )}

      {(reviewing || voiding) && (
        <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
          <Input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={voiding ? "Motivo de anulación (obligatorio)" : reviewing === "reject" ? "¿Qué debe corregir? (obligatorio)" : "Comentario (opcional)"}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={(voiding || reviewing === "reject") && text.trim().length < 5}
              onClick={() => {
                if (voiding) actions.voidNote(note.id, text.trim())
                else actions.reviewNote(note.id, reviewing === "approve", text.trim())
                setReviewing(null)
                setVoiding(false)
                setText("")
              }}
            >
              Confirmar
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setReviewing(null); setVoiding(false); setText("") }}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

