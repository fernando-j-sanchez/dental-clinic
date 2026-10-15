// Modelo de datos de DentalCare. Está pensado para pasar 1:1 a tablas de Supabase:
// cada interfaz es una tabla y `orgId` es la columna que separa a cada clínica/escuela (RLS).

export type OrgType = "clinic" | "school"

export type Role = "support" | "admin" | "dentist" | "teacher" | "student" | "patient"

export interface Organization {
  id: string
  name: string
  type: OrgType
  city: string
  // Si es false, cada dentista solo ve a sus propios pacientes
  doctorsSeeAllPatients: boolean
  // Si es true, las citas que pide el paciente se confirman solas
  autoConfirmPatientBookings: boolean
  createdAt: string
}

export interface DaySchedule {
  start: string // "09:00"
  end: string // "17:00"
}

// Índice = día de la semana de Date#getDay() (0 = domingo)
export type WeeklySchedule = (DaySchedule | null)[]

export interface User {
  id: string
  orgId: string | null // null = equipo de soporte (ve todas las organizaciones)
  email: string
  password: string // solo demo: en Supabase esto lo maneja Auth
  firstName: string
  lastName: string
  role: Role
  active: boolean
  phone?: string
  specialty?: string
  licenseNumber?: string
  enrollment?: string // matrícula del alumno
  supervisorId?: string // maestro que valida a este alumno
  schedule?: WeeklySchedule
  createdAt: string
}

export interface Patient {
  id: string
  orgId: string
  userId?: string // cuenta del portal del paciente
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  address: string
  allergies: string
  medicalHistory: string
  emergencyContact: string
  emergencyPhone: string
  providerId: string // dentista o alumno responsable del expediente
  status: "active" | "inactive"
  createdAt: string
}

export type NoteType = "examination" | "diagnosis" | "treatment" | "progress" | "prescription" | "referral"

// final: nota de dentista titulado
// pending_review → validated | rejected: flujo de alumno ↔ maestro
// voided: anulada (el expediente no se borra, NOM-004)
export type NoteStatus = "final" | "pending_review" | "validated" | "rejected" | "voided"

export interface Attachment {
  id: string
  name: string
  dataUrl: string
  uploadedBy: string
  uploadedAt: string
}

export interface ClinicalNote {
  id: string
  orgId: string
  patientId: string
  authorId: string
  date: string
  type: NoteType
  title: string
  description: string
  diagnosis?: string
  treatment?: string
  medications?: string
  toothNumbers?: string
  followUpDate?: string
  visibleToPatient: boolean
  patientSummary?: string // lo que ve el paciente, en lenguaje sencillo
  status: NoteStatus
  review?: { by: string; at: string; comment: string }
  voided?: { by: string; at: string; reason: string }
  attachments: Attachment[]
  createdAt: string
  updatedAt: string
}

export type AppointmentType = "consultation" | "cleaning" | "treatment" | "emergency" | "followup"

export type AppointmentStatus = "requested" | "confirmed" | "completed" | "cancelled" | "no-show"

export interface Appointment {
  id: string
  orgId: string
  patientId: string
  providerId: string
  date: string // "YYYY-MM-DD"
  time: string // "HH:mm"
  duration: number
  type: AppointmentType
  status: AppointmentStatus
  notes?: string
  createdBy: string
  createdAt: string
}

export interface Transfer {
  id: string
  orgId: string
  patientId: string
  fromProviderId: string
  toProviderId: string
  reason: string
  summary: string
  pendingItems: string
  byUserId: string
  at: string
}

export interface AuditEntry {
  id: string
  orgId: string | null
  userId: string
  action: string
  detail: string
  at: string
}

export interface AppNotification {
  id: string
  userId: string
  title: string
  body: string
  at: string
  read: boolean
}

export interface Database {
  version: number
  organizations: Organization[]
  users: User[]
  patients: Patient[]
  notes: ClinicalNote[]
  appointments: Appointment[]
  transfers: Transfer[]
  audit: AuditEntry[]
  notifications: AppNotification[]
}
