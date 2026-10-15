import { daysFromToday } from "./dates"
import type { ClinicalNote, Database, Patient, User, WeeklySchedule } from "./types"

export const DB_VERSION = 3

const weekdays = (start: string, end: string, saturday?: [string, string]): WeeklySchedule => [
  null,
  { start, end },
  { start, end },
  { start, end },
  { start, end },
  { start, end },
  saturday ? { start: saturday[0], end: saturday[1] } : null,
]

// Cuentas de prueba que aparecen como botones en el login
// `mode` decide en qué versión del login aparece (clínicas o universidades)
export const DEMO_ACCOUNTS: { email: string; password: string; hint: string; mode: "clinic" | "school" | "both" }[] = [
  { email: "soporte@dentalcare.app", password: "soporte123", hint: "Equipo de desarrollo", mode: "both" },
  { email: "admin@sonrisa.mx", password: "admin123", hint: "Clínica Sonrisa", mode: "clinic" },
  { email: "dra.martinez@sonrisa.mx", password: "doctor123", hint: "Clínica Sonrisa", mode: "clinic" },
  { email: "dr.ruiz@sonrisa.mx", password: "doctor123", hint: "Clínica Sonrisa", mode: "clinic" },
  { email: "maria@paciente.mx", password: "paciente123", hint: "Clínica Sonrisa", mode: "clinic" },
  { email: "admin@escuela.mx", password: "admin123", hint: "Facultad de Odontología", mode: "school" },
  { email: "maestro@escuela.mx", password: "maestro123", hint: "Facultad de Odontología", mode: "school" },
  { email: "alumno@escuela.mx", password: "alumno123", hint: "Facultad de Odontología", mode: "school" },
  { email: "alumno2@escuela.mx", password: "alumno123", hint: "Facultad de Odontología", mode: "school" },
]

export function createSeed(): Database {
  const now = new Date().toISOString()
  const CLINIC = "org_sonrisa"
  const SCHOOL = "org_escuela"

  const users: User[] = [
    { id: "u_support", orgId: null, email: "soporte@dentalcare.app", password: "soporte123", firstName: "Equipo", lastName: "Soporte", role: "support", active: true, createdAt: now },
    { id: "u_admin_c", orgId: CLINIC, email: "admin@sonrisa.mx", password: "admin123", firstName: "Laura", lastName: "Mendoza", role: "admin", active: true, phone: "722 100 2000", createdAt: now },
    { id: "u_dent1", orgId: CLINIC, email: "dra.martinez@sonrisa.mx", password: "doctor123", firstName: "Ana", lastName: "Martínez", role: "dentist", active: true, specialty: "Endodoncia", licenseNumber: "CED-1234567", phone: "722 345 6789", schedule: weekdays("09:00", "17:00", ["09:00", "13:00"]), createdAt: now },
    { id: "u_dent2", orgId: CLINIC, email: "dr.ruiz@sonrisa.mx", password: "doctor123", firstName: "Luis", lastName: "Ruiz", role: "dentist", active: true, specialty: "Ortodoncia", licenseNumber: "CED-7654321", phone: "722 456 7890", schedule: weekdays("10:00", "18:00"), createdAt: now },
    { id: "u_pat1", orgId: CLINIC, email: "maria@paciente.mx", password: "paciente123", firstName: "María", lastName: "González", role: "patient", active: true, createdAt: now },
    { id: "u_admin_s", orgId: SCHOOL, email: "admin@escuela.mx", password: "admin123", firstName: "Patricia", lastName: "Vega", role: "admin", active: true, createdAt: now },
    { id: "u_teacher", orgId: SCHOOL, email: "maestro@escuela.mx", password: "maestro123", firstName: "Jorge", lastName: "Herrera", role: "teacher", active: true, specialty: "Periodoncia", licenseNumber: "CED-1112223", schedule: weekdays("08:00", "14:00"), createdAt: now },
    { id: "u_stud1", orgId: SCHOOL, email: "alumno@escuela.mx", password: "alumno123", firstName: "Sofía", lastName: "Ramírez", role: "student", active: true, enrollment: "OD-2023-014", supervisorId: "u_teacher", schedule: weekdays("08:00", "13:00"), createdAt: now },
    { id: "u_stud2", orgId: SCHOOL, email: "alumno2@escuela.mx", password: "alumno123", firstName: "Diego", lastName: "Torres", role: "student", active: true, enrollment: "OD-2023-027", supervisorId: "u_teacher", schedule: weekdays("08:00", "13:00"), createdAt: now },
  ]

  const patient = (p: Omit<Patient, "status" | "createdAt" | "emergencyContact" | "emergencyPhone" | "address"> & Partial<Patient>): Patient => ({
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
    status: "active",
    createdAt: now,
    ...p,
  })

  const patients: Patient[] = [
    patient({ id: "p1", orgId: CLINIC, userId: "u_pat1", firstName: "María", lastName: "González", email: "maria@paciente.mx", phone: "722 123 4567", dateOfBirth: "1985-03-15", address: "Av. Independencia 123, Toluca", allergies: "Penicilina", medicalHistory: "Hipertensión controlada", emergencyContact: "Juan González", emergencyPhone: "722 123 4568", providerId: "u_dent1" }),
    patient({ id: "p2", orgId: CLINIC, firstName: "Carlos", lastName: "Rodríguez", email: "carlos@correo.mx", phone: "722 234 5678", dateOfBirth: "1978-07-22", address: "Calle Hidalgo 45, Metepec", allergies: "Ninguna conocida", medicalHistory: "Diabetes tipo 2", providerId: "u_dent2" }),
    patient({ id: "p3", orgId: CLINIC, firstName: "Lucía", lastName: "Fernández", email: "lucia@correo.mx", phone: "722 987 6543", dateOfBirth: "2001-11-02", allergies: "Látex", medicalHistory: "Sin antecedentes relevantes", providerId: "u_dent1" }),
    patient({ id: "p4", orgId: SCHOOL, firstName: "Pedro", lastName: "Sánchez", email: "pedro@correo.mx", phone: "722 555 0101", dateOfBirth: "1990-05-10", allergies: "Ninguna conocida", medicalHistory: "Fumador", providerId: "u_stud1" }),
    patient({ id: "p5", orgId: SCHOOL, firstName: "Ana", lastName: "López", email: "ana@correo.mx", phone: "722 555 0102", dateOfBirth: "1996-08-19", allergies: "Ibuprofeno", medicalHistory: "Asma leve", providerId: "u_stud1" }),
    patient({ id: "p6", orgId: SCHOOL, firstName: "Roberto", lastName: "Díaz", email: "roberto@correo.mx", phone: "722 555 0103", dateOfBirth: "1969-01-30", allergies: "Ninguna conocida", medicalHistory: "Hipertensión", providerId: "u_stud2" }),
  ]

  const note = (n: Omit<ClinicalNote, "attachments" | "createdAt" | "updatedAt" | "visibleToPatient"> & Partial<ClinicalNote>): ClinicalNote => ({
    attachments: [],
    visibleToPatient: false,
    createdAt: now,
    updatedAt: now,
    ...n,
  })

  const notes: ClinicalNote[] = [
    note({ id: "n1", orgId: CLINIC, patientId: "p1", authorId: "u_dent1", date: daysFromToday(-30), type: "examination", title: "Revisión general", description: "Examen completo de la cavidad oral. Caries en pieza 16. Encías en buen estado.", diagnosis: "Caries en pieza 16", treatment: "Obturación con resina", toothNumbers: "16", status: "final", visibleToPatient: true, patientSummary: "Encontramos una caries en una muela superior derecha. La vamos a tratar con una resina." }),
    note({ id: "n2", orgId: CLINIC, patientId: "p1", authorId: "u_dent1", date: daysFromToday(-14), type: "treatment", title: "Endodoncia pieza 16", description: "Tratamiento de conductos bajo anestesia local. Se coloca corona temporal.", diagnosis: "Pulpitis irreversible", treatment: "Endodoncia + corona temporal", medications: "Ibuprofeno 400 mg c/8 h por 3 días", toothNumbers: "16", followUpDate: daysFromToday(5), status: "final", visibleToPatient: true, patientSummary: "Se hizo la endodoncia y quedó una corona temporal. Toma el medicamento 3 días y regresa a revisión." }),
    note({ id: "n3", orgId: CLINIC, patientId: "p2", authorId: "u_dent2", date: daysFromToday(-20), type: "diagnosis", title: "Valoración de ortodoncia", description: "Apiñamiento anteroinferior moderado. Se solicitan radiografías panorámica y lateral de cráneo.", diagnosis: "Maloclusión clase I con apiñamiento", followUpDate: daysFromToday(2), status: "final" }),
    note({ id: "n4", orgId: SCHOOL, patientId: "p4", authorId: "u_stud1", date: daysFromToday(-10), type: "examination", title: "Historia clínica inicial", description: "Paciente fumador, sangrado al sondeo generalizado. Bolsas de 4-5 mm en sector posterior.", diagnosis: "Periodontitis estadio II", status: "validated", review: { by: "u_teacher", at: now, comment: "Buen registro. Agregar índice de placa en la siguiente cita." } }),
    note({ id: "n5", orgId: SCHOOL, patientId: "p4", authorId: "u_stud1", date: daysFromToday(-2), type: "treatment", title: "Raspado y alisado cuadrante 1", description: "Se realiza raspado y alisado radicular en cuadrante 1 con anestesia local.", treatment: "RAR cuadrante 1", toothNumbers: "14,15,16,17", followUpDate: daysFromToday(7), status: "pending_review" }),
    note({ id: "n6", orgId: SCHOOL, patientId: "p6", authorId: "u_stud2", date: daysFromToday(-3), type: "diagnosis", title: "Diagnóstico pieza 36", description: "Dolor a la percusión en pieza 36.", diagnosis: "Absceso periapical", status: "rejected", review: { by: "u_teacher", at: now, comment: "Falta prueba de vitalidad y radiografía periapical antes de confirmar el diagnóstico." } }),
  ]

  return {
    version: DB_VERSION,
    organizations: [
      { id: CLINIC, name: "Clínica Dental Sonrisa", type: "clinic", city: "Toluca", doctorsSeeAllPatients: false, autoConfirmPatientBookings: false, createdAt: now },
      { id: SCHOOL, name: "Facultad de Odontología (demo)", type: "school", city: "Toluca", doctorsSeeAllPatients: false, autoConfirmPatientBookings: false, createdAt: now },
    ],
    users,
    patients,
    notes,
    appointments: [
      { id: "a1", orgId: CLINIC, patientId: "p1", providerId: "u_dent1", date: daysFromToday(1), time: "10:00", duration: 60, type: "followup", status: "confirmed", notes: "Revisión de endodoncia", createdBy: "u_admin_c", createdAt: now },
      { id: "a2", orgId: CLINIC, patientId: "p2", providerId: "u_dent2", date: daysFromToday(2), time: "14:30", duration: 45, type: "consultation", status: "confirmed", notes: "Revisar radiografías", createdBy: "u_admin_c", createdAt: now },
      { id: "a3", orgId: CLINIC, patientId: "p3", providerId: "u_dent1", date: daysFromToday(3), time: "12:00", duration: 30, type: "cleaning", status: "requested", createdBy: "u_admin_c", createdAt: now },
      { id: "a4", orgId: SCHOOL, patientId: "p4", providerId: "u_stud1", date: daysFromToday(1), time: "09:00", duration: 90, type: "treatment", status: "confirmed", notes: "RAR cuadrante 2", createdBy: "u_admin_s", createdAt: now },
      { id: "a5", orgId: SCHOOL, patientId: "p6", providerId: "u_stud2", date: daysFromToday(2), time: "10:00", duration: 60, type: "consultation", status: "confirmed", createdBy: "u_admin_s", createdAt: now },
    ],
    transfers: [],
    audit: [],
    notifications: [
      { id: "nt1", userId: "u_pat1", title: "¡Bienvenida a tu portal!", body: "Aquí puedes ver tus citas, tu tratamiento y agendar nuevas visitas.", at: now, read: false },
      { id: "nt2", userId: "u_teacher", title: "Nota por validar", body: "Sofía Ramírez envió “Raspado y alisado cuadrante 1”.", at: now, read: false },
    ],
  }
}
