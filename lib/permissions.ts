import type { AppointmentStatus, AppointmentType, NoteStatus, NoteType, OrgType, Organization, Patient, Role, User } from "./types"

// Matriz de permisos. En Supabase cada regla de aquí se convierte en una política RLS,
// para que no se puedan saltar desde el navegador.

export const ROLE_LABELS: Record<Role, string> = {
  support: "Soporte",
  admin: "Administración",
  dentist: "Dentista",
  teacher: "Maestro",
  student: "Alumno",
  patient: "Paciente",
}

export const ROLE_COLORS: Record<Role, string> = {
  support: "bg-slate-900 text-white",
  admin: "bg-violet-100 text-violet-800",
  dentist: "bg-sky-100 text-sky-800",
  teacher: "bg-amber-100 text-amber-800",
  student: "bg-emerald-100 text-emerald-800",
  patient: "bg-pink-100 text-pink-800",
}

export const ORG_TYPE_LABELS: Record<OrgType, string> = {
  clinic: "Clínica",
  school: "Universidad",
}

// Roles que se pueden dar de alta en cada tipo de organización
export const ROLES_BY_ORG_TYPE: Record<OrgType, Role[]> = {
  clinic: ["admin", "dentist", "patient"],
  school: ["admin", "teacher", "student", "patient"],
}

export const NOTE_TYPE_LABELS: Record<NoteType, string> = {
  examination: "Examen",
  diagnosis: "Diagnóstico",
  treatment: "Tratamiento",
  progress: "Evolución",
  prescription: "Receta",
  referral: "Referencia",
}

export const NOTE_STATUS: Record<NoteStatus, { label: string; className: string }> = {
  final: { label: "Firmada", className: "bg-sky-100 text-sky-800" },
  pending_review: { label: "Por validar", className: "bg-amber-100 text-amber-800" },
  validated: { label: "Validada", className: "bg-emerald-100 text-emerald-800" },
  rejected: { label: "Con correcciones", className: "bg-red-100 text-red-800" },
  voided: { label: "Anulada", className: "bg-slate-200 text-slate-600 line-through" },
}

export const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, string> = {
  consultation: "Consulta",
  cleaning: "Limpieza",
  treatment: "Tratamiento",
  emergency: "Urgencia",
  followup: "Seguimiento",
}

export const APPOINTMENT_STATUS: Record<AppointmentStatus, { label: string; className: string }> = {
  requested: { label: "Solicitada", className: "bg-amber-100 text-amber-800" },
  confirmed: { label: "Confirmada", className: "bg-emerald-100 text-emerald-800" },
  completed: { label: "Atendida", className: "bg-slate-100 text-slate-700" },
  cancelled: { label: "Cancelada", className: "bg-red-100 text-red-700" },
  "no-show": { label: "No asistió", className: "bg-orange-100 text-orange-800" },
}

export const isProvider = (role: Role) => role === "dentist" || role === "student" || role === "teacher"

export const can = {
  manageOrganizations: (u: User) => u.role === "support",
  manageUsers: (u: User) => u.role === "support" || u.role === "admin",
  addPatients: (u: User) => u.role !== "patient",
  writeNotes: (u: User) => isProvider(u.role),
  validateNotes: (u: User) => u.role === "teacher",
  transferRecords: (u: User) => u.role === "support" || u.role === "admin" || u.role === "teacher",
  viewReports: (u: User) => u.role === "support" || u.role === "admin" || u.role === "teacher",
  viewAudit: (u: User) => u.role === "support" || u.role === "admin",
  manageAllSchedules: (u: User) => u.role === "support" || u.role === "admin",
  confirmAppointments: (u: User) => u.role !== "patient",
}

// Qué pacientes puede ver cada quien dentro de su organización
export const canSeePatient = (u: User, patient: Patient, org: Organization | undefined) => {
  if (u.role === "support") return true
  if (u.orgId !== patient.orgId) return false
  switch (u.role) {
    case "admin":
    case "teacher":
      return true
    case "dentist":
      return org?.doctorsSeeAllPatients || patient.providerId === u.id
    case "student":
      return patient.providerId === u.id
    case "patient":
      return patient.userId === u.id
  }
}

// Las notas de alumnos deben validarlas un maestro antes de contar como definitivas
export const initialNoteStatus = (author: User): NoteStatus => (author.role === "student" ? "pending_review" : "final")
