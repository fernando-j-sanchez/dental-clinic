import { formatDate, formatTime, todayKey } from "./dates"
import { NOTE_STATUS } from "./permissions"
import type { Database, Patient } from "./types"

// Borrador automático del resumen de entrega cuando un expediente cambia de responsable.
// Quien transfiere lo revisa y completa antes de guardarlo.
export function buildHandoffSummary(db: Database, patient: Patient) {
  const notes = db.notes
    .filter((n) => n.patientId === patient.id && n.status !== "voided")
    .sort((a, b) => b.date.localeCompare(a.date))

  const lines: string[] = []
  lines.push(`Paciente: ${patient.firstName} ${patient.lastName}`)
  if (patient.allergies && !/ningun/i.test(patient.allergies)) lines.push(`⚠ Alergias: ${patient.allergies}`)
  if (patient.medicalHistory) lines.push(`Antecedentes: ${patient.medicalHistory}`)

  const lastDiagnosis = notes.find((n) => n.diagnosis)
  if (lastDiagnosis) lines.push(`Último diagnóstico (${formatDate(lastDiagnosis.date)}): ${lastDiagnosis.diagnosis}`)

  const lastTreatment = notes.find((n) => n.treatment)
  if (lastTreatment) lines.push(`Último tratamiento (${formatDate(lastTreatment.date)}): ${lastTreatment.treatment}`)

  const medications = notes.find((n) => n.medications)
  if (medications) lines.push(`Medicación indicada: ${medications.medications}`)

  if (notes.length) {
    lines.push("")
    lines.push("Notas recientes:")
    notes.slice(0, 3).forEach((n) => lines.push(`• ${formatDate(n.date)} · ${n.title} [${NOTE_STATUS[n.status].label}]`))
  }

  const today = todayKey()
  const pending: string[] = []
  notes
    .filter((n) => n.followUpDate && n.followUpDate >= today)
    .forEach((n) => pending.push(`Seguimiento ${formatDate(n.followUpDate!)}: ${n.title}`))
  notes.filter((n) => n.status === "pending_review").forEach((n) => pending.push(`Nota sin validar: ${n.title}`))
  notes.filter((n) => n.status === "rejected").forEach((n) => pending.push(`Nota con correcciones pendientes: ${n.title}`))
  db.appointments
    .filter((a) => a.patientId === patient.id && a.date >= today && (a.status === "confirmed" || a.status === "requested"))
    .forEach((a) => pending.push(`Cita ${formatDate(a.date)} ${formatTime(a.time)}`))

  return { summary: lines.join("\n"), pendingItems: pending.join("\n") }
}
